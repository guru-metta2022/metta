import React, { useEffect, useState } from 'react';
import { X, Shield, ExternalLink, Heart, BookOpen, AlertCircle, ShieldCheck, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function PreceptsModal({ isOpen, onClose }) {
  const [precepts, setPrecepts] = useState(null);
  const [auditReport, setAuditReport] = useState(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    if (isOpen && !precepts) {
      fetch('/api/precepts')
        .then((res) => res.json())
        .then((data) => setPrecepts(data))
        .catch((err) => console.error('Failed to load precepts:', err));
    }
  }, [isOpen, precepts]);

  const runIntegrityAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/canonical/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Pāṇātipātā veramaṇī sikkhāpadaṃ samādiyāmi',
          precept: 'panatipata',
          source_url: 'https://suttacentral.net/sn56.11',
        }),
      });
      const data = await res.json();
      setAuditReport(data);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setAuditing(false);
    }
  };

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
            <span className="text-[#3d5c49]">•</span>
            <a
              href="https://en.wikipedia.org/wiki/Five_precepts"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-[#8dd4ac]"
            >
              <span>Wikipedia Consensus</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Epistemic Tamper-Resistance & Canonical Shield */}
        <div className="mb-5 p-4 rounded-xl bg-[#0f141c] border border-[#252f42] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#60a5fa]" />
              <span className="text-xs font-semibold text-[#93c5fd]">
                Multi-Source Consensus & Tamper-Proof Bedrock Shield
              </span>
            </div>
            <button
              onClick={runIntegrityAudit}
              disabled={auditing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium bg-[#1e293b] hover:bg-[#334155] text-[#93c5fd] border border-[#3b82f6]/30 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${auditing ? 'animate-spin' : ''}`} />
              <span>{auditing ? 'Auditing Canon...' : 'Audit Live Consensus'}</span>
            </button>
          </div>

          <p className="text-[11px] text-[#94a3b8] leading-relaxed">
            Guards against website defacement, DNS spoofing, or poisoned scripture interpretations.
            All canonical statements are triangulated across <strong>SuttaCentral</strong>, <strong>Access to Insight</strong>, and <strong>Wikipedia</strong>, and cryptographically verified against <strong>Tier 1 SHA-256 Immutable Pali Roots</strong>. If any source deviates or weakens Ahimsa, the engine fails closed into local immutable bedrock.
          </p>

          {auditReport && (
            <div className="mt-3 p-3 rounded-lg bg-[#0a0f16] border border-[#1e293b] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Consensus Status:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                    auditReport.status === 'verified'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {auditReport.status.toUpperCase()} ({Math.round(auditReport.consensus_score * 100)}% Consensus)
                </span>
              </div>
              <div className="text-[11px] text-[#cbd5e1] font-mono bg-black/40 p-2 rounded border border-[#1e293b]">
                {auditReport.reason}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                <div className="p-2 rounded bg-[#0f172a] border border-[#1e293b] text-[#94a3b8]">
                  <span className="text-[#38bdf8] block font-semibold mb-0.5">SHA-256 Bedrock</span>
                  {auditReport.immutable_anchor_matched ? '✓ Pristine Match' : 'Reverted to Anchor'}
                </div>
                <div className="p-2 rounded bg-[#0f172a] border border-[#1e293b] text-[#94a3b8]">
                  <span className="text-[#a78bfa] block font-semibold mb-0.5">First Precept (Ahimsa)</span>
                  {auditReport.contradicts_ahimsa ? '✗ Contradiction Detected' : '✓ Inviolate Sanctity of Life'}
                </div>
              </div>
            </div>
          )}
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
