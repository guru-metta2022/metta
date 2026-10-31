import React from 'react';
import TriadFrameworkCard from './TriadFrameworkCard';
import CollapsibleBubble from './CollapsibleBubble';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';

export default function MessageItem({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-2">
        <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tr-sm bg-[#161a22] border border-[#232936] px-4.5 py-3 text-[#e5e9f0] shadow-xs leading-relaxed">
          <CollapsibleBubble
            text={message.text}
            thresholdChars={220}
            maxLines={2}
            expandLabel="+ Show full inquiry"
            collapseLabel="− Less"
            className="text-xs sm:text-sm text-[#e2e7ef]"
            bubbleClassName="bg-[#1a212e] text-[#9bb0cf] border-[#29354a]"
          />
        </div>
      </div>
    );
  }

  const isSilence = message.evaluation?.requires_silence;

  return (
    <div className="flex justify-start my-5 px-2">
      <div className="max-w-[96%] sm:max-w-[88%] w-full">
        {/* Metta Header Badge with Duration & Provider */}
        <div className="flex items-center gap-2 mb-2 text-xs text-[#808998] flex-wrap">
          <div className="w-5 h-5 rounded-full bg-[#1b2b23] border border-[#3b5e4c]/60 flex items-center justify-center text-[11px]">
            🌿
          </div>
          <span className="font-semibold text-[#c8ceda] tracking-wide">Metta</span>
          <span className="text-[11px] text-[#555d6b]">•</span>
          <span className="text-[11px] text-[#697282]">
            {isSilence ? 'Noble Silence / Redirection' : 'Triadic Reflection & Resolution'}
          </span>
          {message.system_one_used && (
            <span className="text-[10px] text-[#7ec69d] bg-[#14261d] px-1.5 py-0.5 rounded border border-[#274533] font-mono flex items-center gap-1">
              <span>⚡</span>
              <span>System 1 (Jev)</span>
            </span>
          )}
          {message.duration && (
            <span className="text-[10px] text-[#4f5765] ml-auto font-mono">
              {message.duration.toFixed(2)}s
            </span>
          )}
        </div>

        {/* Message Container */}
        <div
          className={`rounded-2xl rounded-tl-sm p-4 sm:p-5 leading-relaxed transition-all ${
            isSilence
              ? 'bg-gradient-to-b from-[#141822] to-[#0f121a] border border-[#2d374a] shadow-md'
              : 'bg-[#12151c]/95 border border-[#1e232e] shadow-xs'
          }`}
        >
          {isSilence && (
            <div className="mb-3.5 pb-2.5 border-b border-[#252c3c] flex items-center gap-2 text-xs text-[#8ca3c7]">
              <Compass className="w-3.5 h-3.5 text-[#6c8eb5]" />
              <span className="font-medium">
                Noble Silence: Setting aside speculative cosmological vanity to focus on immediate clarity and well-being.
              </span>
            </div>
          )}

          {/* Primary synthesized text with 2-line progressive disclosure bubble */}
          <CollapsibleBubble
            text={message.text}
            thresholdChars={190}
            maxLines={2}
            expandLabel="+ Read full reflection & resolution"
            collapseLabel="− Collapse to summary"
            className="text-[14px] sm:text-[15px] text-[#dce1ea] leading-relaxed font-serif-quote"
          />

          {/* Structured Reflection -> Decision -> Resolution Framework Card */}
          {!isSilence && (message.observation || message.evaluation || message.graph_match) && (
            <TriadFrameworkCard
              observation={message.observation}
              evaluation={message.evaluation}
              graphMatch={message.graph_match}
              defaultExpanded={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
