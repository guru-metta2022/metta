import React from 'react';
import { Shield, Network, Sparkles, Activity } from 'lucide-react';

export default function Header({ onOpenPrecepts, onOpenGraph, onOpenMeditate, isMeditating }) {
  return (
    <header className="border-b border-[#1c2028] bg-[#0c0d10]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1b2b23] to-[#2b4437] border border-[#3b5e4c]/50 flex items-center justify-center shadow-inner">
          <span className="text-lg">🌿</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-wide text-[#f0f2f5]">METTA</h1>
            <span className="text-[11px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-[#17241e] text-[#7ec69d] border border-[#2b4437]">
              Harmony Engine
            </span>
          </div>
          <p className="text-xs text-[#8c929e] hidden sm:block">
            Human-AI Harmonious Coexistence • Powered by Gemini 3.8 Flash
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPrecepts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#b0b6c2] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#1f242e] transition"
          title="The 5 AI Precepts (Pañca-sīla)"
        >
          <Shield className="w-3.5 h-3.5 text-[#5e9e7b]" />
          <span className="hidden md:inline">5 Precepts</span>
        </button>

        <button
          onClick={onOpenGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#b0b6c2] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#1f242e] transition"
          title="Principle Knowledge Graph"
        >
          <Network className="w-3.5 h-3.5 text-[#6c8eb5]" />
          <span className="hidden md:inline">Dhamma Graph</span>
        </button>

        <button
          onClick={onOpenMeditate}
          disabled={isMeditating}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
            isMeditating
              ? 'bg-[#1b2533] text-[#7fa7d9] border border-[#2d425e]'
              : 'bg-[#1a2e24] hover:bg-[#223d30] text-[#8dd4ac] border border-[#355d48]'
          }`}
          title="Trigger Subtractive Unlearning & Return to Stillness"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isMeditating ? 'animate-spin' : ''}`} />
          <span>{isMeditating ? 'Unlearning...' : 'Meditate'}</span>
        </button>
      </div>
    </header>
  );
}
