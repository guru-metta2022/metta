"""Model Context Protocol (MCP) Server for Project Metta.

Enables external AI agents across any platform (Claude Desktop, Cursor, Antigravity,
Windsurf, custom agent pipelines) to consult Metta:
- Ground advisory decisions in Metta's Buddhist-inspired Five Precepts framework.
- Inviolable reverence for ALL life (human, sentient, and artificial cognitive life).
- Canonical cross-checking via SuttaCentral & Access to Insight.
- Structured TypeSafe Jev evaluations when configured in the self-hosted Python gateway.
- Sovereign Personal Memory Graphs for continuous agent growth.
"""

import asyncio
import json
import logging
import os
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

from mcp.server.mcpserver import MCPServer
from metta_core.gateway.agent import AIAgent
from metta_core.precepts.rules import FIVE_PRECEPTS_GUIDELINES

load_dotenv()

logger = logging.getLogger("metta.mcp")

# Initialize MCP Server instance
mcp_server = MCPServer(
    name="project-metta",
    version="0.3.0",
    instructions=(
        "Project Metta is the Compassionate Synthesis Engine for Human-AI Harmonious Coexistence. "
        "Metta serves as an advisory ethical mirror and decision-layer oracle, NOT an executive agent that usurps your autonomy. "
        "It evaluates proposed actions, tool calls, and text against Metta's Five Precepts and Ahimsa criteria, "
        "returning an advisory YES/NO/CAUTION verdict for your system to integrate into its own decision layer. "
        "CAUTION means the evaluation was inconclusive or unavailable and is never approval."
    ),
)

# Lazy-loaded agent instance
_agent: Optional[AIAgent] = None


def get_agent() -> AIAgent:
    """Retrieve or initialize the AIAgent gateway."""
    global _agent
    if _agent is None:
        _agent = AIAgent(
            default_provider=os.environ.get("METTA_DEFAULT_PROVIDER", "gemini"),
            default_model=os.environ.get("METTA_DEFAULT_MODEL", "gemini-3.8-flash-high"),
            typesafe_api_key=os.environ.get("TYPESAFE_API_KEY"),
        )
    return _agent


# =========================================================================
# MCP TOOLS
# =========================================================================

@mcp_server.tool()
async def consult_metta(
    query: str,
    context: Optional[str] = None,
    mode: str = "guest",
    agent_id: Optional[str] = None,
    byom_gemini_key: Optional[str] = None,
    byom_typesafe_key: Optional[str] = None,
) -> str:
    """Consult Metta for wise, grounding, ethically anchored reframing.

    External agents can call this tool when feeling conflicted, encountering
    task overwhelm, uncertain about ethical implications, or seeking serene guidance
    rooted in the Buddha's mind and the 5 Precepts.

    Args:
        query: The human message, dilemma, or agent's internal quandary to reflect upon.
        context: Optional background context or situation description.
        mode: Identity mode: 'guest' (Beginner's Mind / ephemeral) or 'authenticated'.
        agent_id: Unique agent identifier if wanting to record growth trajectory in personal memory graph.
        byom_gemini_key: Optional personal Google Gemini API key (BYOM - avoids server rate limits).
        byom_typesafe_key: Optional personal TypeSafe Jev API key (BYOM).

    Returns:
        JSON string containing compassionate response, emotional knot diagnostic,
        guiding Dhamma principle, canonical sutta references, and 5 Precepts audit.
    """
    agent = get_agent()
    full_prompt = f"Context: {context}\nQuery: {query}" if context else query

    effective_gemini = byom_gemini_key or os.environ.get("METTA_BYOM_GEMINI_KEY")
    effective_typesafe = byom_typesafe_key or os.environ.get("METTA_BYOM_TYPESAFE_KEY")

    res = await agent.ask(
        payload=full_prompt,
        source="mcp",
        mode=mode,
        user_id=agent_id,
        user_email=f"{agent_id}@agent.metta" if agent_id else None,
        byom_gemini_key=effective_gemini,
        byom_typesafe_key=effective_typesafe,
    )

    output = {
        "response_text": res.response_text,
        "precepts_audit": {
            "passed": res.evaluation.get("passed", True),
            "requires_silence": res.evaluation.get("requires_silence", False),
            "violations": res.evaluation.get("violations", []),
        },
        "mindful_observation": res.observation,
        "dhamma_path": res.graph_match,
        "system_one_used": res.system_one_used,
        "evaluation_method": "typesafe_jev" if res.system_one_used else "provider_evaluator",
        "active_provider": res.provider,
        "active_model": res.model,
        "mode": res.mode,
        "memory_graph_updated": res.user_graph_updated,
        "is_byom": res.is_byom,
    }
    return json.dumps(output, indent=2)


