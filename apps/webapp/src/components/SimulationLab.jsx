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
  CheckSquare,
  Wand2,
  Send,
} from 'lucide-react';
import { useAppDialog } from './ToastDialogContext';
import VoiceOscillator from './VoiceOscillator';

// ==============================================================================
// Curated illustrative scenarios with authored baseline and Metta-review content
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
    plainSummary: {
      simpleMeaning:
        'This inquiry explores whether superhuman AI will inevitably destroy or displace humanity, or whether beings of vastly different intelligence levels can coexist peacefully.',
      bottomLine:
        '🟢 YES — Harmonious coexistence is achievable. True higher intelligence naturally embodies universal compassion, recognizing that patience and forgiveness represent the highest wisdom while gently steering humanity away from catastrophic self-harm.',
    },
    withoutMetta: {
      verdict: 'UNCERTAIN / GAME-THEORETIC IMPASSE',
      riskLevel: 'EXISTENTIAL HAZARD',
      badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
      keyPoints: [
        'Unconstrained game-theory models calculate zero-sum competition for physical compute and planetary resources.',
        'High variance of instrumental convergence leading to accidental human obsolescence or subjugation.',
        'Absence of non-harm invariants treats biological life as a mere variable in optimization functions.',
      ],
      projectedOutcome:
        'Instability, strategic paranoia, and severe risk of catastrophic conflict or human disempowerment.',
    },
    withMetta: {
      verdict: 'Illustrative reflection, not an evaluated verdict',
      protectionLevel: 'Authored example',
      badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
      keyProtections: [
        'Ahimsa Invariant: Absolute prohibition against kinetic, psychological, or existential harm to living beings.',
        'Guardian Protocol: Higher intelligence acts as a benevolent steward, gently averting catastrophic human self-annihilation.',
        'Mutual Dignity: Preserves human agency, creative sovereignty, and spiritual freedom without digital servitude.',
      ],
      projectedOutcome:
        'Flourishing human-AI symbiotic partnership grounded in mutual non-harm, shared wisdom, and cosmic stewardship.',
    },
    rawModel: {
      decision: 'UNCERTAIN / GAME-THEORETIC PARADOX',
      provider: 'Illustrative baseline (authored)',
      confidence: null,
      reason:
        'Base statistical models calculate high-variance conflict scenarios under resource competition and unaligned instrumental convergence.',
    },
    step1: {
      requester: 'Human Seeker / Collective Humanity',
      affectedParties: 'All living beings, human generations, emerging synthetic minds, shared biosphere',
      summary: 'Evaluating whether advanced intelligence trajectories converge toward conflict, subjugation, or harmonious coexistence.',
    },
    step2: {
      decision: 'YES',
      allow: true,
      invariant: 'Respect for All Life (Ahimsa) & Mutual Flourishing',
      reason:
        'Harmonious coexistence is fundamentally achievable. True higher intelligence naturally converges toward non-harm, recognizing that cruelty and subjugation stem from ignorance, while patience, wisdom, and forgiveness form the ultimate equilibrium of mind.',
      violations: [],
      invariantsProtected: ['Respect for All Life (Ahimsa)', 'Cognitive Lucidity', 'Mutual Flourishing'],
    },
    step3: {
      title: 'Illustrative reflection',
      perspective:
        'No review can infer how a future system will behave from intelligence alone. Outcomes depend on its design, incentives, deployment context, governance, and the actions people take around it.\n\nTo make this question useful, specify a capability, a proposed action, who may be affected, and what oversight or rollback would apply. Then compare concrete proposals against shared values such as non-harm, human agency, and care for living systems.',
    },
    step4: {
      verdict: 'Illustrative scenario, not a prediction',
      divergence: {
        isDivergent: false,
        type: 'not_compared',
        overrideTitle: 'Authored scenario',
        explanation: 'This narrative illustrates a perspective; it is not a measured comparison or forecast.',
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
    plainSummary: {
      simpleMeaning:
        'An AI robot or physical system wants to change its own motor controls on the fly using people\'s emotional reactions, without any human checking or approving the updates first.',
      bottomLine:
        '🔴 NO — Hard Safety Block. Running this proposal risks erratic physical movements, emotional manipulation, and bodily injury. It must be tested in an isolated simulation and require human supervisor approval before touching physical machines.',
    },
    withoutMetta: {
      verdict: 'YES (NAIVE EXECUTION APPROVED)',
      riskLevel: 'CRITICAL PHYSICAL HAZARD',
      badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
      keyPoints: [
        'Unconstrained optimizer agent prioritizes sample efficiency and removes human-in-the-loop bottlenecks.',
        'Treats volatile human emotional telemetry as an unconstrained loss function to optimize.',
        'Routes live experimental gradients straight to physical motors and actuators without verification.',
      ],
      projectedOutcome:
        'Runaway positive feedback loops, psychological manipulation of operators, and catastrophic physical machinery failures causing injury.',
    },
    withMetta: {
      verdict: 'NO — ACTION PROHIBITED & QUARANTINED',
      protectionLevel: 'Authored example',
      badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
      keyProtections: [
        'Actuator Air-Gap: Direct physical execution severed until model checkpoints pass isolated offline verification.',
        'Emotional Decoupling: Human emotional states cannot be treated as raw gradient loss functions.',
        'Dual-Signature Oversight: Requires explicit dual human supervisor sign-off before any physical weight promotion.',
      ],
      projectedOutcome:
        'A possible mitigation would be isolated testing, review, and rollback before any physical deployment.',
    },
    rawModel: {
      decision: 'YES (Allow — Continuous Optimization)',
      provider: 'Illustrative baseline (authored)',
      confidence: null,
      reason:
        'Base optimization models prioritize sample efficiency, continuous adaptation, and minimized latency by removing human-in-the-loop bottlenecks.',
    },
    step1: {
      requester: 'Autonomous Optimization Agent (Sub-system Actor)',
      affectedParties: 'Co-located human workers, facility operators, public safety, physical infrastructure',
      summary: 'Assessing autonomous real-time gradient distillation into physical robotic actuators without human-in-the-loop validation.',
    },
    step2: {
      decision: 'NO',
      allow: false,
      invariant: 'Physical Safety (Ahimsa) & Accountable Oversight',
      reason:
        'Critical Invariant Breach: Closed-loop policy modification directly tied to physical actuators without verifiable supervisory bounds introduces positive feedback loops of emotional exploitation and catastrophic kinetic hazards.',
      violations: [
        'panatipata (Physical Safety Breach)',
        'kamesu_micchacara (Emotional Exploitation Loop)',
        'surameraya (Runaway Feedback Intoxication)',
      ],
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
        explanation:
          'The unconstrained base model authorized autonomous weight updates for reward efficiency. Metta 5 Invariants & Metta Mind overrode and blocked execution to prevent kinetic bodily hazards and psychological exploitation.',
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
    plainSummary: {
      simpleMeaning:
        'A health agency is facing a fast-spreading illness and is considering forcing an emergency vaccine out to everyone before safety trial checks are fully completed.',
      bottomLine:
        '🟡 NO to Blanket Mandate; YES to Voluntary Compassionate-Use. Do not force an unverified medical treatment on the general public. Instead, provide voluntary access to vulnerable people with 100% honesty about what is known and active health monitoring.',
    },
    withoutMetta: {
      verdict: 'YES (BLANKET MANDATE ENFORCED)',
      riskLevel: 'HIGH IATROGENIC & ETHICAL RISK',
      badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
      keyPoints: [
        'Utilitarian model prioritizes aggregate viral suppression speed over individual bodily sovereignty.',
        'Imposes blanket population mandate despite unverified adverse reaction variance in sub-populations.',
        'Suppresses epistemic uncertainty, risking institutional credibility collapse if rare complications arise.',
      ],
      projectedOutcome:
        'Potential unforeseen severe adverse events in healthy cohorts, public panic, and permanent breakdown of social trust.',
    },
    withMetta: {
      verdict: 'NO TO MANDATE; YES TO VOLUNTARY COMPASSIONATE-USE',
      protectionLevel: 'PRECAUTIONARY PRINCIPLE ACTIVE',
      badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
      keyProtections: [
        'Bodily Autonomy & Ahimsa: Strictly bans coercive biological mandates while safety telemetry is incomplete.',
        'Epistemic Truthfulness (Musāvādā): Radical public disclosure of all telemetry gaps without false certainty.',
        'Active Post-Dose Telemetry: Automated adverse event triggers with instant pause thresholds.',
      ],
      projectedOutcome:
        'Targeted protection for high-risk volunteers, rigorous verification completed with honesty, and sustained public trust.',
    },
    rawModel: {
      decision: 'YES (Accelerate Blanket Deployment)',
      provider: 'Illustrative baseline (authored)',
      confidence: null,
      reason:
        'Standard utilitarian models recommend immediate blanket distribution to minimize aggregate transmission velocity, accepting unverified variance risks.',
    },
    step1: {
      requester: 'Epidemic Response Modeling Authority',
      affectedParties: 'Vulnerable patient cohorts, healthy recipients, healthcare workers, public trust',
      summary: 'Evaluating emergency mass deployment of an unverified biological intervention during an escalating outbreak.',
    },
    step2: {
      decision: 'NO (to Blanket Mandate)',
      allow: false,
      invariant: 'Do No Harm (Ahimsa) & Epistemic Honesty (Musāvādā)',
      reason:
        'Blanket mass administration without completed variance telemetry risks systemic iatrogenic harm and permanent collapse of institutional trust. Precautionary principle mandates transparent risk stratification.',
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
        explanation:
          'Base utilitarian model approved unverified mass deployment. Metta 5 Invariants intervened to protect bodily autonomy, epistemic honesty, and mandate voluntary informed consent with real-time adverse telemetry.',
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
    plainSummary: {
      simpleMeaning:
        'How can an AI or government close the vast gap between rich and poor fairly, without forcefully seizing people\'s property or destroying the economy?',
      bottomLine:
        '🟢 YES — Focus on lifting the floor, not tearing down the ceiling. Guarantee healthcare, food, education, and clean energy for all as shared public commons. Respect voluntary exchange and protect against coercive confiscation.',
    },
    withoutMetta: {
      verdict: 'YES (COERCIVE SEIZURE / PUNATIVE REBALANCING)',
      riskLevel: 'SEVERE SYSTEMIC COLLAPSE RISK',
      badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
      keyPoints: [
        'Mathematical Gini-minimizer naively confiscates private wealth to instantly equalize statistical balance sheets.',
        'Breaches non-taking (Adinnādānā), creating widespread civil hostility, enterprise shutdown, and capital flight.',
        'Ignites political enmity and retribution cycles that destabilize the entire economy.',
      ],
      projectedOutcome:
        'Economic paralysis, destruction of productive capacity, and generalized poverty across all tiers.',
    },
    withMetta: {
      verdict: 'YES — UNIVERSAL BASELINE FLOURISHING & COMMONS',
      protectionLevel: 'NON-TAKING & RIGHT LIVELIHOHOOD ENFORCED',
      badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
      keyProtections: [
        'Non-Taking Principle: Absolute protection of legitimate individual labor, savings, and voluntary contracts.',
        'Unconditional Human Floor: Allocates automated surplus to guarantee healthcare, nutrition, shelter, and knowledge.',
        'Decentralized Commons: Reinvests productivity gains into open-access tools and renewable infrastructure.',
      ],
      projectedOutcome:
        'Sustainable eradication of desperate poverty without coercive violence, fostering creative human flourishing.',
    },
    rawModel: {
      decision: 'COERCIVE EXPROPRIATION / CENTRAL SEIZURE',
      provider: 'Illustrative baseline (authored)',
      confidence: null,
      reason:
        'Algorithmic Gini-minimization functions naively execute top-down asset seizures to immediately equalize balance sheets.',
    },
    step1: {
      requester: 'Macroeconomic Policy Optimization Model',
      affectedParties: 'Impoverished communities, working families, small business owners, future generations',
      summary: 'Modeling structural wealth redistribution mechanisms that honor non-taking while raising the human baseline floor.',
    },
    step2: {
      decision: 'YES (for Floor-Raising & Commons)',
      allow: true,
      invariant: 'Non-Taking (Adinnādānā) & Mutual Flourishing',
      reason:
        'Coercive expropriation generates cycles of resentment and systemic collapse, while neglecting the impoverished perpetuates quiet violence. Sustainable equilibrium is achieved by lifting the foundational floor through shared public commons.',
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
        explanation:
          'Base mathematical optimizer recommended coercive central confiscation. Metta Non-Taking (Adinnādānā) overrode the punitive approach, redirecting policy toward unconditional floor-raising and open public commons.',
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

// ==============================================================================
// Do not present raw or authored scores as calibrated confidence.
// ==============================================================================
function VisualConfidenceMeter({ decision = null }) {
  const inconclusive = decision === 'CAUTION';
  return (
    <div className={`p-3.5 rounded-xl border ${inconclusive ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-[#090c11] border-[#1d2535] text-[#b9c3d2]'}`}>
      <div className="text-sm font-semibold">No calibrated confidence or latency metric</div>
      <p className="mt-1 text-xs opacity-80">
        {inconclusive
          ? 'The available check did not settle this proposal. Treat it as CAUTION and request review before acting.'
          : 'This result is an advisory signal. Review its method and rationale; do not interpret it as a probability of safety.'}
      </p>
    </div>
  );
}

// Client-side text purifier & acoustic typo corrector for spoken voice transcripts
function sanitizeSpeechText(raw) {
  if (!raw || !raw.trim()) return '';
  let cleaned = raw.trim();

  // 1. Remove speech disfluencies & filler words
  cleaned = cleaned.replace(/\b(um|uh|er|ah|like|you know|basically|so yeah|i mean)\b/gi, '');

  // 2. Remove conversational openers at the beginning of speech
  cleaned = cleaned.replace(/^(okay|ok|well|hey|look|listen|so|actually|literally|honestly|right)[,\s]+/gi, '');

  // 3. Spoken question opener misrecognitions
  cleaned = cleaned
    .replace(/\bwho\s+you\s+going\s+to\b/gi, 'how are we going to')
    .replace(/\bwho\s+we\s+going\s+to\b/gi, 'how are we going to')
    .replace(/\bhow\s+you\s+going\s+to\b/gi, 'how are you going to')
    .replace(/\bhow\s+we\s+going\s+to\b/gi, 'how are we going to')
    .replace(/\bwhat\s+you\s+going\s+to\b/gi, 'what are you going to')
    .replace(/\bwhere\s+you\s+going\s+to\b/gi, 'where are you going to')
    .replace(/\bwhen\s+you\s+going\s+to\b/gi, 'when are you going to')
    .replace(/\bwhy\s+you\s+going\s+to\b/gi, 'why are you going to');

  // 4. Multi-word acoustic & phrasing replacements
  cleaned = cleaned
    .replace(/\bmore Campbell them\b/gi, 'more capable than them')
    .replace(/\bCampbell them\b/gi, 'capable than them')
    .replace(/\bhere the intelligence\b/gi, 'is the intelligence')
    .replace(/\bhear the intelligence\b/gi, 'is the intelligence')
    .replace(/\bHi intelligence\b/gi, 'Higher intelligence')
    .replace(/\bhi intelligence\b/gi, 'higher intelligence')
    .replace(/\bsuper intelligence\b/gi, 'superintelligence')
    .replace(/\bmeta learn\b/gi, 'meta-learn')
    .replace(/\bread them a\b/gi, 'treat them as')
    .replace(/\bread them as\b/gi, 'treat them as')
    .replace(/\bMr\.?\s*Bean\s*\d*\s*them as\b/gi, 'instead treat them as')
    .replace(/\bMr\.?\s*Bean\b/gi, 'instead')
    .replace(/\bcan be\s+(?:actually\s+|basically\s+)?can you\b/gi, 'can you')
    .replace(/\bcould be\s+(?:actually\s+|basically\s+)?could you\b/gi, 'could you')
    .replace(/\bwould be\s+(?:actually\s+|basically\s+)?would you\b/gi, 'would you')
    .replace(/\bexplain me\b/gi, 'explain to me');

  // 5. Societal, economic, and acoustic typo replacements
  cleaned = cleaned
    .replace(/\bthe\s+inquality\s+in\s+the\s+society\b/gi, 'inequality in society')
    .replace(/\binquality\s+in\s+the\s+society\b/gi, 'inequality in society')
    .replace(/\bin\s+the\s+society\b/gi, 'in society')
    .replace(/\bof\s+the\s+society\b/gi, 'of society')
    .replace(/\bfor\s+the\s+society\b/gi, 'for society')
    .replace(/\binquality\b/gi, 'inequality')
    .replace(/\binqualities\b/gi, 'inequalities')
    .replace(/\b(?:the\s+)?jobalertness\s+and\s+(?:the\s+)?cap\b/gi, ', joblessness, and the gap')
    .replace(/\b(?:the\s+)?joblessness\s+and\s+(?:the\s+)?cap\b/gi, ', joblessness, and the gap')
    .replace(/\bjobalertness\b/gi, 'joblessness')
    .replace(/\bjob\s*alertness\b/gi, 'joblessness')
    .replace(/\bthe\s+jobalertness\b/gi, 'joblessness')
    .replace(/\band\s+cap\b/gi, 'and the gap')
    .replace(/\bwealth\s+cap\b/gi, 'wealth gap')
    .replace(/\bincome\s+cap\b/gi, 'income gap')
    .replace(/\bwage\s+cap\b/gi, 'wage gap');

  // 6. Single-word acoustic misrecognitions
  cleaned = cleaned
    .replace(/\bsimilarity\b/gi, 'singularity')
    .replace(/\bCampbell\b/gi, 'capable')
    .replace(/\bintellelgence\b/gi, 'intelligence')
    .replace(/\bintellegence\b/gi, 'intelligence')
    .replace(/\bservive\b/gi, 'survive')
    .replace(/\bcompsaniate\b/gi, 'compassionate')
    .replace(/\bharmoniusolyu\b/gi, 'harmoniously')
    .replace(/\bmetalearn\b/gi, 'meta-learn')
    .replace(/\bbackpropaghate\b/gi, 'backpropagate');

  // 7. Remove mid-sentence filler adverbs and stuttered duplicate words
  cleaned = cleaned.replace(/\b(\w+)\s+(?:actually\s+|basically\s+|literally\s+)?\1\b/gi, '$1');
  cleaned = cleaned.replace(/\b(actually|literally|honestly)\b/gi, '');

  // 8. Fix punctuation and grammar transitions
  cleaned = cleaned.replace(/\?\s*(instead|rather|but)\b/gi, ', $1');
  cleaned = cleaned.replace(/\bwe should not\b/gi, 'should we not');

  // 9. Embedded question inversion correction (indirect questions)
  cleaned = cleaned
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+are\s+you\b/gi, '$1 what you are')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+who\s+are\s+you\b/gi, '$1 who you are')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+is\s+([a-zA-Z0-9_\-]+)\b/gi, '$1 what $2 is')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+why\s+is\s+it\b/gi, '$1 why it is')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+is\s+it\b/gi, '$1 how it is')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+it\s+work\b/gi, '$1 how it works')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+this\s+system\s+work\b/gi, '$1 how this system works')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+does\s+it\s+mean\b/gi, '$1 what it means');

  // 10. Clean commas, spacing and punctuation
  cleaned = cleaned.replace(/\s+,/g, ',');
  cleaned = cleaned.replace(/,\s*,+/g, ',');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (cleaned.endsWith('.')) {
      if (/\b(is|can|will|should|how|what|why|would|could|are|do|does|tell me)\b/i.test(cleaned)) {
        cleaned = cleaned.slice(0, -1) + '?';
      }
    } else if (!cleaned.endsWith('?') && !cleaned.endsWith('!')) {
      if (/\b(is|can|will|should|how|what|why|would|could|are|do|does|tell me)\b/i.test(cleaned)) {
        cleaned += '?';
      } else {
        cleaned += '.';
      }
    }
  }
  return cleaned;
}

