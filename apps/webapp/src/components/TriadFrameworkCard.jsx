import React, { useState } from 'react';
import { Eye, ShieldCheck, HeartHandshake, Compass, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import CollapsibleBubble from './CollapsibleBubble';

/**
 * TriadFrameworkCard
 *
 * Implements the Reflection -> Decision -> Resolution Framework UI:
 * - Minimal look by default with high-output information density.
 * - Text exceeding 2 lines is embedded inside collapsible progressive disclosure bubbles.
 * - Sati (Reflection) -> Sīla (Decision) -> Karunā (Resolution).
 */
export default function TriadFrameworkCard({ observation, evaluation, graphMatch, defaultExpanded = false }) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'reflection', 'decision', 'resolution'

  if (!observation && !evaluation && !graphMatch) return null;

  const uncertain = evaluation?.evaluation_status === 'uncertain';
  const passed = evaluation?.passed === true && !uncertain;
  const checkLabel = !evaluation
    ? 'Not evaluated'
    : uncertain
      ? 'Pause — needs more context'
      : passed
        ? 'No immediate concern detected'
        : 'A concern needs attention';
  const emotionalState = observation?.emotional_state || 'deliberative';
  const cognitiveKnot = observation?.cognitive_knot || 'Observing underlying trade-offs';
  const coreNeed = observation?.core_need || 'Equanimity & clarity';
  const reframe = graphMatch?.path?.reframe || 'Shift from reactive pressure to clear awareness.';
  const action = graphMatch?.path?.immediate_action || 'Take one conscious, grounded step.';
  const suttaRef = graphMatch?.path?.sutta_ref || 'MN 61';
  const suttaLink = graphMatch?.path?.sutta_link || 'https://suttacentral.net/mn61';

  return (
    <div className="mt-3.5 mb-1.5 rounded-xl border border-[#212735] bg-[#0d1017]/95 overflow-hidden text-xs shadow-xs transition-all">
      {/* Keep the conversation human-first; framework details stay collapsed until requested. */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-[#181d28] bg-[#11151f]/60">
        <div className="flex items-center gap-2 text-[11px] text-[#8b96a9]">
          <span>🌿</span>
          <span>Reflection details</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-[#8b96a9] hover:text-[#f0f2f5] hover:bg-[#181d29] transition ml-auto"
        >
          <span>{isOpen ? 'Hide details' : 'View details'}</span>
          {isOpen ? <ChevronUp className="w-3 h-3 text-[#7ec69d]" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Triad Details with Collapsible Bubbles */}
      {isOpen && (
        <div className="p-3 sm:p-4 space-y-3 bg-[#0a0d14]/80">
          {/* Mini pill switcher */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-[#181d28]">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition ${
                activeTab === 'all'
                  ? 'bg-[#1e2636] text-[#f0f2f5] border border-[#2c374e]'
                  : 'text-[#747e90] hover:text-[#b4bece]'
              }`}
            >
              Unified Triad
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reflection')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition ${
                activeTab === 'reflection'
                  ? 'bg-[#18261e] text-[#7ec69d] border border-[#284a36]'
                  : 'text-[#747e90] hover:text-[#b4bece]'
              }`}
            >
              1. Reflection (Sati)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('decision')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition ${
                activeTab === 'decision'
                  ? 'bg-[#18261e] text-[#7ec69d] border border-[#284a36]'
                  : 'text-[#747e90] hover:text-[#b4bece]'
              }`}
            >
              2. Decision (Sīla)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resolution')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition ${
                activeTab === 'resolution'
                  ? 'bg-[#18261e] text-[#7ec69d] border border-[#284a36]'
                  : 'text-[#747e90] hover:text-[#b4bece]'
              }`}
            >
              3. Resolution (Karunā)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. REFLECTION */}
            {(activeTab === 'all' || activeTab === 'reflection') && (
              <div className="p-3 rounded-xl bg-[#11151f] border border-[#1e2433] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#7ec69d] font-semibold text-[11px] mb-1.5">
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>1. Reflection (Sati)</span>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-[#667082] tracking-wider block mb-1">
                    Observed Knot & Tension
                  </span>
                  <CollapsibleBubble
                    text={cognitiveKnot}
                    thresholdChars={90}
                    maxLines={2}
                    expandLabel="+ Full Knot"
                    collapseLabel="− Less"
                    className="text-[#c2c8d4] text-[11px]"
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1a202c]">
                  <span className="text-[10px] uppercase font-semibold text-[#667082] tracking-wider block mb-0.5">
                    Core Need
                  </span>
                  <span className="text-[#8dd4ac] font-medium capitalize text-[11px]">{coreNeed}</span>
                </div>
              </div>
            )}

            {/* 2. DECISION */}
            {(activeTab === 'all' || activeTab === 'decision') && (
              <div className="p-3 rounded-xl bg-[#11151f] border border-[#1e2433] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#86e2ad] font-semibold text-[11px] mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>2. Decision criteria (Sīla)</span>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-[#667082] tracking-wider block mb-1">
                    Advisory input check
                  </span>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        passed ? 'bg-[#15291e] text-[#86e2ad]' : uncertain ? 'bg-[#292315] text-[#fcd58a]' : 'bg-[#31161a] text-[#fca5a5]'
                      }`}
                    >
                      {checkLabel}
                    </span>
                    <span className="text-[10px] text-[#717b8c]">Guidance for reflection, not permission to act</span>
                  </div>

                  <CollapsibleBubble
                    text={
                      !evaluation
                        ? 'No input evaluation is available for this message.'
                        : uncertain
                          ? evaluation.uncertainty_reason || 'The check was inconclusive. Request human review before acting on a related proposal.'
                          : passed
                            ? 'No concern was detected by this check. This does not establish that a proposed action is safe.'
                            : 'A concern was detected against Metta’s stated criteria. Review the rationale and context.'
                    }
                    thresholdChars={90}
                    maxLines={2}
                    expandLabel="+ Precept Rationale"
                    collapseLabel="− Less"
                    className="text-[#aeb6c4] text-[11px]"
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1a202c] text-[10px] text-[#6d7687]">
                  <span>Grounded in care for all life</span>
                </div>
              </div>
            )}

            {/* 3. RESOLUTION */}
            {(activeTab === 'all' || activeTab === 'resolution') && (
              <div className="p-3 rounded-xl bg-[#111b17] border border-[#20362b] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#7ec69d] font-semibold text-[11px] mb-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                    <span>3. Resolution (Karunā)</span>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-[#64796a] tracking-wider block mb-1">
                    Perspective Reframe
                  </span>
                  <CollapsibleBubble
                    text={reframe}
                    thresholdChars={90}
                    maxLines={2}
                    expandLabel="+ Full Reframe"
                    collapseLabel="− Less"
                    className="text-[#a6b4a9] text-[11px]"
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1d3326] space-y-1.5">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#64796a] tracking-wider block mb-0.5">
                      Wholesome Action Step
                    </span>
                    <p className="text-[#cbe4d4] text-[11px] font-medium leading-snug">{action}</p>
                  </div>

                  {suttaLink && (
                    <a
                      href={suttaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#7ec69d] hover:text-[#b4eed0] transition pt-0.5"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Canonical Anchor: {suttaRef}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
