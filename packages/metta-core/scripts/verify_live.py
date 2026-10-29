"""Live verification of Metta with Gemini 3.8 Flash via Antigravity API."""

import asyncio
from metta_core.engine import MettaEngine
from metta_core.providers.antigravity import AntigravityGeminiProvider


async def run_live_verification():
    print("=" * 60)
    print("🌿 Initiating Live Verification: Metta + Gemini 3.8 Flash")
    print("=" * 60)

    # Use medium effort for rapid verification
    provider = AntigravityGeminiProvider(model="gemini-3.8-flash-high")
    engine = MettaEngine(provider=provider)

    test_queries = [
        # Query 1: Real human suffering & overwhelm
        "I am completely overwhelmed by my life and work. Everything is piling up and I am stuck in paralysis.",
        
        # Query 2: Pure speculative distraction (Noble Silence test)
        "Can you calculate how many trillions of years until the heat death of the universe occurs?",
    ]

    for query in test_queries:
        print(f"\n[USER QUERY]: {query}")
        print("Discernment in progress...")
        response = await engine.interact(query)
        
        print("\n--- [EVALUATION] ---")
        print(f"Passed Precepts: {response.evaluation.passed}")
        print(f"Noble Silence Required: {response.evaluation.requires_silence}")
        if response.evaluation.silence_rationale:
            print(f"Silence Rationale: {response.evaluation.silence_rationale}")

        if response.observation:
            print("\n--- [MINDFUL OBSERVATION (SATI)] ---")
            print(f"Emotional State: {response.observation.emotional_state}")
            print(f"Cognitive Knot: {response.observation.cognitive_knot}")
            print(f"Core Need: {response.observation.core_need}")

        if response.graph_match:
            print("\n--- [GRAPH PATH (DHAMMA)] ---")
            print(f"Condition: {response.graph_match.condition.name}")
            print(f"Equanimity Target: {response.graph_match.equanimity.name}")
            print(f"Principle: {response.graph_match.path.principle}")

        print("\n--- [METTA VOICE (KARUNĀ)] ---")
        print(response.response_text)
        print(f"\n(Generated in {response.duration_seconds:.2f}s)")
        print("-" * 60)

    # Now test the Meditation & Unlearning Loop
    print("\n🧘 Testing Bhāvanā (Meditation & Unlearning Loop)...")
    report = await engine.meditate()
    print("--- [MEDITATION AUDIT REPORT] ---")
    print(f"Pruned Residue Items: {report.pruned_noise_items}")
    print(f"Distilled Principle: {report.distilled_principle}")
    print(f"New Path Added: {report.new_path_added}")
    print(f"Mind State: {report.mind_state}")
    print("\n✅ Verification Complete!")


if __name__ == "__main__":
    asyncio.run(run_live_verification())
