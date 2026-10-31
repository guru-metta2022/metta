import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * CollapsibleBubble
 *
 * Implements the "minimal look, maximum output" progressive disclosure pattern.
 * If text exceeds 2 lines (~160 chars or multiple linebreaks), clamps to 2 lines
 * and renders a micro-collapsible pill bubble to expand/collapse.
 */
export default function CollapsibleBubble({
  text,
  children,
  thresholdChars = 160,
  maxLines = 2,
  expandLabel = 'Show details',
  collapseLabel = 'Collapse',
  className = '',
  bubbleClassName = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = text || (typeof children === 'string' ? children : '');

  // Determine if content is multi-line or long
  const hasMultipleLines = content.includes('\n');
  const isLong = content.length > thresholdChars || hasMultipleLines;

  if (!isLong) {
    return (
      <div className={className}>
        {children || <p className="leading-relaxed">{content}</p>}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`transition-all duration-200 overflow-hidden ${
          !isExpanded ? (maxLines === 2 ? 'line-clamp-2 max-h-12' : 'line-clamp-3 max-h-20') : ''
        }`}
      >
        {children || <p className="leading-relaxed whitespace-pre-wrap">{content}</p>}
      </div>

      {/* Subtle fade-out gradient when clamped */}
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-[#12151c] to-transparent pointer-events-none opacity-80" />
      )}

      {/* Micro-collapsible bubble toggle button */}
      <div className="mt-1 flex items-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide transition shadow-xs ${
            isExpanded
              ? 'bg-[#18231e] text-[#86e2ad] border border-[#274837] hover:bg-[#1e3028]'
              : 'bg-[#141822] text-[#8fa0ba] border border-[#242d3d] hover:text-[#d0d8e6] hover:bg-[#1b2230]'
          } ${bubbleClassName}`}
          title={isExpanded ? collapseLabel : expandLabel}
        >
          <span>{isExpanded ? collapseLabel : expandLabel}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-[#7ec69d]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#8fa0ba]" />
          )}
        </button>
      </div>
    </div>
  );
}
