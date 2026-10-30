export interface Precept {
  id: number;
  pali: string;
  english: string;
  description: string;
  suttaAnchor: string;
  suttaCentralUrl: string;
  accessToInsightUrl: string;
  category: string;
}

export interface DhammaNode {
  id: string;
  name: string;
  description: string;
  remedyDestination?: string;
  canonicalSutta?: string;
  paliVerse?: string;
  suttaAnchor?: string;
  url: string;
}

export interface InteractionResponse {
  content: string;
  sati_score: number;
  karuna_alignment: number;
  pali_grounding?: string[];
  noble_silence_invoked: boolean;
  precept_audit?: {
    approved: boolean;
    violated_precepts: number[];
    reasoning: string;
    model: string;
  };
  emotional_knot?: {
    distress_category: string;
    remedy_destination: string;
    confidence: number;
  };
  provider: string;
  model: string;
}

export interface GuardrailDecision {
  allowed: boolean;
  action: string;
  precept_violated?: number | null;
  advisory: string;
  confidence: number;
}
