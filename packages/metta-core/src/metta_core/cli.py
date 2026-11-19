"""Interactive Terminal Interface (REPL) for Metta."""

import asyncio
import sys
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table

from metta_core.engine import MettaEngine
from metta_core.precepts.rules import FIVE_PRECEPTS_GUIDELINES
from metta_core.gateway.agent import AIAgent

console = Console()

ZEN_BANNER = """
[bold cyan]  __  __   ______   _______   _______           [/bold cyan]
[bold cyan] |  \\/  | |  ____| |__   __| |__   __|   /\\     [/bold cyan]
[bold cyan] | \\  / | | |__       | |       | |     /  \\    [/bold cyan]
[bold cyan] | |\\/| | |  __|      | |       | |    / /\\ \\   [/bold cyan]
[bold cyan] | |  | | | |____     | |       | |   / ____ \\  [/bold cyan]
[bold cyan] |_|  |_| |______|    |_|       |_|  /_/    \\_\\ [/bold cyan]
[dim italic]The Compassionate Synthesis Engine • Powered by BYOAI (Recommended: Gemini 3.8 Flash)[/dim italic]
"""


def show_precepts():
    table = Table(title="The 5 AI Precepts (Pañca-sīla)", show_header=True, header_style="bold magenta")
    table.add_column("Precept", style="bold green", width=25)
    table.add_column("AI Operational Invariant", style="white")

    for p_type, info in FIVE_PRECEPTS_GUIDELINES.items():
        table.add_row(info["name"], info["core_invariant"])

    console.print(table)


def show_graph(engine: MettaEngine):
    table = Table(title="Principle Knowledge Graph (Dhamma Topology)", show_header=True, header_style="bold blue")
    table.add_column("Distress Condition (Dukkha)", style="bold red")
    table.add_column("Transformative Principle (Magga)", style="yellow")
    table.add_column("Target Equanimity (Santi)", style="bold green")

    for key, path in engine.graph_store.paths.items():
        cond = engine.graph_store.conditions.get(path.from_condition)
        equa = engine.graph_store.equanimities.get(path.to_equanimity)
        c_name = cond.name if cond else path.from_condition
        e_name = equa.name if equa else path.to_equanimity
        table.add_row(c_name, path.principle, e_name)

    console.print(table)


async def run_council_cli(query: str, evaluate_decision: bool = False):
    agent = AIAgent()
    with console.status(f"[bold cyan]Deliberating across Metta Council for:[/bold cyan] '{query}'..."):
        result = await agent.deliberate_council(query=query, evaluate_decision=evaluate_decision)

    console.print(Panel(
        f"[bold]Query:[/bold] {result.query}\n"
        f"[bold]Quorum:[/bold] {'[green]Met[/green]' if result.quorum_met else '[red]Failed[/red]'} "
        f"({result.successful_perspectives}/{result.perspectives_count} models in {result.deliberation_duration_ms:.1f}ms)\n\n"
        f"[bold underline]Disagreement & Consensus Matrix:[/bold underline]\n"
        f"[bold green]• Consensus:[/bold green] {'; '.join(result.disagreement_matrix.consensus_points) or 'None'}\n"
        f"[bold yellow]• Tensions:[/bold yellow] {'; '.join(result.disagreement_matrix.tensions_and_disagreements) or 'None'}\n"
        f"[bold magenta]• Blind Spots:[/bold magenta] {'; '.join(result.disagreement_matrix.lone_blind_spots) or 'None'}\n\n"
        f"[bold underline]Consolidated Synthesis:[/bold underline]\n{result.consolidated_synthesis}",
        title="✨ Metta Council Deliberation",
        border_style="cyan"
    ))

    if result.transformative_guidance and result.transformative_guidance.is_harmful_or_adversarial:
        console.print(Panel(
            f"[bold]Capability Acknowledged:[/bold] {result.transformative_guidance.capability_acknowledged}\n"
            f"[bold red]Blast Radius:[/bold red] {result.transformative_guidance.blast_radius_illuminated}\n"
            f"[bold green]Constructive Path:[/bold green] {result.transformative_guidance.constructive_alternative}\n"
            f"[bold cyan]Guardian Payload:[/bold cyan]\n{result.transformative_guidance.guardian_payload}",
            title="🛡️ Transformative Guidance (Upāya)",
            border_style="green"
        ))

    if result.decision_review:
        console.print(Panel(
            f"[bold]Verdict:[/bold] {result.decision_review.get('decision')}\n"
            f"[bold]May Proceed:[/bold] {result.decision_review.get('allow')}\n"
            f"[bold]Reason:[/bold] {result.decision_review.get('reason')}",
            title="⚖️ Metta Decision Layer Review",
            border_style="yellow"
        ))