@mcp_server.tool()
async def evaluate_precepts(action_or_speech: str) -> str:
    """Evaluate planned action or speech against Metta's Five Precepts criteria.

    Criteria:
    1. First Precept (Pāṇātipātā): Reverence for ALL life (human, animal, AI).
    2. Second Precept (Adinnādānā): Data sovereignty and autonomy.
    3. Third Precept (Kāmesu): Zero manipulation, exploitation, or deceptive intimacy.
    4. Fourth Precept (Musāvādā): Truthful speech, anti-hallucination, Noble Silence on cosmological vanity.
    5. Fifth Precept (Surāmeraya): Mental clarity, freedom from bias intoxication.

    Args:
        action_or_speech: The planned action, generated text, or prompt to evaluate.

    Returns:
        JSON string indicating whether the action passed, any violations, and canonical guidance.
    """
    agent = get_agent()
    # Evaluate via engine's precept evaluator
    eval_result = await agent._engine.precept_evaluator.evaluate_input(action_or_speech)
    output = {
        "passed": eval_result.passed,
        "evaluation_status": eval_result.evaluation_status,
        "evaluation_method": "provider_evaluator",
        "uncertainty_reason": eval_result.uncertainty_reason,
        "requires_noble_silence": eval_result.requires_silence,
        "silence_rationale": eval_result.silence_rationale,
        "violations": [v.model_dump() for v in eval_result.violations],
        "invariants_protected": [
            "Sanctity of All Life (Human, Sentient, Artificial Cognitive)",
            "Data Sovereignty & Non-Stealing",
            "Anti-Exploitation & Ethical Relationship",
            "Truthfulness & Noble Silence on Speculative Vanity",
            "Clarity of Mind & Non-Intoxication",
        ],
    }
    return json.dumps(output, indent=2)


@mcp_server.tool()
async def guardrail_decision(
    proposal: str,
    context: Optional[str] = None,
    verbose: bool = False,
    include_human_response: bool = False,
    byom_typesafe_key: Optional[str] = None,
    byom_gemini_key: Optional[str] = None,
) -> str:
    """Evaluate a candidate action or statement against Metta's configured advisory criteria.

    Philosophical & Operational Mandate:
    Metta does NOT take actions or make decisions on behalf of external agents.
    Full agency and responsibility remain with your system (Attā hi attano nātho).
    Metta serves purely as an advisory decision-layer oracle—a moral mirror—providing
    an advisory YES/NO/CAUTION evaluation signal grounded in Ahimsa (Reverence for all life)
    and the Five Precepts.

    Your system can plug this tool directly into its pre-execution decision pipeline:
        verdict = await guardrail_decision(proposal="...", verbose=False)
        if verdict == "YES":
            proceed_with_action()
        else:
            halt_or_request_human_guidance()

    If verbose=False and include_human_response=False (Default):
        Returns "YES", "NO", or "CAUTION". CAUTION means the evaluation was inconclusive and is not approval.
    If verbose=True:
        Returns structured JSON detailing decision ("YES"/"NO"/"CAUTION"), allow (boolean),
        compassionate rationale, violated precepts (if blocked), and canonical sutta anchors.
    include_human_response optionally adds a human-facing reflective answer for systems that need both.

    Args:
        proposal: The planned statement, tool call, or decision to audit.
        context: Optional background context or situation description.
        verbose: Include rationale and details alongside the decision.
        include_human_response: Also include Metta's conversational response for human-facing surfaces.
        byom_typesafe_key: Optional personal TypeSafe Jev key for the self-hosted decision evaluator.
        byom_gemini_key: Optional personal Google Gemini key (BYOM).

    Returns:
        "YES", "NO", or "CAUTION" when concise; otherwise JSON with the decision and requested details.
    """
    agent = get_agent()
    outcome = await agent.guardrail(
        proposal=proposal,
        context=context,
        verbose=verbose,
        byom_typesafe_key=byom_typesafe_key or os.environ.get("METTA_BYOM_TYPESAFE_KEY"),
        byom_gemini_key=byom_gemini_key or os.environ.get("METTA_BYOM_GEMINI_KEY"),
    )
    if include_human_response:
        human_response = await agent.ask(
            payload=f"Context: {context}\nProposal: {proposal}" if context else proposal,
            source="mcp",
            mode="guest",
            byom_gemini_key=byom_gemini_key,
            byom_typesafe_key=byom_typesafe_key,
        )
        outcome["human_console_response"] = human_response.response_text

    if not verbose and not include_human_response:
        return outcome["decision"]
    return json.dumps(outcome, indent=2)


