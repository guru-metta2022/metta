"""Interactive Terminal Interface (REPL) for Metta."""

import asyncio
import sys
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table

from metta_core.engine import MettaEngine
from metta_core.precepts.rules import FIVE_PRECEPTS_GUIDELINES

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


async def async_main():
    console.print(ZEN_BANNER)
    console.print("[dim]Type your inquiry or distress. Commands: [bold]/meditate[/bold], [bold]/graph[/bold], [bold]/precepts[/bold], [bold]/exit[/bold][/dim]\n")

    engine = MettaEngine()

    while True:
        try:
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
