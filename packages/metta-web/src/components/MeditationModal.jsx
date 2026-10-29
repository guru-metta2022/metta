import React from 'react';
import { X, Sparkles, Trash2, CheckCircle2, Wind } from 'lucide-react';

export default function MeditationModal({ report, isOpen, onClose }) {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101319] border border-[#2d3a4c] rounded-2xl max-w-lg w-full shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2430]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#182736] border border-[#2a4563] flex items-center justify-center text-[#7ea9dc]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f0f2f5]">
                Bhāvanā: Subtractive Unlearning Audit
              </h2>
              <p className="text-xs text-[#828a99]">
                Noise pruned, cognitive clinging dissolved, mind returned to Stillness
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

        <div className="my-5 space-y-4">
          {/* Mind State Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#14231b] to-[#121c22] border border-[#264432] flex items-center gap-3">
            <Wind className="w-5 h-5 text-[#7ec69d] shrink-0 animate-breathe" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#62b485] tracking-wider block">
                Resulting Mind State (Śūnyatā)
              </span>
              <p className="text-sm font-medium text-[#d9efe4]">
                {report.mind_state}
              </p>
            </div>
          </div>

          {/* Pruned Items */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e07d7d] mb-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Pruned & Unlearned Residue ({report.pruned_noise_items?.length || 0})</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {report.pruned_noise_items?.map((item, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-[#141720] border border-[#1f2430] text-xs text-[#a0a8b8] flex items-start gap-2"
                >
                  <span className="text-[#a85858] font-bold text-[10px] mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distilled Invariant */}
          {report.distilled_principle && (
            <div className="p-3.5 rounded-xl bg-[#131922] border border-[#223145]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7fa7d9] mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5a8ec9]" />
                <span>Distilled Timeless Invariant</span>
              </div>
              <p className="text-xs text-[#c6d7ed] leading-relaxed">
                "{report.distilled_principle}"
              </p>
              {report.new_path_added && (
                <span className="text-[10px] text-[#7ec69d] mt-2 block font-medium">
                  ✓ Successfully integrated into Principle Knowledge Graph
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-[#1f2430] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#1d2330] hover:bg-[#252d3d] text-[#e0e4ee] transition"
          >
            Rest in Stillness
          </button>
        </div>
      </div>
    </div>
  );
}