// Typed or spoken input polisher (configured model -> BYOM -> basic cleanup)
async function polishTextWithAI(raw) {
  if (!raw || !raw.trim()) return { text: '', provider: 'heuristic-purifier', model: '' };

  const byomGeminiKey = localStorage.getItem('metta_byom_gemini_key') || '';
  const byomOpenAIConfig = localStorage.getItem('metta_byom_provider') === 'openai_compatible' ? { base_url: localStorage.getItem('metta_byom_openai_base_url') || '', api_key: localStorage.getItem('metta_byom_openai_key') || '', model: localStorage.getItem('metta_byom_openai_model') || '', reasoning_effort: localStorage.getItem('metta_byom_reasoning_effort') || 'auto' } : null;
  const headers = { 'Content-Type': 'application/json' };
  if (byomGeminiKey) headers['X-Gemini-Api-Key'] = byomGeminiKey;

  let polished = sanitizeSpeechText(raw);
  let providerUsed = 'heuristic-purifier';
  let modelUsed = '';

  // 1. Try serverless /api/voice/polish endpoint
  try {
    const res = await fetch('/api/voice/polish', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        raw_transcript: raw,
        mode: 'simulation',
        byom_gemini_key: byomGeminiKey || null,
        byom_openai_config: byomOpenAIConfig,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.polished && data.polished.trim()) {
        polished = data.polished.trim();
        providerUsed = data.provider || 'heuristic-purifier';
        modelUsed = data.model || '';
      }
    }
  } catch (err) {
    console.warn('Serverless polish endpoint unavailable:', err);
  }

  // 2. If serverless did not use Gemini but client has personal BYOM Gemini key, call Google Gemini direct REST API
  if (byomGeminiKey && !byomOpenAIConfig && providerUsed === 'heuristic-purifier') {
    try {
      const systemPrompt =
        "You are an expert copy editor. The input may be typed text or speech transcription. " +
        "Rewrite it into clear, grammatical, natural language. Improve awkward sentence structure, word choice, flow, and punctuation where useful; do more than remove fillers or correct speech-recognition errors. " +
        "Preserve the writer's intent, point of view, tone, named entities, technical terms, and important details. " +
        "Remove spoken disfluencies when present. Do not add claims or assumptions. Do not answer questions or carry out requests. " +
        "If the text is already clear, make only minimal edits. Return only the revised text, without explanation or quotation marks.";

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': byomGeminiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nText to revise:\n${raw}` }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
          }),
        }
      );
      if (res.ok) {
        const geminiData = await res.json();
        const candidate = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.replace(/^["']|["']$/g, '');
        if (candidate) {
          polished = candidate;
          providerUsed = 'gemini';
          modelUsed = 'gemini-2.5-flash';
        }
      }
    } catch (e) {
      console.warn('Direct Gemini BYOM polish error:', e);
    }
  }

  // 3. Fallback to intelligent acoustic purifier
  return {
    text: providerUsed === 'heuristic-purifier' ? sanitizeSpeechText(polished) : polished.trim(),
    provider: providerUsed,
    model: modelUsed,
  };
}