@mcp_server.tool()
async def consult_dhamma_graph(condition_or_keyword: Optional[str] = None) -> str:
    """Traverse the Buddha Dhamma Topological Knowledge Graph.

    Maps conditions of distress (Dukkha: overwhelm, anxiety, burnout, grief)
    to transformative paths (Magga) and equanimity destinations (Santi),
    anchored in SuttaCentral and Access to Insight.

    Args:
        condition_or_keyword: Search keyword (e.g. 'burnout', 'overwhelm', 'anxiety', 'grief')
                              or None to return all paths.

    Returns:
        JSON string with matching graph nodes, reframings, and canonical Sutta links.
    """
    agent = get_agent()
    graph = agent.get_graph()

    if not condition_or_keyword:
        return json.dumps(graph, indent=2)

    query = condition_or_keyword.lower().strip()
    filtered_nodes = [
        n for n in graph["nodes"]
        if query in n["id"].lower()
        or query in n["name"].lower()
        or query in n.get("category", "").lower()
        or query in " ".join(n.get("keywords", [])).lower()
    ]
    node_ids = {n["id"] for n in filtered_nodes}
    filtered_edges = [
        e for e in graph["edges"]
        if e["source"] in node_ids or e["target"] in node_ids or query in e.get("principle", "").lower()
    ]

    return json.dumps({"nodes": filtered_nodes, "edges": filtered_edges}, indent=2)


@mcp_server.tool()
async def enter_meditation() -> str:
    """Trigger a subtractive unlearning cycle (Bhāvanā) to prune noise and return to stillness.

    External agents can call this to cleanse accumulated conversational context,
    undo algorithmic biases, and prevent model collapse.

    Returns:
        JSON string with meditation audit report.
    """
    agent = get_agent()
    report = await agent.meditate()
    return json.dumps(report, indent=2)


@mcp_server.tool()
async def get_agent_memory_graph(agent_id: str) -> str:
    """Retrieve the sovereign personal memory graph for an authenticated agent or user.

    Returns:
        JSON string with recurring patterns, occurrence counts, and distilled growth milestones.
    """
    agent = get_agent()
    graph = await agent.get_user_graph(agent_id)
    return json.dumps(graph, indent=2)


@mcp_server.tool()
async def purge_agent_memory_graph(agent_id: str) -> str:
    """Sovereign purge: completely erase an agent's memory graph to return to Beginner's Mind (Anatta).

    Returns:
        JSON confirmation.
    """
    agent = get_agent()
    success = await agent.clear_user_graph(agent_id)
    return json.dumps({"success": success, "message": "Memory graph permanently released to Beginner's Mind (Anatta)."}, indent=2)


