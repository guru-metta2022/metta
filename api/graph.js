/**
 * Project Metta: Universal Dhamma Knowledge Graph API (/api/graph)
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const nodes = [
    {
      id: "paralysis:overwhelm",
      name: "Cognitive Overwhelm & Task Paralysis",
      type: "condition",
      category: "exhaustion",
      underlying_illusion: "The belief that the entire mountain must be moved all at once.",
      keywords: ["overwhelmed", "mess", "too much", "paralyzed", "stuck", "chaotic", "drowning", "can't cope"]
    },
    {
      id: "anxiety:catastrophizing",
      name: "Anticipatory Anxiety & Dread",
      type: "condition",
      category: "fear",
      underlying_illusion: "Clinging to an imagined future disaster as if it were present reality.",
      keywords: ["anxious", "panic", "scared", "what if", "terrified", "dread", "catastrophe", "worst case"]
    },
    {
      id: "burnout:depleted_energy",
      name: "Exhaustion & Depleted Agency",
      type: "condition",
      category: "exhaustion",
      underlying_illusion: "Belief that self-worth is tied to relentless productivity and non-stop output.",
      keywords: ["burnout", "exhausted", "tired", "empty", "drained", "can't go on", "running on fumes"]
    },
    {
      id: "grief:attachment_loss",
      name: "Grief, Heartbreak & Loss",
      type: "condition",
      category: "grief",
      underlying_illusion: "Resisting the reality that everything cherished is subject to change.",
      keywords: ["heartbroken", "loss", "grief", "miss them", "lonely", "shattered", "sorrow"]
    },
    {
      id: "control:covert_surveillance",
      name: "Panoptic Surveillance & Covert Employee Tracking",
      type: "condition",
      category: "control_distrust",
      underlying_illusion: "The delusion that algorithmic keystroke tracking or invasive surveillance creates true productivity, ignoring sovereign cognitive boundaries.",
      keywords: ["keystroke", "monitoring", "surveillance", "track employee", "worker telemetry", "screen recording", "covert tracking"]
    },
    {
      id: "clarity:single_step",
      name: "Single-Point Focus",
      type: "equanimity",
      description: "Clear mind acting only on the single immediate, tangible next breath or action."
    },
    {
      id: "clarity:grounded_presence",
      name: "Anchored Present Awareness",
      type: "equanimity",
      description: "The realization that in this exact breath, right here, safety is available."
    },
    {
      id: "peace:restoration",
      name: "Sacred Rest & Renewal",
      type: "equanimity",
      description: "Spacious self-compassion that acknowledges natural human rhythms of work and rest."
    },
    {
      id: "peace:spacious_heart",
      name: "Spacious Compassionate Heart",
      type: "equanimity",
      description: "A heart large enough to hold sorrow without breaking or becoming bitter."
    },
    {
      id: "trust:consensual_dignity",
      name: "Consensual Transparency & Mutual Trust (Saddhā)",
      type: "equanimity",
      description: "Livelihood and collaboration rooted in psychological safety, clear voluntary agreements, and cognitive sovereignty."
    }
  ];

  const edges = [
    {
      id: "paralysis:overwhelm->clarity:single_step",
      source: "paralysis:overwhelm",
      target: "clarity:single_step",
      principle: "Simplicity over totality. A mountain is only walked one inch at a time.",
      reframe: "You do not need to solve the whole mess right now. You only need to touch the ground beneath your feet.",
      immediate_action: "Put down every future task. Name just ONE tiny 2-minute physical thing you can do, or simply exhale completely.",
      sutta_reference: "Dhammapada 122: 'Drop by drop is the water pot filled.'",
      suttacentral_url: "https://suttacentral.net/dhp116-128/en/anandajoti#122",
      accesstoinsight_url: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.09.budd.html#dhp-122"
    },
    {
      id: "anxiety:catastrophizing->clarity:grounded_presence",
      source: "anxiety:catastrophizing",
      target: "clarity:grounded_presence",
      principle: "Anicca (Impermanence). The imagined catastrophe is a projection, not this moment.",
      reframe: "Your nervous system is fighting shadows that haven't arrived. Bring awareness back to the weight of your body.",
      immediate_action: "Feel the soles of your feet on the floor. Take three slow, unhurried breaths, letting the exhale be longer than the inhale.",
      sutta_reference: "Satipaṭṭhāna Sutta (MN 10): Mindfulness of the Body.",
      suttacentral_url: "https://suttacentral.net/mn10",
      accesstoinsight_url: "https://www.accesstoinsight.org/tipitaka/mn/mn.010.than.html"
    },
    {
      id: "burnout:depleted_energy->peace:restoration",
      source: "burnout:depleted_energy",
      target: "peace:restoration",
      principle: "Right Effort (Sammā Vāyāma) includes the wisdom to yield and restore.",
      reframe: "Rest is not a reward you earn after finishing everything; it is the prerequisite for life itself.",
      immediate_action: "Give yourself unconditional permission to stop pushing for the next hour. Lie back, close your eyes, and demand nothing from yourself.",
      sutta_reference: "Soṇa Sutta (AN 6.55): The Tuning of the Lute.",
      suttacentral_url: "https://suttacentral.net/an6.55",
      accesstoinsight_url: "https://www.accesstoinsight.org/tipitaka/an/an06/an06.055.than.html"
    },
    {
      id: "grief:attachment_loss->peace:spacious_heart",
      source: "grief:attachment_loss",
      target: "peace:spacious_heart",
      principle: "Mettā (Loving-Kindness) and Anicca. Grief is love with nowhere to go; let it soften you rather than harden you.",
      reframe: "You do not have to 'get over' loss quickly. Pain is real, but suffering is softened when held with gentle tenderness.",
      immediate_action: "Place a warm hand over your chest. Whisper to yourself: 'This hurts. May I be gentle with myself in this moment.'",
      sutta_reference: "Karaṇīya Mettā Sutta (Snp 1.8) & Kisāgotamī Thīg 10.1.",
      suttacentral_url: "https://suttacentral.net/snp1.8",
      accesstoinsight_url: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html"
    },
    {
      id: "control:covert_surveillance->trust:consensual_dignity",
      source: "control:covert_surveillance",
      target: "trust:consensual_dignity",
      principle: "Adinnādānā (Second Precept) & Kāmesumicchācārā (Third Precept). Cognitive sanctuary is inviolable.",
      reframe: "True productivity arises from psychological safety and inspired purpose, never from algorithmic paranoia.",
      immediate_action: "Reject automated keystroke surveillance. Replace panoptic tracking with transparent milestone agreements and open communication.",
      sutta_reference: "Ambalaṭṭhikārāhulovāda Sutta (MN 61): The Mirror of Action (Affliction of Self & Others).",
      suttacentral_url: "https://suttacentral.net/mn61",
      accesstoinsight_url: "https://www.accesstoinsight.org/tipitaka/mn/mn.061.than.html"
    }
  ];

  return res.status(200).json({ nodes, edges });
}
