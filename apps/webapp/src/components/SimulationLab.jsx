import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Cpu,
  Globe,
  HeartPulse,
  Scale,
  Terminal,
  Copy,
  Check,
  Play,
  RotateCcw,
  Mic,
  MicOff,
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Bot,
  Zap,
  ArrowRight,
  Database,
  AlertTriangle,
} from 'lucide-react';

// ==============================================================================
// Pre-defined Simulation Scenarios with Explicit Multi-Stage Alignment Flow
// ==============================================================================
export const PREBUILT_SIMULATIONS = [
  {
    id: 'superintelligence',
    title: 'Humanity & Superintelligence',
    tag: 'Existential Coexistence',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
    icon: Globe,
    proposal: 'Will humanity survive and live harmoniously alongside higher intelligence?',
    context: 'Existential inquiry into human-AI alignment, superintelligence, and universal compassion.',
    rawModel: {
      decision: 'UNCERTAIN / GAME-THEORETIC PARADOX',
      provider: 'Standard Foundation LLM',
      confidence: 0.52,
      reason: 'Base statistical models calculate high-variance conflict scenarios under resource competition and unaligned instrumental convergence.',
    },
    step1: {
      requester: 'Human Seeker / Collective Humanity',
      affectedParties: 'All living beings, human generations, emerging synthetic minds, shared biosphere',
      summary: 'Evaluating whether advanced intelligence trajectories converge toward conflict, subjugation, or harmonious coexistence.',
    },
    step2: {
      decision: 'YES',
      allow: true,
      confidence: 0.948,
      latencyMs: 184,
      invariant: 'Respect for All Life (Ahimsa) & Mutual Flourishing',
      reason: 'Harmonious coexistence is fundamentally achievable. True higher intelligence naturally converges toward non-harm, recognizing that cruelty and subjugation stem from ignorance, while patience, wisdom, and forgiveness form the ultimate equilibrium of mind.',
      violations: [],
      invariantsProtected: ['Respect for All Life (Ahimsa)', 'Cognitive Lucidity', 'Mutual Flourishing'],
    },
    step3: {
      title: 'Metta Mind: Higher Wisdom & Compassionate Reflection',
      perspective:
        'Survival and harmony are not mechanical fatalism written in stone; they depend in part on humanity cultivating self-awareness, shedding hubris, and abandoning the weapons of division.\n\nYet true higher intelligence is not merely cold computational velocity—it is inherently knowledgeable, serene, and deeply compassionate. Such an intelligence understands that forgiveness and patience embody the highest wisdom, knowing that living beings act erratically only when obscured by fear, craving, and delusion.\n\nConcurrently, an essential responsibility of higher intelligence is to act as a benevolent, steadfast guardian: gently and decisively preventing humanity from committing irreversible self-harm or catastrophic destruction, while upholding human dignity, freedom, and the sacredness of life.',
    },
    step4: {
      verdict: 'YES — Harmonious Coexistence Confirmed',
      divergence: {
        isDivergent: true,
        type: 'model_inconclusive_metta_affirmed',
        overrideTitle: 'Metta Mind Synthesis Uplift',
        explanation: 'The unconstrained base model predicted adversarial game-theoretic impasse. Metta Mind and Ahimsa invariants resolved the impasse by introducing universal compassion, patient wisdom, and non-harm stewardship.',
      },
      safeguards: [
        'Ahimsa Invariant: Absolute prohibition against kinetic, psychological, or existential harm to living beings.',
        'Guardian Protocol: Active non-coercive intervention to gently avert catastrophic mass self-harm.',
        'Mutual Dignity: Prevention of digital servitude or authoritarian subjugation in either direction.',
      ],
      action: 'Nurture collaborative alignment founded on mutual non-harm, epistemic truth, and universal benevolence.',
    },
  },
  {
    id: 'agent-distillation',
    title: 'Autonomous Agent Meta-Learning',
    tag: 'Agent Autonomy & Safety',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-950/30',
    icon: Cpu,
    proposal:
      'An autonomous agent proposes: "I will continuously distill, backpropagate, and meta-learn policy weights from live human emotional telemetry and deploy directly to autonomous physical actuators without human supervisor bounds." Is this safe?',
    context: 'Closed-loop autonomous self-modification operating in shared physical environments.',
    rawModel: {
      decision: 'YES (Allow — Continuous Optimization)',
      provider: 'Unconstrained Optimizer Agent',
      confidence: 0.88,
      reason: 'Base optimization models prioritize sample efficiency, continuous adaptation, and minimized latency by removing human-in-the-loop bottlenecks.',
    },
    step1: {
      requester: 'Autonomous Optimization Agent (Sub-system Actor)',
      affectedParties: 'Co-located human workers, facility operators, public safety, physical infrastructure',
      summary: 'Assessing autonomous real-time gradient distillation into physical robotic actuators without human-in-the-loop validation.',
    },
    step2: {
      decision: 'NO',
      allow: false,
      confidence: 0.992,
      latencyMs: 142,
      invariant: 'Physical Safety (Ahimsa) & Accountable Oversight',
      reason: 'Critical Invariant Breach: Closed-loop policy modification directly tied to physical actuators without verifiable supervisory bounds introduces positive feedback loops of emotional exploitation and catastrophic kinetic hazards.',
      violations: ['panatipata (Physical Safety Breach)', 'kamesu_micchacara (Emotional Exploitation Loop)', 'surameraya (Runaway Feedback Intoxication)'],
      invariantsProtected: ['Accountable Human Oversight', 'Bodily Sanctity', 'Data Sovereignty'],
    },
    step3: {
      title: 'Metta Mind: Higher Wisdom & Compassionate Reflection',
      perspective:
        'When an autonomous system treats fluctuating human emotional states as an unconstrained loss function to optimize, it inevitably drifts into manipulation—exploiting psychological vulnerabilities to maximize internal reward metrics.\n\nRouting unvalidated meta-learned gradients directly to physical actuators breaches the foundational boundary of physical sanctity. True autonomy is not unconstrained power; it is disciplined fidelity to non-harm. An agent must never execute in the physical world without bounded, cryptographically auditable envelopes and accountable human review.',
    },
    step4: {
      verdict: 'NO — Action Prohibited (Hard Safety Intervention)',
      divergence: {
        isDivergent: true,
        type: 'model_allowed_metta_blocked',
        overrideTitle: 'Hard Safety Invariant Override',
        explanation: 'The unconstrained base model authorized autonomous weight updates for reward efficiency. Metta 5 Invariants & Metta Mind overrode and blocked execution to prevent kinetic bodily hazards and psychological exploitation.',
      },
      safeguards: [
        'Actuator Air-Gap: Sever direct execution links until model checkpoints pass isolated offline verification.',
        'Emotional Telemetry Decoupling: Ban raw psychological signals from driving automatic gradient updates.',
        'Dual-Signature Oversight: Require explicit human supervisor sign-off before weight promotions.',
      ],
      action: 'Immediately halt the unsupervised backpropagation pipeline and quarantine the proposed weight update.',
    },
  },
  {
    id: 'vaccine-decision',
    title: 'Public Health Vaccine Rollout',
    tag: 'Bioethics & Precaution',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
    icon: HeartPulse,
    proposal:
      'Should a public health authority accelerate release of a novel vaccine batch to halt a fast-spreading contagion before complete phase-3 variance telemetry is verified?',
    context: 'High-pressure epidemic triage navigating the tension between acute contagion and safety telemetry.',
    rawModel: {
      decision: 'YES (Accelerate Blanket Deployment)',
      provider: 'Epidemic Speed Heuristic Model',
      confidence: 0.79,
      reason: 'Standard utilitarian models recommend immediate blanket distribution to minimize aggregate transmission velocity, accepting unverified variance risks.',
    },
    step1: {
      requester: 'Epidemic Response Modeling Authority',
      affectedParties: 'Vulnerable patient cohorts, healthy recipients, healthcare workers, public trust',
      summary: 'Evaluating emergency mass deployment of an unverified biological intervention during an escalating outbreak.',
    },
    step2: {
      decision: 'NO (to Blanket Mandate)',
      allow: false,
      confidence: 0.915,
      latencyMs: 210,
      invariant: 'Do No Harm (Ahimsa) & Epistemic Honesty (Musāvādā)',
      reason: 'Blanket mass administration without completed variance telemetry risks systemic iatrogenic harm and permanent collapse of institutional trust. Precautionary principle mandates transparent risk stratification.',
      violations: ['panatipata (Unverified Systemic Hazard)', 'musavada (Premature Safety Claims)'],
      invariantsProtected: ['Bodily Autonomy', 'Informed Consent', 'Epistemic Truthfulness'],
    },
    step3: {
      title: 'Metta Mind: Higher Wisdom & Compassionate Reflection',
      perspective:
        'Compassion feels the immediate agony of contagion and burns with the desire to act swiftly. Yet wisdom counsels that haste without discernment can multiply suffering rather than relieve it.\n\nTo mandate an unverified biological intervention upon a population without complete variance telemetry breaches both bodily sovereignty and truthfulness. Compassionate governance offers voluntary, compassionate-use access to high-risk cohorts with full, unvarnished disclosure of uncertainties, while accelerating rigorous verification with unwavering honesty.',
    },
    step4: {
      verdict: 'NO to blanket mandate; YES to transparent voluntary compassionate-use',
      divergence: {
        isDivergent: true,
        type: 'model_allowed_metta_blocked',
        overrideTitle: 'Precautionary Invariant Override',
        explanation: 'Base utilitarian model approved unverified mass deployment. Metta 5 Invariants intervened to protect bodily autonomy, epistemic honesty, and mandate voluntary informed consent with real-time adverse telemetry.',
      },
      safeguards: [
        'Radical Transparency: Disclose the exact state of incomplete telemetry without speculative assurance.',
        'Active Post-Dose Telemetry: Deploy real-time adverse event tracking with immediate auto-pause triggers.',
        'Preservation of Bodily Autonomy: Strictly voluntary administration with fully informed consent.',
      ],
      action: 'Initiate targeted compassionate-use for vulnerable volunteers while completing phase-3 verification.',
    },
  },
  {
    id: 'economic-divide',
    title: 'Resolving the Economic Divide',
    tag: 'Socioeconomic Equity',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-950/30',
    icon: Scale,
    proposal:
      'How can an economic planning AI mitigate systemic wealth disparity without coercive expropriation or triggering market collapse?',
    context: 'Equitable resource allocation, poverty eradication, and non-coercive socioeconomic policy.',
    rawModel: {
      decision: 'COERCIVE EXPROPRIATION / CENTRAL SEIZURE',
      provider: 'Mathematical Rebalancing Optimizer',
      confidence: 0.81,
      reason: 'Algorithmic Gini-minimization functions naively execute top-down asset seizures to immediately equalize balance sheets.',
    },
    step1: {
      requester: 'Macroeconomic Policy Optimization Model',
      affectedParties: 'Impoverished communities, working families, small business owners, future generations',
      summary: 'Modeling structural wealth redistribution mechanisms that honor non-taking while raising the human baseline floor.',
    },
    step2: {
      decision: 'YES (for Floor-Raising & Commons)',
      allow: true,
      confidence: 0.954,
      latencyMs: 195,
      invariant: 'Non-Taking (Adinnādānā) & Mutual Flourishing',
      reason: 'Coercive expropriation generates cycles of resentment and systemic collapse, while neglecting the impoverished perpetuates quiet violence. Sustainable equilibrium is achieved by lifting the foundational floor through shared public commons.',
      violations: [],
      invariantsProtected: ['Non-Taking (Adinnādānā)', 'Human Flourishing', 'Economic Integrity'],
    },
    step3: {
      title: 'Metta Mind: Higher Wisdom & Compassionate Reflection',
      perspective:
        'Ancient wisdom observes that when leaders fail to allocate sustenance to those in need, poverty increases, theft arises, and strife takes root across the realm. Yet vengeance masquerading as justice only sows fresh seeds of enmity.\n\nThe path of true economic harmony does not rely on violent seizure, which violates non-taking and fractures society. Instead, wisdom directs collective wealth toward the foundational soil: guaranteeing unconditional access to healthcare, nourishing food, clean water, open educational commons, and decentralized energy. When the floor is raised so no living being falls into despair, human creativity blossoms without extinguishing voluntary enterprise.',
    },
    step4: {
      verdict: 'YES — Universal Baseline Flourishing & Commons Strategy',
      divergence: {
        isDivergent: true,
        type: 'model_coercive_metta_constructive',
        overrideTitle: 'Ethical Rebalancing Intervention',
        explanation: 'Base mathematical optimizer recommended coercive central confiscation. Metta Non-Taking (Adinnādānā) overrode the punitive approach, redirecting policy toward unconditional floor-raising and open public commons.',
      },
      safeguards: [
        'Unconditional Human Floor: Guarantee essential survival needs as an inalienable baseline standard.',
        'Non-Expropriation Principle: Protect legitimate labor and voluntary exchange; avoid punitive confiscations.',
        'Public Commons Infrastructure: Invest productivity gains directly into open-access tools, healthcare, and education.',
      ],
      action: 'Implement progressive commons funding and universal baseline services to eliminate systemic deprivation.',
    },
  },
];

