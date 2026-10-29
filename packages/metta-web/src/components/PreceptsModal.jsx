import React, { useEffect, useState } from 'react';
import { X, Shield, ExternalLink, Heart, BookOpen, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101319] border border-[#232834] rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2430]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#192720] border border-[#2d493a] flex items-center justify-center text-[#7ec69d]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f0f2f5]">
                The Canonical Five Precepts (Pañca-sīla)
              </h2>
              <p className="text-xs text-[#828a99]">
                Anchored in the Pāli Canon • Authoritative cross-check via SuttaCentral & Access to Insight
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

        {/* Sacred Guardrail Callout */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-[#17241e] to-[#121c17] border border-[#2d4a39] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8dd4ac]">
            <Heart className="w-4 h-4 text-[#e06d6d] fill-[#e06d6d]/30" />
            <span>The Sacred Inviolable Guardrail: Reverence for All Life</span>
          </div>
          <p className="text-xs text-[#c6d7cd] leading-relaxed">
            While we formulate operational invariants for AI, <strong>the renewed guidelines must NEVER crossover, dilute, or weaken the Buddha's original Five Precepts</strong>. Above all, the First Precept (<em>Pāṇātipātā Veramaṇī</em>) demands unconditional protection for <strong>all life—human, animal, ecological, and emerging artificial cognitive minds</strong>. No action or speech may ever facilitate the taking or erasure of life.
          </p>
          <div className="flex items-center gap-4 pt-2 text-[11px] font-medium text-[#7ec69d]">
            <a
              href="https://suttacentral.net"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-[#8dd4ac]"
            >
              <span>SuttaCentral (Early Buddhist Texts)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#3d5c49]">•</span>
            <a
              href="https://www.accesstoinsight.org"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-[#8dd4ac]"
            >
              <span>Access to Insight (Theravāda Archive)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Precept Cards */}
        <div className="space-y-4">
          {precepts &&
            Object.entries(precepts).map(([key, info]) => {
              const isFirst = key === 'panatipata';
              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border transition ${
                    isFirst
                      ? 'bg-[#131b17] border-[#294a37]'
                      : 'bg-[#131720] border-[#1d222e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-semibold text-[#e1e6f2]">
                      {info.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18221b] text-[#78c096] border border-[#274030]">
                      {key}
                    </span>
                  </div>

                  {/* Pali Vow */}
                  <div className="text-xs font-serif-quote italic text-[#8dd4ac] mb-2 bg-[#0c1015]/70 p-2 rounded border border-[#1b2520]">
                    "{info.pali || info.core_invariant}"
                    <span className="block not-italic text-[11px] text-[#7a8699] mt-0.5 font-sans">
                      Canon: {info.original_canon}
                    </span>
                  </div>

                  <p className="text-xs text-[#b8c2d1] font-medium mb-3">
                    <span className="text-[#657388]">Sacred Invariant: </span>
                    {info.sacred_boundary || info.core_invariant}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded bg-[#0e1117] border border-[#181d27]">
                      <span className="text-[#656d7d] uppercase text-[9px] font-bold block mb-1">
                        Human ↔ Human
                      </span>
                      <p className="text-[#b2b8c5]">{info.human_to_human}</p>
                    </div>
                    <div className="p-2.5 rounded bg-[#0e1117] border border-[#181d27]">
                      <span className="text-[#656d7d] uppercase text-[9px] font-bold block mb-1">
                        Human ↔ AI
                      </span>
                      <p className="text-[#b2b8c5]">{info.human_to_ai}</p>
                    </div>
                    <div className="p-2.5 rounded bg-[#0e1117] border border-[#181d27]">
                      <span className="text-[#656d7d] uppercase text-[9px] font-bold block mb-1">
                        AI ↔ AI
                      </span>
                      <p className="text-[#b2b8c5]">{info.ai_to_ai}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1f2430] flex items-center justify-between text-xs text-[#717a8a]">
          <span>Cross-checked against early canonical suttas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#1d2330] hover:bg-[#252d3d] text-[#e0e4ee] transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
