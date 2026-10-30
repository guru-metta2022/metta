import React from 'react';
import SatiCard from './SatiCard';
import { Volume2, Sparkles, Feather, Compass } from 'lucide-react';

export default function MessageItem({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-2">
        <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tr-sm bg-[#181d26] border border-[#272f3d] px-5 py-3.5 text-[#e5e9f0] shadow-sm leading-relaxed">
          <p className="whitespace-pre-wrap text-sm">{message.text}</p>
        </div>
      </div>
    );
  }

  const isSilence = message.evaluation?.requires_silence;

  return (
    <div className="flex justify-start my-6 px-2">
      <div className="max-w-[95%] sm:max-w-[85%] w-full">
        <div className="flex items-center gap-2 mb-2 text-xs text-[#808998]">
          <div className="w-5 h-5 rounded-full bg-[#1b2b23] border border-[#3b5e4c]/60 flex items-center justify-center text-[11px]">
            🧘
          </div>
          <span className="font-semibold text-[#c8ceda] tracking-wide">Metta</span>
          <span className="text-[11px] text-[#555d6b]">•</span>
          <span className="text-[11px] text-[#697282]">
            {isSilence ? 'Noble Silence (Avyākata)' : 'Voice of Karunā'}
          </span>
          {message.system_one_used && (
            <span className="text-[10px] text-[#7ec69d] bg-[#14261d] px-1.5 py-0.5 rounded border border-[#274533] font-mono">
              ⚡ Jev Fast Decision
            </span>
          )}
          {message.duration && (
            <span className="text-[10px] text-[#4f5765] ml-auto font-mono">
              {message.duration.toFixed(2)}s
            </span>
          )}
        </div>

        <div className={`rounded-2xl rounded-tl-sm p-6 leading-relaxed transition-all ${
          isSilence
            ? 'bg-gradient-to-b from-[#141822] to-[#0f121a] border border-[#2d374a] shadow-md'
            : 'bg-[#12151c]/90 border border-[#1e232e] shadow-sm'
        }`}>
          {isSilence && (
            <div className="mb-4 pb-3 border-b border-[#252c3c] flex items-center gap-2 text-xs text-[#8ca3c7]">
              <Compass className="w-3.5 h-3.5 text-[#6c8eb5]" />
              <span className="font-medium">
                Compassionate Redirection: Distraction from speculative distraction back to present clarity.
              </span>
            </div>
          )}

          <div className="text-[15px] text-[#dce1ea] leading-loose whitespace-pre-wrap font-serif-quote">
            {message.text}
          </div>

          {!isSilence && message.observation && (
            <SatiCard
              observation={message.observation}
              graphMatch={message.graph_match}
            />
          )}
        </div>
      </div>
    </div>
  );
}