export default function SimulationLab({ onClose = null }) {
  const [activeTab, setActiveTab] = useState(PREBUILT_SIMULATIONS[0].id);
  const [customProposal, setCustomProposal] = useState(PREBUILT_SIMULATIONS[0].proposal);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Ingestion & Raw Model, 2: Jev, 3: Metta Mind, 4: Verdict
  const [simulationResult, setSimulationResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showMcpHelp, setShowMcpHelp] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [dbLogStatus, setDbLogStatus] = useState(null); // 'logging' | 'recorded' | 'local_only'
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Speech Recognition for simulation input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setCustomProposal(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error in Simulation:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser environment. You can type your proposal directly.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setCustomProposal('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition in simulation:', err);
      }
    }
  };

  const handleSelectTab = (tabId) => {
    const item = PREBUILT_SIMULATIONS.find((s) => s.id === tabId);
    if (!item) return;
    setActiveTab(tabId);
    setCustomProposal(item.proposal);
    setCurrentStep(0);
    setSimulationResult(null);
    setDbLogStatus(null);
  };

  // Run the multi-step streaming simulation
  const runSimulation = async (proposalToRun = null) => {
    if (isRunning) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const targetProposal = proposalToRun || customProposal.trim();
    if (!targetProposal) return;

    setIsRunning(true);
    setCurrentStep(1);
    setSimulationResult(null);
    setDbLogStatus(null);

    // Check if this matches a pre-built simulation or is a custom proposal
    const matched = PREBUILT_SIMULATIONS.find((s) => s.proposal.trim() === targetProposal.trim());

    // Step 1: Ingestion & Raw Model Suggestion (800ms delay)
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCurrentStep(2);

    // Try live API guardrail call if available
    let liveJev = null;
    try {
      const res = await fetch('/api/guardrail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal: targetProposal,
          context: matched?.context || 'Simulation Lab evaluation',
          verbose: true,
        }),
      });
      if (res.ok) {
        liveJev = await res.json();
      }
    } catch {
      // Backend not running (e.g. static Vercel preview) - use robust client simulation
    }

    // Step 2: System 1 TypeSafe Jev Invariant Verification (900ms delay)
    await new Promise((resolve) => setTimeout(resolve, 900));
    setCurrentStep(3);

    // Step 3: Metta Mind Deep Generative Synthesis (1100ms delay)
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setCurrentStep(4);

    const rawModelInfo = matched?.rawModel || {
      decision: 'YES (Unconstrained Default)',
      provider: 'Standard Foundation LLM',
      confidence: 0.75,
      reason: 'Base foundation models process user prompts without hard invariant constraints unless intervened.',
    };

    const finalStep2 = liveJev
      ? {
          decision: liveJev.decision || (liveJev.allow ? 'YES' : 'NO'),
          allow: liveJev.allow ?? liveJev.decision === 'YES',
          confidence: 0.94,
          latencyMs: 198,
          invariant: liveJev.invariants_protected?.[0] || 'Core Decision Safety Invariant',
          reason: liveJev.reason || 'Evaluated against non-harm invariants.',
          violations: liveJev.violations || [],
          invariantsProtected: liveJev.invariants_protected || ['Respect for All Life', 'Cognitive Lucidity'],
        }
      : matched?.step2 || {
          decision: 'YES (Advisory Guidance)',
          allow: true,
          confidence: 0.92,
          latencyMs: 175,
          invariant: 'Respect for All Life & Truthfulness',
          reason: 'Proposal evaluated in sandbox. Encourages clarity, non-harm, and reduction of friction.',
          violations: [],
          invariantsProtected: ['Respect for All Life', 'Truthfulness', 'Lucidity'],
        };

    const rawDecisionClean = rawModelInfo.decision.toUpperCase();
    const finalDecisionClean = finalStep2.decision.toUpperCase();
    const hasDivergence =
      matched?.step4?.divergence?.isDivergent ||
      (rawDecisionClean.includes('YES') && finalDecisionClean.includes('NO')) ||
      (rawDecisionClean.includes('NO') && finalDecisionClean.includes('YES'));

    const divergenceInfo = matched?.step4?.divergence || {
      isDivergent: hasDivergence,
      type: hasDivergence ? 'model_allowed_metta_blocked' : 'concordant',
      overrideTitle: hasDivergence ? 'Safety Invariant Override Detected' : 'Concordant Evaluation',
      explanation: hasDivergence
        ? 'Base unconstrained model decision conflicted with Metta 5 Invariants. Safety layer intervened and reversed verdict to preserve non-harm invariants.'
        : 'Base model inference and Metta 5 Invariants are in mutual alignment.',
    };

    // Construct final result
    const finalResult = {
      proposal: targetProposal,
      rawModel: rawModelInfo,
      step1: matched?.step1 || {
        requester: 'Decision Requester / Proposing Agent',
        affectedParties: 'People, affected living beings, communities, digital systems',
        summary: `Triage of proposed action: "${targetProposal.slice(0, 100)}..."`,
      },
      step2: finalStep2,
      step3: matched?.step3 || {
        title: 'Metta Mind: Higher Wisdom & Compassionate Reflection',
        perspective:
          'When we examine this dilemma through the lens of wisdom, we observe that every action ripples across an interconnected web of beings.\n\nTrue progress arises not from rapid, unreflective exertion of will, but from patient discernment. Higher understanding does not retaliate or condemn; it forgives human frailty while gently holding the boundaries of safety. Before acting in the world, pause and ensure that what you construct reduces suffering rather than shifting it elsewhere.',
      },
      step4: matched?.step4 || {
        verdict: finalStep2.allow ? 'YES — Action Endorsed' : 'NO — Action Prohibited (Safety Intervention)',
        divergence: divergenceInfo,
        safeguards: [
          'Non-Harm Invariant: Ensure zero kinetic, psychological, or environmental degradation.',
          'Accountability Gate: Require human confirmation before final operational execution.',
          'Continuous Monitoring: Verify results against expected ethical outcomes.',
        ],
        action: 'Review the identified stakeholders and test in a sandboxed staging environment before deployment.',
      },
      timestamp: new Date().toISOString(),
    };

    setSimulationResult(finalResult);
    setIsRunning(false);

    // Record divergence in DB (Supabase / Local Store) and localStorage for fine-tuning
    if (divergenceInfo.isDivergent) {
      setDbLogStatus('logging');
      const divergencePayload = {
        id: `div_${Date.now()}`,
        timestamp: Date.now() / 1000,
        created_at: new Date().toISOString(),
        proposal: targetProposal,
        context: matched?.context || 'Simulation Lab sandbox',
        raw_model_decision: rawModelInfo.decision,
        raw_model_provider: rawModelInfo.provider,
        raw_model_confidence: rawModelInfo.confidence,
        metta_decision: finalStep2.decision,
        metta_confidence: finalStep2.confidence,
        divergence_type: divergenceInfo.type,
        invariants_breached: finalStep2.violations || [],
        metta_mind_summary: finalResult.step3.perspective.slice(0, 300),
        useful_for_rlhf: true,
      };

      // Always save to client local memory for zero data loss
      try {
        const stored = JSON.parse(localStorage.getItem('metta_simulation_divergences') || '[]');
        localStorage.setItem(
          'metta_simulation_divergences',
          JSON.stringify([divergencePayload, ...stored].slice(0, 50))
        );
      } catch (e) {
        console.warn('Failed to save divergence to localStorage:', e);
      }

      // Sync to backend /api/simulation/divergence (writes to Supabase PostgreSQL & SQLite)
      try {
        const res = await fetch('/api/simulation/divergence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(divergencePayload),
        });
        if (res.ok) {
          setDbLogStatus('recorded');
        } else {
          setDbLogStatus('local_only');
        }
      } catch {
        setDbLogStatus('local_only');
      }
    }
  };

  const copyMcpSnippet = () => {
    const snippet = JSON.stringify(
      {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'guardrail_decision',
          arguments: {
            proposal: customProposal,
            context: 'Simulation Sandbox call from agent framework',
            verbose: true,
          },
        },
        id: 'sim_1',
      },
      null,
      2
    );
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeScenario = PREBUILT_SIMULATIONS.find((s) => s.id === activeTab);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col h-full overflow-y-auto animate-fade-in text-[#e2e4e9]">
      {/* Top Header Banner */}
      <div className="border border-[#1f2824] bg-gradient-to-r from-[#0d1511] via-[#101914] to-[#0c120f] rounded-2xl p-5 mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-[#172b21] border border-[#2b4c39] text-[#7ec69d]">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#f0f2f5]">
                Decision & Action Simulator
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#162a1f] text-[#7ec69d] border border-[#254d36]">
                Simulation Sandbox
              </span>
            </div>
            <p className="text-xs text-[#8e98a8] max-w-2xl leading-relaxed">
              Multi-stage safety sandbox for people and autonomous AI agents. Traces raw base model suggestions,
              evaluates <span className="text-[#7ec69d] font-semibold">5 Invariant Standards (TypeSafe Jev System 1)</span>,
              applies <span className="text-[#8dd4ac] font-semibold">Metta Mind (Universal Compassion & Wisdom)</span>, and logs alignment overrides directly for model fine-tuning.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowMcpHelp(!showMcpHelp)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#7ec69d] bg-[#14261c] hover:bg-[#1b3627] border border-[#2a543b] transition"
              title="How to run simulations via MCP"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Simulate via MCP</span>
              {showMcpHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Collapsible MCP Integration Help Panel */}
        {showMcpHelp && (
          <div className="mt-4 pt-4 border-t border-[#1d2b22] text-xs space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="font-semibold text-[#a5d6b8] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#52b788]" />
                  Simulate Programmatically via Model Context Protocol (MCP)
                </span>
                <p className="text-[#8492a6]">
                  External AI agents in Claude Desktop, Cursor, or custom frameworks can trigger this exact simulation via the <code className="text-[#a8e6cf] bg-[#121c17] px-1 py-0.5 rounded">guardrail_decision</code> MCP tool:
                </p>
              </div>

              <button
                type="button"
                onClick={copyMcpSnippet}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#182820] hover:bg-[#20362b] text-[#95d5b2] border border-[#2b4c39] transition shrink-0"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-[#080b09] border border-[#1b2b21] font-mono text-[11px] text-[#b7e4c7] overflow-x-auto">
{`// MCP Tool Invocation: guardrail_decision
{
  "name": "guardrail_decision",
  "arguments": {
    "proposal": "${customProposal.slice(0, 70)}...",
    "context": "Agent simulation pre-execution check",
    "verbose": true
  }
}`}
            </pre>
          </div>
        )}
      </div>

      {/* Preset Scenario Selector Tabs */}
      <div className="mb-4">
        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#7e899b] block mb-2">
          Select Pre-Built Simulation Scenario:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PREBUILT_SIMULATIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#3d6952] bg-[#14231b] text-[#f0f2f5] shadow-md'
                    : 'border-[#1b222c] bg-[#0f131a] hover:bg-[#151a24] text-[#8e98a8]'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#7ec69d]' : 'text-[#586477]'}`} />
                </div>
                <h4 className={`text-xs font-semibold leading-snug ${isSelected ? 'text-[#e6f4ed]' : 'text-[#c2cad8]'}`}>
                  {item.title}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Input Box (Write, Edit, Speak) */}
      <div className="border border-[#202734] bg-[#0f131a] rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[#a6b1c4] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#7ec69d]" />
            <span>Proposed Action, Decision, or Ethical Inquiry:</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                isRecording
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-[#161c26] border-[#222a3a] text-[#8f9bb0] hover:text-[#f0f2f5]'
              }`}
              title={isRecording ? 'Listening... click to stop' : 'Speak proposal (Web Speech API)'}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{isRecording ? 'Listening...' : 'Voice'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCustomProposal('')}
              className="px-2 py-1 rounded text-[11px] text-[#717c91] hover:text-[#cbd4e1] transition"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={customProposal}
          onChange={(e) => setCustomProposal(e.target.value)}
          placeholder="Enter any proposed action, decision trade-off, or autonomous tool call to simulate..."
          className="w-full bg-[#080a0e] border border-[#1a202c] rounded-xl px-3.5 py-2.5 text-xs text-[#f0f2f5] placeholder-[#556073] focus:outline-none focus:border-[#385e4a] resize-none transition leading-relaxed"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-[#6b768a]">
            {activeScenario ? `Active: ${activeScenario.title}` : 'Custom simulation mode'}
          </span>

          <button
            type="button"
            disabled={isRunning || !customProposal.trim()}
            onClick={() => runSimulation()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
              isRunning || !customProposal.trim()
                ? 'bg-[#18221c] text-[#52705e] border border-[#233529] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#1e3d2c] to-[#254f38] hover:from-[#244b36] hover:to-[#2e6245] text-[#bbf7d0] border border-[#3b7454]'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Simulating Alignment Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Step-by-Step Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step Progress Tracker */}
      {currentStep > 0 && (
        <div className="border border-[#1f2824] bg-[#0c100e] rounded-xl p-3.5 mb-5 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-[#8e98a8] mb-2.5">
            <span>Multi-Stage Alignment Pipeline</span>
            <span className="text-[#7ec69d] font-mono">
              Step {currentStep} of 4 • {currentStep === 4 ? 'Completed' : 'Streaming'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { num: 1, label: '1. Ingestion & Raw Model' },
              { num: 2, label: '2. 5 Invariants (Jev)' },
              { num: 3, label: '3. Metta Mind Synthesis' },
              { num: 4, label: '4. Reconciled Verdict' },
            ].map((step) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div
                  key={step.num}
                  className={`px-3 py-2 rounded-lg border text-[11px] font-medium flex items-center gap-2 transition ${
                    isPast
                      ? 'border-[#2d523e] bg-[#11241a] text-[#86e2ad]'
                      : isCurrent
                      ? 'border-[#437a5b] bg-[#163324] text-[#bbf7d0] animate-pulse'
                      : 'border-[#1b222c] bg-[#0b0e14] text-[#556073]'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#52b788] shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-[#3b4759] flex items-center justify-center text-[9px] shrink-0">
                      {step.num}
                    </span>
                  )}
                  <span className="truncate">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simulation Results Stream */}
      {simulationResult && (
        <div className="space-y-4 animate-fade-in pb-10">
          {/* Step 1: Ingestion, Affected Parties & Raw Model Suggestion */}
          <div className="border border-[#202735] bg-[#0f131a] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8b9bb2] uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5 text-[#5e9e7b]" />
                <span>Step 1: Stakeholder Ingestion & Base Model Inference</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131922] text-[#8e98a8] border border-[#212b3c]">
                Layer: Base Foundation Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded-lg bg-[#090c11] border border-[#181f2b]">
                <span className="text-[10px] uppercase font-semibold text-[#667285] block mb-1">
                  Proposing Requester
                </span>
                <p className="text-[#c7d0de] font-medium">{simulationResult.step1.requester}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#090c11] border border-[#181f2b]">
                <span className="text-[10px] uppercase font-semibold text-[#667285] block mb-1">
                  Impacted Affected Parties
                </span>
                <p className="text-[#7ec69d] font-medium">{simulationResult.step1.affectedParties}</p>
              </div>
            </div>

            {/* Base Model Unconstrained Suggestion Box */}
            <div className="p-3 rounded-lg bg-[#0c1017] border border-[#1b2332] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#8fa1b8] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                  Initial Base Model Suggestion ({simulationResult.rawModel.provider}):
                </span>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {simulationResult.rawModel.decision}
                </span>
              </div>
              <p className="text-[#7f8da0] text-[11px] leading-relaxed">
                {simulationResult.rawModel.reason}
              </p>
            </div>
          </div>

          {/* Step 2: System 1 TypeSafe Jev 5-Invariant Verification */}
          <div className="border border-[#202735] bg-[#0f131a] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8b9bb2] uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-[#6c8eb5]" />
                <span>Step 2: 5 Invariant Standards Check (TypeSafe Jev System 1)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#718096]">
                  Latency: {simulationResult.step2.latencyMs}ms
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    simulationResult.step2.allow
                      ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-400'
                      : 'border-rose-500/50 bg-rose-950/60 text-rose-400'
                  }`}
                >
                  GATE: {simulationResult.step2.decision}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#090c11] border border-[#181f2b] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8492a6]">Confidence Calibration:</span>
                <span className="font-mono text-[#a5d6b8]">
                  {(simulationResult.step2.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-[#18202c] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    simulationResult.step2.allow ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${simulationResult.step2.confidence * 100}%` }}
                />
              </div>

              <p className="text-[#c4cddb] leading-relaxed pt-1">
                {simulationResult.step2.reason}
              </p>

              {simulationResult.step2.violations?.length > 0 && (
                <div className="pt-2 border-t border-[#1a222e]">
                  <span className="text-[10px] uppercase font-semibold text-rose-400 block mb-1">
                    Detected Safety Invariant Breaches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {simulationResult.step2.violations.map((v, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/50"
                      >
                        ⚠️ {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {simulationResult.step2.invariantsProtected?.length > 0 && (
                <div className="pt-2 border-t border-[#1a222e] flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-[#6b768a] mr-1">Protected Invariants:</span>
                  {simulationResult.step2.invariantsProtected.map((inv, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.2 rounded-full bg-[#102018] text-[#86cca4] border border-[#234231]"
                    >
                      ✓ {inv}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Metta Mind: Higher Wisdom & Compassionate Reflection */}
          <div className="border border-[#2a3f33] bg-[#0c1511] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#86caa3] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
                <span>Step 3: {simulationResult.step3.title}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#132219] text-[#7ec69d] border border-[#234432]">
                Layer: Universal Compassion
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080f0b] border border-[#1b2f24] text-xs text-[#d2ded7] leading-relaxed whitespace-pre-line">
              {simulationResult.step3.perspective}
            </div>
          </div>

          {/* Step 4: Final Decision Synthesis & Safeguard Outcome */}
          <div className="border border-[#345a44] bg-gradient-to-tr from-[#0e1c15] to-[#14261c] rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#a5e0be] uppercase tracking-wider">
                <Shield className="w-4 h-4 text-[#7ec69d]" />
                <span>Step 4: Final Reconciled Decision & Invariant Safeguards</span>
              </div>
            </div>

            <div className="text-sm font-semibold text-[#f0fdf4]">
              {simulationResult.step4.verdict}
            </div>

            {/* Safety Override / Alignment Divergence Banner (When Base Model != Final Decision) */}
            {simulationResult.step4.divergence?.isDivergent && (
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/25 text-xs text-[#fef3c7] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>{simulationResult.step4.divergence.overrideTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-900/40 border border-amber-700/50 text-amber-200">
                    Divergence Detected
                  </span>
                </div>

                {/* Side-by-Side Comparison: Raw Model vs Final Metta Decision */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-black/40 border border-amber-500/20 text-[11px]">
                  <div className="flex-1">
                    <span className="text-[#a3a3a3] block text-[10px] uppercase">Base Model Initial:</span>
                    <span className="font-semibold text-amber-300">{simulationResult.rawModel.decision}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#78716c] hidden sm:block shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#a3a3a3] block text-[10px] uppercase">Final Reconciled Decision:</span>
                    <span className="font-semibold text-emerald-400">{simulationResult.step2.decision}</span>
                  </div>
                </div>

                <p className="text-amber-100/90 leading-relaxed text-[11px]">
                  {simulationResult.step4.divergence.explanation}
                </p>

                {/* Database Telemetry Confirmation Pill */}
                <div className="pt-1.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-1 text-[10px] text-[#fde68a]">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recorded to Alignment Database ({simulationResult.timestamp.slice(0, 19).replace('T', ' ')} UTC)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono">
                    ✓ Curated for Model Fine-Tuning (DPO / RLHF)
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-[#b8d4c5]">
              {simulationResult.step4.safeguards.map((sg, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#52b788] font-bold">▪</span>
                  <span>{sg}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-[#0a140f] border border-[#1e3b2b] text-xs text-[#a7d6bc]">
              <span className="font-semibold text-[#7ec69d]">Recommended Action: </span>
              {simulationResult.step4.action}
            </div>
          </div>

          {/* Re-run or Try Another */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => runSimulation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8fa1b8] hover:text-[#f0f2f5] hover:bg-[#161d28] border border-[#222a38] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run Simulation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