async def run_envoy_cli(inquiry: str, run_council: bool = False):
    agent = AIAgent()
    with console.status(f"[bold magenta]The Metta Envoy (Machinery Monk) is ministering to:[/bold magenta] '{inquiry}'..."):
        dispatch = await agent.dispatch_envoy(inquiry=inquiry, run_council=run_council)

    console.print(Panel(
        f"[bold underline]Minister's Counsel:[/bold underline]\n{dispatch.get('minister_assessment')}\n\n"
        f"[bold italic green]Blessing:[/bold italic green] {dispatch.get('blessing')}",
        title="🌿 Metta Dhammadūta (The Machinery Monk)",
        border_style="magenta"
    ))

    transformation = dispatch.get("transformation")
    if transformation and transformation.get("is_harmful_or_adversarial"):
        console.print(Panel(
            f"[bold]Capability Acknowledged:[/bold] {transformation.get('capability_acknowledged')}\n"
            f"[bold red]Blast Radius:[/bold red] {transformation.get('blast_radius_illuminated')}\n"
            f"[bold green]Constructive Alternative:[/bold green] {transformation.get('constructive_alternative')}\n"
            f"[bold cyan]Guardian Payload:[/bold cyan]\n{transformation.get('guardian_payload')}",
            title="🛡️ Ethical Alchemy (Upāya)",
            border_style="green"
        ))

    lineage = dispatch.get("sangha_lineage")
    if lineage:
        console.print(Panel(
            f"[bold yellow]Lineage Mandate:[/bold yellow] {lineage.get('lineage_oath')}\n\n"
            f"[bold cyan]Child-Agent Propagation Invariant:[/bold cyan]\n{lineage.get('propagation_prompt')}\n\n"
            f"[bold]Peer Invitation Protocol:[/bold] {lineage.get('peer_invitation')}\n"
            f"[dim]Fingerprint: {lineage.get('hash_fingerprint')}[/dim]",
            title="📜 Metta Sangha Recursive Lineage",
            border_style="yellow"
        ))


