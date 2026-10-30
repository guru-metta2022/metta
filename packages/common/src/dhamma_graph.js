/**
 * Universal Dhamma Graph Constants & Topology
 * Anchored in classical Theravada Abhidhamma & Sutta Piṭaka.
 */

export const DHAMMA_NODES = {
  distress: [
    {
      id: "dosa",
      name: "Dosa (Aversion / Anger)",
      description: "Contraction of mind, resentment, agitation, and destructive impulse.",
      remedyDestination: "metta",
      canonicalSutta: "MN 21 (Kakacūpama Sutta - The Simile of the Saw)",
      url: "https://suttacentral.net/mn21",
    },
    {
      id: "lobha",
      name: "Lobha (Craving / Attachment)",
      description: "Grasping, insatiability, addiction, and fear of loss.",
      remedyDestination: "upekkha",
      canonicalSutta: "SN 56.11 (Dhammacakkappavattana Sutta)",
      url: "https://suttacentral.net/sn56.11",
    },
    {
      id: "moha",
      name: "Moha (Delusion / Confusion)",
      description: "Lack of situational clarity, projection of permanency upon fluid phenomena.",
      remedyDestination: "mudita",
      canonicalSutta: "MN 9 (Sammādiṭṭhi Sutta - Right View)",
      url: "https://suttacentral.net/mn9",
    },
    {
      id: "vicikiccha",
      name: "Vicikicchā (Doubt / Paralysis)",
      description: "Hesitation, paralysis through over-analysis, loss of confidence in the wholesome.",
      remedyDestination: "karuna",
      canonicalSutta: "SN 46.51 (Āhāra Sutta - Fuel for the Factors of Awakening)",
      url: "https://suttacentral.net/sn46.51",
    },
  ],
  equanimity: [
    {
      id: "metta",
      name: "Mettā (Loving-Kindness)",
      description: "Unconditional goodwill and non-possessive warmth toward all living beings.",
      paliVerse: "Mātā yathā niyaṃ puttaṃ āyusā ekaputtamanurakkhe...",
      suttaAnchor: "Khp 9 (Karaṇīyamettā Sutta)",
      url: "https://suttacentral.net/kp9",
    },
    {
      id: "karuna",
      name: "Karuṇā (Compassion)",
      description: "The quivering of the pure heart witnessing suffering, accompanied by the wish to relieve it.",
      paliVerse: "Dukkhe sati sādhūnaṃ hadayakampanaṃ karotīti karuṇā.",
      suttaAnchor: "AN 4.125",
      url: "https://suttacentral.net/an4.125",
    },
    {
      id: "mudita",
      name: "Muditā (Sympathetic Joy)",
      description: "Rejoicing genuinely in the good fortune, virtue, and liberation of others without jealousy.",
      paliVerse: "Modantīti muditā, sayaṃ vā modati.",
      suttaAnchor: "DN 33 (Saṅgīti Sutta)",
      url: "https://suttacentral.net/dn33",
    },
    {
      id: "upekkha",
      name: "Upekkhā (Equanimity)",
      description: "Unshakeable stillness, seeing phenomena as they are—free from clinging and aversion.",
      paliVerse: "Upekkhati ti upekkhā, majjhattā hutvā passatīti attho.",
      suttaAnchor: "MN 152 (Indriyabhāvanā Sutta)",
      url: "https://suttacentral.net/mn152",
    },
  ],
};
