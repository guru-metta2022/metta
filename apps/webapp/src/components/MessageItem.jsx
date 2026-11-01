import React from 'react';
import TriadFrameworkCard from './TriadFrameworkCard';

/**
 * Parses basic markdown bold (**text**) and markdown links ([label](url))
 * so that canonical sutta anchors are clickable and prominent.
 */
function renderFormattedParagraphs(text) {
  if (!text) return null;

  const paragraphs = text.split(/\n\s*\n/);

  return paragraphs.map((para, pIdx) => {
    const parts = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;

    while ((match = linkRegex.exec(para)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderBold(para.substring(lastIndex, match.index), `${pIdx}-${keyIdx++}`));
      }
      parts.push(
        <a
          key={`${pIdx}-link-${keyIdx++}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#7ec69d] hover:text-[#a5e0be] underline underline-offset-2 transition font-medium inline-flex items-center gap-0.5"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < para.length) {
      parts.push(renderBold(para.substring(lastIndex), `${pIdx}-${keyIdx++}`));
    }

    return (
      <p key={pIdx} className="leading-relaxed">
        {parts.length > 0 ? parts : renderBold(para, pIdx)}
      </p>
    );
  });
}

function renderBold(str, baseKey) {
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((sub, i) => {
    if (sub.startsWith('**') && sub.endsWith('**')) {
      return (
        <strong key={`${baseKey}-b-${i}`} className="font-semibold text-[#f0f3f8]">
          {sub.slice(2, -2)}
        </strong>
      );
    }
    return sub;
  });
}

export default function MessageItem({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-2">
        <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tr-sm bg-[#161a22] border border-[#232936] px-4.5 py-3 text-[#e5e9f0] shadow-xs leading-relaxed">
          <p className="whitespace-pre-wrap text-xs sm:text-sm text-[#e2e7ef] leading-relaxed">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-5 px-2">
      <div className="max-w-[96%] sm:max-w-[88%] w-full">
        {/* Metta Header Badge with Duration & Provider */}
        <div className="flex items-center gap-2 mb-2 text-xs text-[#808998] flex-wrap">
          <div className="w-5 h-5 rounded-full bg-[#1b2b23] border border-[#3b5e4c]/60 flex items-center justify-center text-[11px]">
            🌿
          </div>
          <span className="font-semibold text-[#c8ceda] tracking-wide">Metta</span>
          {message.duration && (
            <span className="text-[10px] text-[#4f5765] ml-auto font-mono">
              {message.duration.toFixed(2)}s
            </span>
          )}
        </div>

        {/* Message Container */}
        <div
          className="rounded-2xl rounded-tl-sm p-4 sm:p-5.5 leading-relaxed transition-all bg-[#12151c]/95 border border-[#1e232e] shadow-xs"
        >
          {/* Primary Compassionate Chat Response - Full, Unclipped, Living Voice */}
          <div className="text-[14px] sm:text-[15px] text-[#dce1ea] leading-relaxed space-y-3.5 font-sans">
            {renderFormattedParagraphs(message.text)}
          </div>

          {/* Structured Reflection -> Decision -> Resolution Framework Card (Complementary Badge) */}
          {(message.observation || message.evaluation || message.graph_match) && (
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
