import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp, Compass, HeartHandshake } from 'lucide-react';

export default function SatiCard({ observation, graphMatch }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!observation) return null;

  return (
    <div className="mt-3 mb-1 border border-[#222834] bg-[#101319]/90 rounded-xl overflow-hidden text-xs transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-[#8e98a8] hover:text-[#c4cbda] hover:bg-[#161a22] transition"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[#5e9e7b]" />
          <span className="font-medium text-[#b3b9c6]">Decision Analysis</span>
          <span className="text-[11px] px-2 py-0.2 rounded-full bg-[#18201c] text-[#7ec69d] border border-[#25392e]">
            {observation.emotional_state}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#727a8a]">
          <span>{isOpen ? 'Close Breakdown' : 'View Breakdown'}</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-3 border-t border-[#1a1f29] bg-[#0c0e13]/60 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#141720] border border-[#1e2330]">
              <span className="text-[10px] uppercase font-semibold text-[#6d7585] tracking-wider block mb-1">
                Underlying Tension / Challenge
              </span>
              <p className="text-[#c0c6d4] leading-relaxed">
                {observation.cognitive_knot}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#141720] border border-[#1e2330]">
              <span className="text-[10px] uppercase font-semibold text-[#6d7585] tracking-wider block mb-1">
                Underlying Core Need
              </span>
              <p className="text-[#7ec69d] font-medium capitalize">
                {observation.core_need}
              </p>
            </div>
          </div>

          {graphMatch && (
            <div className="p-3 rounded-lg bg-[#131b17] border border-[#233b2e]">
              <div className="flex items-center gap-1.5 text-[#86caa3] font-medium mb-1.5">
                <Compass className="w-3.5 h-3.5 text-[#62b485]" />
                <span>Resolution Direction: {graphMatch.path.principle}</span>
              </div>
              <p className="text-[#a6b4a9] text-[11px] mb-2 leading-relaxed">
                <span className="text-[#64796a]">Perspective Shift: </span>
                {graphMatch.path.reframe}
              </p>
              <div className="text-[11px] text-[#8fc7a4] flex items-center gap-1.5 pt-1.5 border-t border-[#1d3326]">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Recommended Step: {graphMatch.path.immediate_action}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