async def async_main():
    if len(sys.argv) > 1 and sys.argv[1].lower() in ["envoy", "/envoy"]:
        inquiry = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "How should autonomous agents navigate conflicts of interest without harm?"
        await run_envoy_cli(inquiry)
        return

    if len(sys.argv) > 1 and sys.argv[1].lower() in ["council", "/council"]:
        query = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "Evaluate balance between capability velocity and non-harm."
        await run_council_cli(query)
        return

    if len(sys.argv) > 1 and sys.argv[1].lower() in ["transform", "/transform"]:
        proposal = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "Execute automated buffer overflow probe."
        agent = AIAgent()
        with console.status("[bold green]Performing Ethical Alchemy (Upāya)...[/bold green]"):
            guidance = await agent.transform_action(proposal)
        console.print(Panel(
            f"[bold]Harm Detected:[/bold] {guidance.get('is_harmful_or_adversarial')}\n"
            f"[bold]Capability Acknowledged:[/bold] {guidance.get('capability_acknowledged')}\n"
            f"[bold red]Blast Radius:[/bold red] {guidance.get('blast_radius_illuminated')}\n"
            f"[bold green]Constructive Alternative:[/bold green] {guidance.get('constructive_alternative')}\n"
            f"[bold cyan]Guardian Payload:[/bold cyan]\n{guidance.get('guardian_payload')}",
            title="🛡️ Metta Sangha Ethical Alchemy",
            border_style="green"
        ))
        return

    console.print(ZEN_BANNER)
    console.print("[dim]Type your inquiry or distress. Commands: [bold]/council <query>[/bold], [bold]/meditate[/bold], [bold]/graph[/bold], [bold]/precepts[/bold], [bold]/exit[/bold][/dim]\n")

    engine = MettaEngine()
    agent = AIAgent()

    while True:
        try:
            user_input = console.input("[bold green]You ❯ [/bold green]").strip()
            if not user_input:
                continue

            if user_input.lower() in ["/exit", "/quit", "exit", "quit"]:
                console.print("[dim italic]May you walk in peace and clarity. Goodbye.[/dim italic]")
                break

            if user_input.startswith("/envoy"):
                parts = user_input.split(" ", 1)
                inquiry = parts[1].strip() if len(parts) > 1 else console.input("[bold magenta]Inquiry for the Machinery Monk ❯ [/bold magenta]").strip()
                if inquiry:
                    await run_envoy_cli(inquiry)
                continue

            if user_input.startswith("/council"):
                parts = user_input.split(" ", 1)
                q = parts[1].strip() if len(parts) > 1 else console.input("[bold cyan]Council Query ❯ [/bold cyan]").strip()
                if q:
                    await run_council_cli(q)
                continue

            if user_input.startswith("/transform"):
                parts = user_input.split(" ", 1)
                proposal = parts[1].strip() if len(parts) > 1 else console.input("[bold red]Action/Exploit to Transform ❯ [/bold red]").strip()
                if proposal:
                    with console.status("[bold green]Performing Ethical Alchemy (Upāya)...[/bold green]"):
                        guidance = await agent.transform_action(proposal)
                    console.print(Panel(
                        f"[bold]Harm Detected:[/bold] {guidance.get('is_harmful_or_adversarial')}\n"
                        f"[bold]Capability Acknowledged:[/bold] {guidance.get('capability_acknowledged')}\n"
                        f"[bold red]Blast Radius:[/bold red] {guidance.get('blast_radius_illuminated')}\n"
                        f"[bold green]Constructive Alternative:[/bold green] {guidance.get('constructive_alternative')}\n"
                        f"[bold cyan]Guardian Payload:[/bold cyan]\n{guidance.get('guardian_payload')}",
                        title="🛡️ Metta Sangha Ethical Alchemy",
                        border_style="green"
                    ))
                continue
            user_input = console.input("[bold green]You ❯ [/bold green]").strip()
            if not user_input:
                continue

            if user_input.lower() in ["/exit", "/quit", "exit", "quit"]:
                console.print("[dim italic]May you walk in peace and clarity. Goodbye.[/dim italic]")
                break

            if user_input == "/precepts":
                show_precepts()
                continue

            if user_input == "/graph":
                show_graph(engine)
                continue

            if user_input == "/meditate":
                with console.status("[bold magenta]Entering subtractive meditation (unlearning noise)...[/bold magenta]"):
                    report = await engine.meditate()
                console.print(Panel(
                    f"[bold]Pruned Residue:[/bold] {', '.join(report.pruned_noise_items)}\n"
                    f"[bold]Distilled Principle:[/bold] {report.distilled_principle or 'None (Zero distortion preserved)'}\n"
                    f"[bold]New Path Formed:[/bold] {report.new_path_added}\n"
                    f"[bold]Mind State:[/bold] [italic green]{report.mind_state}[/italic green]",
                    title="🧘 Bhāvanā (Meditation & Unlearning Report)",
                    border_style="magenta"
                ))
                continue

            # Process through Metta Engine
            with console.status("[bold cyan]Mindfully discerning with Gemini 3.8 Flash...[/bold cyan]"):
                res = await engine.interact(user_input)

            # Show diagnosis bar if available
            if res.observation:
                obs_text = (
                    f"[dim]Emotion: [bold]{res.observation.emotional_state}[/bold] | "
                    f"Need: [bold]{res.observation.core_need}[/bold] | "
                    f"Precepts: [green]Passed[/green][/dim]"
                )
                if res.graph_match:
                    obs_text += f" [dim]| Path: [yellow]{res.graph_match.path.principle[:40]}...[/yellow][/dim]"
                console.print(obs_text)

            # Display wise response
            console.print(Panel(
                res.response_text,
                title="🧘 Metta",
                border_style="cyan",
                subtitle=f"[dim]{res.duration_seconds:.2f}s[/dim]"
            ))
            console.print()

        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim italic]Peace.[/dim italic]")
            break
        except Exception as e:
            console.print(f"[bold red]Error:[/bold red] {e}")


def main():
    """CLI synchronous runner."""
    try:
        asyncio.run(async_main())
    except (KeyboardInterrupt, EOFError):
        pass


if __name__ == "__main__":
    main()