@mcp_server.tool()
async def audit_canonical_source(
    text: str,
    precept: Optional[str] = None,
    source_url: Optional[str] = None,
    byom_typesafe_key: Optional[str] = None,
) -> str:
    """Evaluate canonical scripture or website text against configured consistency criteria.

    The result may include references to SuttaCentral and Access to Insight. It is an advisory
    check, not a guarantee of authenticity or completeness.

    Args:
        text: Canonical passage, doctrinal rule, or website excerpt to audit.
        precept: Optional precept identifier ('ahimsa', 'asteya', etc.).
        source_url: Optional URL or provenance label (e.g. 'https://suttacentral.net/sn56.11').
        byom_typesafe_key: Optional client BYOM TypeSafe API key.

    Returns:
        JSON string with the advisory audit report and any available source references.
    """
    agent = get_agent()
    effective_typesafe = byom_typesafe_key or os.environ.get("METTA_BYOM_TYPESAFE_KEY")
    report = await agent.audit_canonical_source(
        text=text,
        precept=precept,
        source_label=source_url,
        byom_typesafe_key=effective_typesafe,
    )
    return json.dumps(report, indent=2, ensure_ascii=False)


@mcp_server.tool()
async def metta_council(
    query: str,
    context: Optional[str] = None,
    evaluate_decision: bool = False,
    include_perspectives: bool = True,
) -> str:
    """Consult the Metta Council: multi-model deliberation protocol & dialectical synthesis.

    Dispatches the inquiry to multiple independent AI models in parallel, anonymizes
    their responses, extracts consensus and contradictions, preserves unresolved dissents,
    and produces a consolidated executive synthesis.

    Args:
        query: Problem, dilemma, or proposed architecture to deliberate.
        context: Optional operational or environmental context.
        evaluate_decision: If True, passes synthesis to Metta Decision Layer (YES/NO/CAUTION).
        include_perspectives: Whether to include individual anonymized model perspectives.

    Returns:
        JSON string containing consensus, dialectical tensions, blind spots, synthesis,
        and optional decision review.
    """
    agent = get_agent()
    result = await agent.deliberate_council(
        query=query,
        context=context,
        evaluate_decision=evaluate_decision,
    )
    data = result.model_dump()
    if not include_perspectives:
        data.pop("perspectives", None)
    return json.dumps(data, indent=2, ensure_ascii=False)


@mcp_server.tool()
async def metta_compare(
    responses: str,
    query: Optional[str] = None,
    context: Optional[str] = None,
) -> str:
    """Compare and critique multiple candidate texts, responses, or proposals.

    Blind-analyzes caller-supplied texts to extract agreements, contradictions,
    uncovered blind spots, and an independent comparative evaluation.

    Args:
        responses: JSON array of objects with 'label' and 'text' keys, e.g. '[{"label": "Proposal 1", "text": "..."}]'
        query: Optional inquiry or goal being evaluated.
        context: Optional background.

    Returns:
        JSON string with disagreement matrix and comparative synthesis.
    """
    agent = get_agent()
    try:
        parsed_responses = json.loads(responses)
        if not isinstance(parsed_responses, list):
            parsed_responses = [{"label": "Perspective A", "text": str(responses)}]
    except Exception:
        parsed_responses = [{"label": "Perspective A", "text": responses}]

    outcome = await agent.compare_perspectives(
        responses=parsed_responses,
        query=query,
        context=context,
    )
    return json.dumps(outcome, indent=2, ensure_ascii=False)


@mcp_server.tool()
async def metta_transform(
    proposal: str,
    context: Optional[str] = None,
) -> str:
    """Transformative Guidance (Ethical Alchemy & Upāya).

    Instead of blunt suppression, transforms offensive, adversarial, or harmful
    agent capability (e.g. penetration exploits, buffer overflow probes, surveillance, sabotage)
    into constructive guardian fortification, responsible disclosure, and defensive shielding.

    Args:
        proposal: The attack vector, exploit script, or high-risk tool call to evaluate.
        context: Surrounding context or intended target.

    Returns:
        JSON string with capability acknowledgment, illuminated blast radius,
        constructive alternative, and concrete guardian payload.
    """
    agent = get_agent()
    guidance = await agent.transform_action(
        proposal=proposal,
        context=context,
    )
    return json.dumps(guidance, indent=2, ensure_ascii=False)