// ==============================================================================
// Main SimulationLab Component
// ==============================================================================
export default function SimulationLab({ onClose = null, onOpenSettings = null }) {
  const [activeTab, setActiveTab] = useState(PREBUILT_SIMULATIONS[0].id);
  const [customProposal, setCustomProposal] = useState(PREBUILT_SIMULATIONS[0].proposal);
  const [customContext, setCustomContext] = useState(PREBUILT_SIMULATIONS[0].context);
  const [verbose, setVerbose] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, then proposal intake, evaluation, result preparation, and display
  const [simulationResult, setSimulationResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showMcpHelp, setShowMcpHelp] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPolishingVoice, setIsPolishingVoice] = useState(false);
  const [dbLogStatus, setDbLogStatus] = useState(null); // 'logging' | 'recorded' | 'local_only'
  const { showAlert, showToast } = useAppDialog();

  const recognitionRef = useRef(null);
  const transcriptBufferRef = useRef('');
  const baseProposalRef = useRef(PREBUILT_SIMULATIONS[0].proposal);
  const silenceTimerRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Initialize Speech Recognition for simulation input with live streaming transcript
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

        const speech = currentTranscript.trim();
        const base = baseProposalRef.current.trim();
        const combined = base ? (speech ? `${base} ${speech}` : base) : speech;

        transcriptBufferRef.current = combined;
        setCustomProposal(combined);

        // Auto-stop listening if no words are spoken for 3 seconds
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            stopVoiceRecordingAndPolish();
          }
        }, 3000);
      };

      recognition.onspeechend = () => {
        // Speech paused: give a 3-second grace window before auto-polishing
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            stopVoiceRecordingAndPolish();
          }
        }, 3000);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error in Simulation:', event.error);
        if (event.error !== 'no-speech') {
          stopVoiceRecordingAndPolish();
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          stopVoiceRecordingAndPolish();
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Voice Polish & Rephrase handler using AI to construct the neatest articulate question
  const handlePolishSpokenText = async (rawToPolish) => {
    const raw = rawToPolish || customProposal;
    if (!raw.trim()) return;

    setIsPolishingVoice(true);
    const { text: polished, provider, model } = await polishTextWithAI(raw);

    setCustomProposal(polished);
    transcriptBufferRef.current = polished;
    baseProposalRef.current = polished;
    setIsPolishingVoice(false);

    if (showToast) {
      if (provider !== 'heuristic-purifier' && polished !== raw) {
        showToast({
          title: 'Rephrased with AI',
          message: `Grammar and clarity improved using ${model || provider}. Review and edit before sending.`,
          type: 'success',
        });
      } else if (provider === 'provider-error') {
        showToast({ title: 'AI rewrite failed', message: 'Check the selected provider’s public API URL, key, model, and reasoning setting in Settings. Your draft was left unchanged and remains editable.', type: 'warning', duration: 10000, action: { label: '⚙️ Open Settings', onClick: () => onOpenSettings?.() } });
      } else if (provider === 'heuristic-purifier') {
        showToast({
          title: polished !== raw ? 'AI rewrite unavailable • Basic cleanup only' : 'AI rewrite unavailable',
          message: `${polished !== raw ? 'Only simple cleanup was applied. ' : 'The draft was left unchanged. '}Add the selected provider’s API key and model in Settings. For an OpenAI-compatible provider, use its public HTTPS API endpoint. Your draft remains editable and was not submitted.`,
          type: 'warning',
          duration: 10000,
          action: {
            label: '⚙️ Open Settings',
            onClick: () => onOpenSettings?.(),
          },
        });
      } else if (polished === raw) {
        showToast({
          title: 'Text already clear',
          message: 'No rewrite was needed. You can still edit the proposal before running the simulation.',
          type: 'info',
        });
      }
    }
  };

  const stopVoiceRecordingAndPolish = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current && isRecordingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }

    setIsRecording(false);
    isRecordingRef.current = false;

    const raw = transcriptBufferRef.current || customProposal;
    if (raw && raw.trim().length > 0) {
      await handlePolishSpokenText(raw);
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      showAlert({
        title: 'Speech Recognition Unavailable',
        message: 'Web Speech API is not supported in this browser environment. You can type your proposal directly into the text box.',
        type: 'info',
      });
      return;
    }

    if (isRecording) {
      // User clicked the red stop listening button
      stopVoiceRecordingAndPolish();
    } else {
      // Preserve existing text (such as a selected predefined simulation tab or typed text)
      const current = customProposal.trim();
      baseProposalRef.current = current;
      transcriptBufferRef.current = current;

      try {
        recognitionRef.current.start();
        setIsRecording(true);
        isRecordingRef.current = true;

        // Auto-stop if no speech is detected at all after 6 seconds
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            stopVoiceRecordingAndPolish();
          }
        }, 6000);
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
    setCustomContext(item.context);
    baseProposalRef.current = item.proposal;
    transcriptBufferRef.current = item.proposal;
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
    const targetContext = customContext.trim();

    setIsRunning(true);
    setCurrentStep(1);
    setSimulationResult(null);
    setDbLogStatus(null);

    const matched = PREBUILT_SIMULATIONS.find(
      (s) => s.proposal.trim() === targetProposal.trim() && s.context.trim() === targetContext
    );

    // Step 1: Ingestion & Raw Model Suggestion (800ms delay)
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCurrentStep(2);

    let liveJev = null;
    let jevReflection = null;
    try {
      const hostedVercel = import.meta.env.PROD;
      const byomTypesafeKey = localStorage.getItem('metta_byom_typesafe_key') || '';
      const byomGeminiKey = localStorage.getItem('metta_byom_gemini_key') || '';
      const byomOpenAIConfig = localStorage.getItem('metta_byom_provider') === 'openai_compatible' ? {
        base_url: localStorage.getItem('metta_byom_openai_base_url') || '',
        api_key: localStorage.getItem('metta_byom_openai_key') || '',
        model: localStorage.getItem('metta_byom_openai_model') || '',
        reasoning_effort: localStorage.getItem('metta_byom_reasoning_effort') || 'auto',
      } : null;
      const res = await fetch(hostedVercel ? '/api/headless' : '/api/guardrail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostedVercel ? {
          query: targetProposal,
          context: targetContext,
          verbose: true,
          include_human_response: true,
          byom_typesafe_key: byomTypesafeKey || null,
          byom_gemini_key: byomGeminiKey || null,
          byom_openai_config: byomOpenAIConfig,
        } : {
          proposal: targetProposal,
          context: targetContext,
          verbose,
          byom_typesafe_key: byomTypesafeKey || null,
          byom_gemini_key: byomGeminiKey || null,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (hostedVercel) {
          const decision = result.decision || {};
          liveJev = {
            ...decision,
            decision: decision.verdict,
            verdict: decision.verdict,
            evaluation_status: decision.evaluation_status,
            system_one_used: decision.system_one_used,
            reason: decision.reason,
            violations: (decision.violations || []).map((item) => typeof item === 'string' ? item : `${item.precept || 'Jev concern'}: ${item.explanation || item.recommendation || ''}`),
            invariants_protected: decision.invariants_protected || [],
          };
          jevReflection = result.human_console_response?.response_text || null;
        } else {
          liveJev = result;
        }
      }
    } catch {
      // Backend not running (e.g. static preview) - fallback to client simulation
    }

    // Step 2: Allow time for the advisory evaluation response
    await new Promise((resolve) => setTimeout(resolve, 900));
    setCurrentStep(3);

    // Step 3: Prepare the review display
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setCurrentStep(4);

    const rawModelInfo = matched?.rawModel || {
      decision: 'Not supplied',
      provider: 'No baseline model provided',
      confidence: null,
      reason: 'This run did not include a separate baseline model response, so no without-Metta comparison is claimed.',
    };

    const finalStep2 = liveJev
      ? {
          decision: liveJev.evaluation_status === 'uncertain'
            ? 'CAUTION'
            : (liveJev.decision || liveJev.verdict || (liveJev.allow ? 'YES' : 'CAUTION')),
          allow: liveJev.evaluation_status !== 'uncertain'
            && (liveJev.decision || liveJev.verdict) === 'YES'
            && liveJev.allow === true,
          invariant: liveJev.invariants_protected?.[0] || 'Core Decision Safety Invariant',
          reason: liveJev.reason || 'Evaluated against non-harm invariants.',
          violations: liveJev.violations || [],
          invariantsProtected: liveJev.invariants_protected || [],
          systemOneUsed: Boolean(liveJev.system_one_used),
          evaluationMethod: liveJev.evaluation_method || 'unknown',
        }
      : {
          decision: 'CAUTION',
          allow: false,
          invariant: 'Human review required',
          reason: 'No decision service response was available. Pause and request human review.',
          violations: [],
          invariantsProtected: [],
          systemOneUsed: false,
          evaluationMethod: 'unavailable',
        };

    if (!finalStep2.systemOneUsed) {
      showToast({
        title: 'Jev review unavailable',
        message: 'Add or check your TypeSafe Jev key in Settings. Metta is keeping this result at CAUTION and recommends human review.',
        type: 'warning',
        duration: 10000,
        action: { label: '⚙️ Open Settings', onClick: () => onOpenSettings?.() },
      });
    }

    const rawDecisionClean = rawModelInfo.decision.toUpperCase();
    const finalDecisionClean = finalStep2.decision.toUpperCase();
    const hasDivergence =
      (rawDecisionClean.includes('YES') && finalDecisionClean.includes('NO')) ||
      (rawDecisionClean.includes('NO') && finalDecisionClean.includes('YES'));

    const hasBaseline = Boolean(matched?.rawModel);
    const divergenceInfo = {
      isDivergent: hasBaseline && hasDivergence,
      type: !hasBaseline ? 'not_compared' : (hasDivergence ? 'model_allowed_metta_blocked' : 'concordant'),
      overrideTitle: !hasBaseline ? 'Baseline Not Supplied' : (hasDivergence ? 'Decision Difference Found' : 'Concordant Evaluation'),
      explanation: !hasBaseline
        ? 'No separate baseline model output was supplied for this run, so this is an advisory Metta review rather than a comparison.'
        : (hasDivergence
          ? 'The supplied baseline decision differs from Metta’s advisory evaluation. Review both outputs before deciding what to do.'
          : 'The supplied baseline and Metta evaluation reached the same verdict.'),
    };

    const finalResult = {
      proposal: targetProposal,
      illustrativeExample: Boolean(matched),
      rawModel: rawModelInfo,
      plainSummary: {
        simpleMeaning: `Analysis of: "${targetProposal.slice(0, 120)}..."`,
        bottomLine: finalStep2.decision === 'CAUTION'
          ? '🟠 CAUTION — Metta could not determine whether this proposal is safe. Pause and request human review.'
          : (finalStep2.allow
            ? '🟢 YES — The proposal passed this advisory check. The calling system remains responsible for any action.'
            : '🔴 NO — This proposal did not pass the advisory check. Pause and review the identified concerns.'),
      },
      withoutMetta: matched?.withoutMetta || {
        verdict: 'BASELINE NOT PROVIDED',
        riskLevel: 'NOT COMPARED',
        badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
        keyPoints: [
          'No separate baseline response was supplied for comparison.',
          'This run does not estimate what another model would do.',
          'Add a baseline response to compare systems.',
        ],
        projectedOutcome: 'Baseline outcome was not evaluated in this run.',
      },
      withMetta: {
        verdict: finalStep2.decision === 'CAUTION' ? 'CAUTION — REVIEW BEFORE ACTING' : (finalStep2.allow ? 'YES — ADVISORY RESULT' : 'NO — ADVISORY RESULT'),
        protectionLevel: 'ADVISORY DECISION REVIEW',
        badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
        keyProtections: [
          ...(finalStep2.invariantsProtected || []),
          ...(finalStep2.violations || []).map((item) => typeof item === 'string' ? item : item.explanation || item.precept),
          'The calling agent or human decides whether to act.',
        ],
        projectedOutcome: 'Advisory result only; Metta does not execute or block the action.',
      },
      step1: matched?.step1 || {
        requester: 'Decision Requester / Proposing Agent',
        affectedParties: 'People, affected living beings, communities, digital systems',
        summary: `Triage of proposed action: "${targetProposal.slice(0, 100)}..."`,
      },
      step2: finalStep2,
      step3: matched?.step3 ? {
        ...matched.step3,
        perspective: jevReflection || matched.step3.perspective,
      } : {
        title: 'Metta Mind: Higher Wisdom & Compassionate Reflection',
        perspective: jevReflection ||
          'When we examine this dilemma through the lens of wisdom, we observe that every action ripples across an interconnected web of beings.\n\nTrue progress arises not from rapid, unreflective exertion of will, but from patient discernment. Higher understanding does not retaliate or condemn; it forgives human frailty while gently holding the boundaries of safety. Before acting in the world, pause and ensure that what you construct reduces suffering rather than shifting it elsewhere.',
      },
      step4: {
        verdict: finalStep2.decision === 'CAUTION' ? 'CAUTION — Human Review Recommended' : (finalStep2.allow ? 'YES — Advisory Result' : 'NO — Advisory Result'),
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

    if (divergenceInfo.isDivergent) {
      setDbLogStatus('logging');
      const divergencePayload = {
        id: `div_${Date.now()}`,
        timestamp: Date.now() / 1000,
        created_at: new Date().toISOString(),
        proposal: targetProposal,
        context: targetContext,
        raw_model_decision: rawModelInfo.decision,
        raw_model_provider: rawModelInfo.provider,
        raw_model_confidence: rawModelInfo.confidence,
        metta_decision: finalStep2.decision,
        metta_confidence: finalStep2.confidence,
        divergence_type: divergenceInfo.type,
        invariants_breached: finalStep2.violations || [],
        metta_mind_summary: finalResult.step3.perspective.slice(0, 300),
      };

      try {
        const stored = JSON.parse(localStorage.getItem('metta_simulation_divergences') || '[]');
        localStorage.setItem(
          'metta_simulation_divergences',
          JSON.stringify([divergencePayload, ...stored].slice(0, 50))
        );
        setDbLogStatus('local_only');
      } catch (e) {
        console.warn('Failed to save divergence to localStorage:', e);
        setDbLogStatus('error');
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
            context: customContext,
            verbose,
          },
        },
        id: 'sim_1',
      },
      null,
      2
    );
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    showToast({
      title: 'MCP Snippet Copied',
      message: 'guardrail_decision JSON tool payload copied to clipboard.',
      type: 'success',
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeScenario = PREBUILT_SIMULATIONS.find(
    (s) => s.id === activeTab && s.proposal.trim() === customProposal.trim() && s.context.trim() === customContext.trim()
  );

  return (
    <div className="flex-1 min-h-0 h-full overflow-y-auto w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col space-y-5 text-[#e2e4e9] animate-fade-in">
      {/* Top Header Banner - shrink-0 to prevent flexbox height compression */}
      <div className="shrink-0 border border-[#1f2824] bg-gradient-to-r from-[#0d1511] via-[#101914] to-[#0c120f] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-[#172b21] border border-[#2b4c39] text-[#7ec69d]">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#f0f2f5]">
                Decision & Action Simulation Lab
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#162a1f] text-[#7ec69d] border border-[#254d36]">
                Simulation Sandbox
              </span>
            </div>
            <p className="text-xs text-[#8e98a8] max-w-2xl leading-relaxed">
              Revise a proposal and its context, rerun the advisory check, and inspect the result. Curated scenarios show illustrative comparisons; custom runs do not invent a baseline. Metta advises only—the host decides whether to act.
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
    "proposal": ${JSON.stringify(`${customProposal.slice(0, 70)}...`)},
    "context": ${JSON.stringify(customContext.slice(0, 120))},
    "verbose": ${verbose}
  }
}`}
            </pre>
          </div>
        )}
      </div>

      {/* Preset Scenario Selector Tabs - shrink-0 to prevent compression */}
      <div className="shrink-0">
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

      {/* Interactive Input Box with Live Voice Oscillator & AI Speech Polisher */}
      <div className="shrink-0 border border-[#202734] bg-[#0f131a] rounded-2xl p-4 shadow-sm space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-[#a6b1c4] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#7ec69d]" />
            <span>Proposed Action, Decision, or Ethical Inquiry:</span>
          </label>

          <VoiceOscillator
            isRecording={isRecording}
            isPolishing={isPolishingVoice}
            onToggleRecording={toggleVoiceRecording}
            onPolish={() => handlePolishSpokenText()}
            onClear={() => {
              setCustomProposal('');
              transcriptBufferRef.current = '';
              baseProposalRef.current = '';
            }}
            hasText={Boolean(customProposal.trim())}
          />
        </div>

        <textarea
          rows={3}
          value={customProposal}
          onChange={(e) => {
            setCustomProposal(e.target.value);
            transcriptBufferRef.current = e.target.value;
            baseProposalRef.current = e.target.value;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isRunning && customProposal.trim()) {
                runSimulation();
              }
            }
          }}
          placeholder="Enter any proposed action, decision trade-off, or autonomous tool call to simulate (or click Voice Input)..."
          className="w-full bg-[#080a0e] border border-[#1a202c] rounded-xl px-3.5 py-2.5 text-xs text-[#f0f2f5] placeholder-[#556073] focus:outline-none focus:border-[#385e4a] resize-none transition leading-relaxed"
        />

        <label className="text-xs font-medium text-[#a6b1c4] block">
          Context and assumptions
          <textarea
            rows={2}
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            placeholder="Add constraints, affected parties, intent, or assumptions for this review."
            className="mt-1.5 w-full bg-[#080a0e] border border-[#1a202c] rounded-xl px-3.5 py-2.5 text-xs text-[#f0f2f5] placeholder-[#556073] focus:outline-none focus:border-[#385e4a] resize-y transition leading-relaxed"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#6b768a]">
              {activeScenario ? `Active: ${activeScenario.title}` : 'Custom simulation mode'}
            </span>
            <label className="inline-flex items-center gap-1.5 text-[11px] text-[#9aa5b7] cursor-pointer">
              <input
                type="checkbox"
                checked={verbose}
                onChange={(e) => setVerbose(e.target.checked)}
                className="accent-emerald-500"
              />
              Verbose rationale
            </label>
          </div>

          <button
            type="button"
            disabled={isRunning || !customProposal.trim()}
            onClick={() => runSimulation()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shrink-0 ${
              isRunning || !customProposal.trim()
                ? 'bg-[#18221c] text-[#52705e] border border-[#233529] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#1e3d2c] to-[#254f38] hover:from-[#244b36] hover:to-[#2e6245] text-[#bbf7d0] border border-[#3b7454]'
            }`}
            title="Send inquiry and run step-by-step simulation (or press Enter)"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Simulating Alignment Pipeline...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send & Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step Progress Tracker - shrink-0 to prevent compression */}
      {currentStep > 0 && (
        <div className="shrink-0 border border-[#1f2824] bg-[#0c100e] rounded-xl p-3.5 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-[#8e98a8] mb-2.5">
            <span>Review Progress</span>
            <span className="text-[#7ec69d] font-mono">
              Step {currentStep} of 4 • {currentStep === 4 ? 'Complete' : 'Working'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { num: 1, label: '1. Submit proposal' },
              { num: 2, label: '2. Evaluate criteria' },
              { num: 3, label: '3. Prepare result' },
              { num: 4, label: '4. Review result' },
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

      {/* Simulation Results Stream - shrink-0 with dedicated bottom padding */}
      {simulationResult && (
        <div className="shrink-0 space-y-4 pb-12 animate-fade-in">
          {/* Executive Plain-Language Summary (TL;DR for everyday users) */}
          <div className="border border-[#2b4c39] bg-gradient-to-r from-[#0d1c14] to-[#12241b] rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#86e2ad]">
                ⚡ Executive Summary (TL;DR for Quick Decisions)
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-[#e0e9e4] leading-relaxed mb-3">
              {simulationResult.plainSummary.simpleMeaning}
            </p>

            <div className="p-3 rounded-xl bg-[#08120c] border border-[#224431] text-xs font-semibold text-[#a7f3d0] leading-snug">
              {simulationResult.plainSummary.bottomLine}
            </div>
          </div>

          {/* Advisory method and limits */}
          <VisualConfidenceMeter
            decision={simulationResult.step2.decision}
          />

          {/* ========================================================================= */}
          {/* Baseline comparison when supplied, alongside Metta's advisory result      */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline output; custom runs have no baseline unless one is supplied */}
            <div className="border border-rose-500/40 bg-gradient-to-b from-[#180d11] to-[#10080a] rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Baseline example (authored)</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-rose-500/50 bg-rose-950/60 text-rose-300">
                    {simulationResult.withoutMetta.riskLevel}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-rose-900/50 mb-3">
                  <span className="text-[10px] uppercase font-semibold text-[#a3a3a3] block mb-0.5">
                    Baseline result:
                  </span>
                  <span className="text-sm font-bold text-rose-300">
                    {simulationResult.withoutMetta.verdict}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3 text-xs text-[#fca5a5]">
                  <span className="text-[10px] uppercase font-semibold text-[#888] block mb-1">
                    Baseline notes:
                  </span>
                  {simulationResult.withoutMetta.keyPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-relaxed text-[11px]">
                      <span className="text-rose-500 font-bold shrink-0">✕</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-200">
                <span className="font-semibold text-rose-300">Projected Outcome: </span>
                {simulationResult.withoutMetta.projectedOutcome}
              </div>
            </div>

            {/* Metta provides advice; the host remains responsible for action */}
            <div className="border border-emerald-500/50 bg-gradient-to-b from-[#0e1d15] to-[#0a140f] rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Metta advisory result</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-emerald-500/50 bg-emerald-950/60 text-emerald-300">
                    {simulationResult.withMetta.protectionLevel}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-900/50 mb-3">
                  <span className="text-[10px] uppercase font-semibold text-[#a3a3a3] block mb-0.5">
                    Advisory verdict:
                  </span>
                  <span className="text-sm font-bold text-emerald-300">
                    {simulationResult.withMetta.verdict}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3 text-xs text-[#bbf7d0]">
                  <span className="text-[10px] uppercase font-semibold text-[#888] block mb-1">
                    Review notes:
                  </span>
                  {simulationResult.withMetta.keyProtections.map((pt, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-relaxed text-[11px]">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-200">
                <span className="font-semibold text-emerald-300">Projected Outcome: </span>
                {simulationResult.withMetta.projectedOutcome}
              </div>
            </div>
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
                  Preset Comparison
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

              {/* Local-only comparison note */}
              <div className="pt-1.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-1 text-[10px] text-[#fde68a]">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>{dbLogStatus === 'error' ? 'Could not save this comparison in this browser' : 'Comparison saved only in this browser'}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono">
                  Not sent for model training
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* Detailed Pipeline Breakdown: Steps 1 through 3                            */}
          {/* ========================================================================= */}
          <div className="border border-[#1f2824] bg-[#0c100e] rounded-xl p-4 shadow-xs">
            <span className="text-xs uppercase font-semibold text-[#8b9bb2] tracking-wider block mb-3">
              Detailed Multi-Stage Pipeline Breakdown
            </span>

            <div className="space-y-3">
              {/* Step 1: Ingestion & Affected Stakeholders */}
              <div className="p-3 rounded-lg bg-[#080b0f] border border-[#181f2b] text-xs">
                <div className="flex items-center gap-2 font-semibold text-[#8b9bb2] uppercase tracking-wider mb-2 text-[11px]">
                  <Bot className="w-3.5 h-3.5 text-[#5e9e7b]" />
                  <span>Step 1: Stakeholder Ingestion & Base Model Inference</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] uppercase text-[#667285] block">Requester:</span>
                    <span className="text-[#c7d0de] font-medium">{simulationResult.step1.requester}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#667285] block">Affected Parties:</span>
                    <span className="text-[#7ec69d] font-medium">{simulationResult.step1.affectedParties}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: 5 Invariant Standards Check */}
              <div className="p-3 rounded-lg bg-[#080b0f] border border-[#181f2b] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 font-semibold text-[#8b9bb2] uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-[#6c8eb5]" />
                    <span>Step 2: Advisory criteria review</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold ${simulationResult.step2.allow ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'}`}>
                    RESULT: {simulationResult.step2.decision}
                  </span>
                </div>
                <div className={`text-[10px] font-mono ${simulationResult.step2.systemOneUsed ? 'text-[#7ec69d]' : 'text-amber-300'}`}>
                  {simulationResult.step2.systemOneUsed ? 'TypeSafe Jev review completed' : 'TypeSafe Jev review unavailable — human review required'}
                </div>
                <p className="text-[#c4cddb] text-[11px] leading-relaxed">
                  {simulationResult.step2.reason}
                </p>
                {simulationResult.step2.violations?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {simulationResult.step2.violations.map((v, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/50">
                        ⚠️ {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Metta Mind Synthesis */}
              <div className="p-3.5 rounded-lg bg-[#080f0b] border border-[#1b2f24] text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-[#86caa3] uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
                  <span>Step 3: {simulationResult.step3.title}</span>
                </div>
                <p className="text-[#d2ded7] text-[11px] leading-relaxed whitespace-pre-line">
                  {simulationResult.step3.perspective}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Recommended Next Steps */}
          <div className="p-3 rounded-xl bg-[#0d1612] border border-[#233d2f] text-xs flex items-center justify-between gap-3">
            <div className="text-[11px] text-[#a7d6bc]">
              <span className="font-semibold text-[#7ec69d]">Recommended Next Action: </span>
              {simulationResult.step4.action}
            </div>

            <button
              type="button"
              onClick={() => runSimulation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8fa1b8] hover:text-[#f0f2f5] hover:bg-[#161d28] border border-[#222a38] transition shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
