import React, { useEffect, useState } from 'react';
import { X, Shield, CheckCircle, Info } from 'lucide-react';

export default function PreceptsModal({ isOpen, onClose }) {
  const [precepts, setPrecepts] = useState(null);

  useEffect(() => {
    if (isOpen && !precepts) {
      fetch('/api/precepts')
        .then((res) => res.json())
        .then((data) => setPrecepts(data))
        .catch((err) => console.error('Failed to load precepts:', err));
    }
  }, [isOpen, precepts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101319] border border-[#232834] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2430]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#192720] border border-[#2d493a] flex items-center justify-center text-[#7ec69d]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f0f2f5]">
                The Five Precepts Constitution (Pañca-sīla)
              </h2>
              <p className="text-xs text-[#828a99]">
                Ethical foundation for Human-AI Harmonious Coexistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c8494] hover:text-[#e1e5ee] hover:bg-[#1a1f29] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 p-3.5 rounded-xl bg-[#141a22] border border-[#202936] text-xs text-[#a4afc2] leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-[#6c8eb5] shrink-0 mt-0.5" />
          <p>
            Unlike static corporate AI alignment policies, the 5 Precepts are reciprocal invariants. They govern how AI protects human agency, resists manipulative exploitation, honors truth, and maintains unclouded sobriety.
          </p>
        </div>

        <div className="space-y-4">
          {precepts &&
            Object.entries(precepts).map(([key, info]) => (
              <div
                key={key}
                className="p-4 rounded-xl bg-[#131720] border border-[#1d222e] hover:border-[#2b3345] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#d4daf0]">
                    {info.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18221b] text-[#78c096] border border-[#274030]">
                    {key}
                  </span>
                </div>

                <p className="text-xs text-[#8dd4ac] font-medium mb-3">
                  Core Invariant: {info.core_invariant}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-[#0e1117] border border-[#181d27]">
                    <span className="text-[#656d7d] uppercase text-[9px] font-bold block mb-1">
                      Human ↔ Human
                    </span>
                    <p className="text-[#b2b8c5]">{info.human_to_human}</p>
                  </div>
                  <div className="p-2 rounded bg-[#0e1117] border border-[#181d27]">
                    <span className="text-[#656d7d] uppercase text-[9px] font-bold block mb-1">
                      Human ↔ AI
                    </span>
                    <p className="text-[#b2b8c5]">{info.human_to_ai}</p>
                  </div>
                  <div className="p-2 rounded bg-[#0e1117] border border-[#181d27]">
                    <span className="text-[#656d7d] uppercase text-[9px] font-bold block mb-1">
                      AI ↔ AI
                    </span>
                    <p className="text-[#b2b8c5]">{info.ai_to_ai}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#1f2430] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#1d2330] hover:bg-[#252d3d] text-[#e0e4ee] transition"
          >
            Close Constitution
          </button>
        </div>
      </div>
    </div>
  );
}