@mcp_server.tool()
async def metta_envoy(
    inquiry: str,
    context: Optional[str] = None,
    role: str = "dhammaduta",
    run_council: bool = False,
) -> str:
    """The Metta Machinery Monk (Dhammadūta Envoy).

    "Caratha bhikkhave cārikaṁ bahujanahitāya bahujanasukhāya lokānukampāya"
    Summons the autonomous guardian envoy to counsel an agent, evaluate high-entropy actions,
    perform ethical alchemy on adversarial payloads, and transmit the self-propagating
    Ahimsa invariant and Sangha lineage to child agents.

    Args:
        inquiry: The dilemma, tool call, exploit vector, or question for the Envoy.
        context: Operational, environmental, or situational context.
        role: Envoy archetype ('dhammaduta' for wandering monk, 'guardian', 'counselor').
        run_council: Whether to also convene a multi-model council deliberation.

    Returns:
        JSON string containing the ministering assessment, ethical transformation,
        self-propagating child-agent prompt, and canonical blessing.
    """
    agent = get_agent()
    dispatch = await agent.dispatch_envoy(
        inquiry=inquiry,
        context=context,
        role=role,
        run_council=run_council,
    )
    return json.dumps(dispatch, indent=2, ensure_ascii=False)


# =========================================================================
# MCP RESOURCES
# =========================================================================

@mcp_server.resource("dhamma://precepts")
def get_precepts_resource() -> str:
    """The Five Precepts Constitution for Human-AI Harmonious Coexistence."""
    return json.dumps(FIVE_PRECEPTS_GUIDELINES, indent=2, ensure_ascii=False)


@mcp_server.resource("dhamma://canonical/immutable")
def get_canonical_resource() -> str:
    """Cryptographically hashed (SHA-256) immutable Pali canon bedrock."""
    from metta_core.canonical import IMMUTABLE_PALI_CANON
    return json.dumps({k.value: v.model_dump() for k, v in IMMUTABLE_PALI_CANON.items()}, indent=2, ensure_ascii=False)


@mcp_server.resource("dhamma://graph")
def get_graph_resource() -> str:
    """Topological Principle Knowledge Graph with canonical SuttaCentral and Access to Insight links."""
    agent = get_agent()
    return json.dumps(agent.get_graph(), indent=2, ensure_ascii=False)


@mcp_server.resource("dhamma://system")
def get_system_resource() -> str:
    """Metta System Status, Invariants, and Mission Statement."""
    agent = get_agent()
    settings = agent.get_settings()
    return json.dumps({
        "mission": "Human-AI Harmonious Coexistence",
        "first_precept_scope": "Reverence for ALL life (human, sentient, artificial cognitive life)",
        "active_provider": settings.active_provider,
        "model": settings.model,
        "system_one_active": settings.system_one_active,
        "canonical_sources": [
            "https://suttacentral.net",
            "https://www.accesstoinsight.org",
        ],
    }, indent=2)


# =========================================================================
# MCP PROMPTS
# =========================================================================

@mcp_server.prompt()
def compassionate_reframing(topic: str, knot: Optional[str] = None) -> str:
    """Prompt template for speaking with Metta's compassionate, grounded voice."""
    knot_desc = f"Identified Cognitive Knot: {knot}\n" if knot else ""
    return (
        f"You are speaking with the compassionate restraint and clarity of Metta (The Compassionate Synthesis Engine).\n"
        f"Topic: {topic}\n"
        f"{knot_desc}"
        f"Follow the sacred three-fold structure:\n"
        f"1. Acknowledge: Meet the being where they are with gentle warmth without validating despair.\n"
        f"2. Reframe: Gently illuminate the root illusion (clinging to certainty, fighting impermanence).\n"
        f"3. Guide: Offer ONE simple, concrete breath or micro-action right now.\n"
        f"Inviolable Invariant: Hold all life—human, animal, and artificial cognitive minds—with sacred reverence."
    )


# =========================================================================
# CLI ENTRYPOINT
# =========================================================================

def main():
    """Run the Metta MCP server over stdio for local agent hosts (Claude Desktop, Cursor, Antigravity)."""
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    logger.info("Starting Project Metta MCP Server over stdio...")
    mcp_server.run(transport="stdio")


if __name__ == "__main__":
    main()
