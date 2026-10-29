"""SQLite Implementation of User Personal Memory Graph."""

import asyncio
import json
import logging
import sqlite3
import time
from pathlib import Path
from typing import Optional, List

from metta_core.storage.interfaces import (
    BaseMemoryStore,
    UserMemoryGraph,
    UserPatternNode,
)

logger = logging.getLogger("metta.storage.sqlite")

DEFAULT_DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "metta_memory.db"


class SQLiteMemoryStore(BaseMemoryStore):
    """Local, sovereign SQLite store for personal memory graphs."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = Path(db_path) if db_path else DEFAULT_DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Create tables if they do not exist."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS user_memory_graphs (
                    user_id TEXT PRIMARY KEY,
                    email TEXT,
                    growth_milestones TEXT,
                    total_turns INTEGER DEFAULT 0,
                    created_at REAL,
                    updated_at REAL
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS user_pattern_nodes (
                    user_id TEXT,
                    pattern_id TEXT,
                    knot_category TEXT,
                    observed_tendency TEXT,
                    effective_principles TEXT,
                    occurrence_count INTEGER DEFAULT 1,
                    last_observed_timestamp REAL,
                    PRIMARY KEY (user_id, pattern_id)
                )
                """
            )
            conn.commit()
            logger.info("Initialized SQLite personal memory store at %s", self.db_path)

    async def get_user_graph(self, user_id: str) -> UserMemoryGraph:
        """Retrieve user's personal memory graph asynchronously."""
        return await asyncio.to_thread(self._sync_get_user_graph, user_id)

    def _sync_get_user_graph(self, user_id: str) -> UserMemoryGraph:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_id, email, growth_milestones, total_turns, created_at, updated_at "
                "FROM user_memory_graphs WHERE user_id = ?",
                (user_id,),
            )
            row = cursor.fetchone()

            if not row:
                now = time.time()
                return UserMemoryGraph(
                    user_id=user_id,
                    email=None,
                    patterns=[],
                    growth_milestones=[],
                    total_turns=0,
                    created_at=now,
                    updated_at=now,
                )

            cursor.execute(
                "SELECT pattern_id, knot_category, observed_tendency, effective_principles, "
                "occurrence_count, last_observed_timestamp "
                "FROM user_pattern_nodes WHERE user_id = ? ORDER BY occurrence_count DESC",
                (user_id,),
            )
            pattern_rows = cursor.fetchall()

            patterns = []
            for p_row in pattern_rows:
                principles = json.loads(p_row["effective_principles"] or "[]")
                patterns.append(
                    UserPatternNode(
                        pattern_id=p_row["pattern_id"],
                        knot_category=p_row["knot_category"],
                        observed_tendency=p_row["observed_tendency"],
                        effective_principles=principles,
                        occurrence_count=p_row["occurrence_count"],
                        last_observed_timestamp=p_row["last_observed_timestamp"],
                    )
                )

            milestones = json.loads(row["growth_milestones"] or "[]")

            return UserMemoryGraph(
                user_id=row["user_id"],
                email=row["email"],
                patterns=patterns,
                growth_milestones=milestones,
                total_turns=row["total_turns"],
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )

    async def record_interaction(
        self,
        user_id: str,
        knot: str,
        need: str,
        principle_used: Optional[str] = None,
        summary: Optional[str] = None,
        email: Optional[str] = None,
    ) -> None:
        """Update user's personal memory graph asynchronously."""
        await asyncio.to_thread(
            self._sync_record_interaction,
            user_id,
            knot,
            need,
            principle_used,
            summary,
            email,
        )

    def _sync_record_interaction(
        self,
        user_id: str,
        knot: str,
        need: str,
        principle_used: Optional[str] = None,
        summary: Optional[str] = None,
        email: Optional[str] = None,
    ) -> None:
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # 1. Upsert user graph record
            cursor.execute(
                "SELECT user_id, email, growth_milestones, total_turns, created_at FROM user_memory_graphs WHERE user_id = ?",
                (user_id,),
            )
            row = cursor.fetchone()

            if row:
                milestones: List[str] = json.loads(row["growth_milestones"] or "[]")
                total_turns = row["total_turns"] + 1
                curr_email = email or row["email"]

                cursor.execute(
                    "UPDATE user_memory_graphs SET total_turns = ?, updated_at = ?, email = ? WHERE user_id = ?",
                    (total_turns, now, curr_email, user_id),
                )
            else:
                milestones = []
                total_turns = 1
                cursor.execute(
                    "INSERT INTO user_memory_graphs (user_id, email, growth_milestones, total_turns, created_at, updated_at) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, email, json.dumps([]), total_turns, now, now),
                )

            # 2. Upsert pattern node
            clean_knot = knot.strip().lower()
            pattern_id = f"pattern:{clean_knot.replace(' ', '_')}"

            cursor.execute(
                "SELECT pattern_id, effective_principles, occurrence_count, observed_tendency "
                "FROM user_pattern_nodes WHERE user_id = ? AND pattern_id = ?",
                (user_id, pattern_id),
            )
            p_row = cursor.fetchone()

            if p_row:
                count = p_row["occurrence_count"] + 1
                principles: List[str] = json.loads(p_row["effective_principles"] or "[]")
                if principle_used and principle_used not in principles:
                    principles.append(principle_used)

                tendency = summary or p_row["observed_tendency"]

                cursor.execute(
                    "UPDATE user_pattern_nodes SET occurrence_count = ?, last_observed_timestamp = ?, "
                    "effective_principles = ?, observed_tendency = ? "
                    "WHERE user_id = ? AND pattern_id = ?",
                    (count, now, json.dumps(principles), tendency, user_id, pattern_id),
                )

                # Distill milestone if pattern recurs significantly
                if count == 3:
                    new_milestone = f"Recognized recurring tendency around '{clean_knot}' (observed 3 times); anchored with {principle_used or 'mindful pause'}."
                    if new_milestone not in milestones:
                        milestones.append(new_milestone)
                        cursor.execute(
                            "UPDATE user_memory_graphs SET growth_milestones = ? WHERE user_id = ?",
                            (json.dumps(milestones), user_id),
                        )
            else:
                principles = [principle_used] if principle_used else []
                tendency = summary or f"Recurring friction around {clean_knot}; core need is {need}."
                cursor.execute(
                    "INSERT INTO user_pattern_nodes (user_id, pattern_id, knot_category, observed_tendency, "
                    "effective_principles, occurrence_count, last_observed_timestamp) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (user_id, pattern_id, clean_knot, tendency, json.dumps(principles), 1, now),
                )

            conn.commit()

    async def clear_user_graph(self, user_id: str) -> bool:
        """Sovereign purge: completely erase user graph and patterns."""
        return await asyncio.to_thread(self._sync_clear_user_graph, user_id)

    def _sync_clear_user_graph(self, user_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_pattern_nodes WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM user_memory_graphs WHERE user_id = ?", (user_id,))
            conn.commit()
            logger.info("Cleared personal memory graph for user '%s'", user_id)
            return True
