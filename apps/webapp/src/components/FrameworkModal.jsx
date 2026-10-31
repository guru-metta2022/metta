import React, { useState } from 'react';
import { X, Eye, ShieldCheck, HeartHandshake, Terminal, Copy, Check, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import CollapsibleBubble from './CollapsibleBubble';

export default function FrameworkModal({ isOpen, onClose }) {
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const sampleCurl = `curl -X POST https://metta-webapp.vercel.app/api/headless \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"query": "Should we deploy automated monitoring that tracks employee keystrokes?"}'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#0f1218] border border-[#232b3b] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1c2330] flex items-center justify-between bg-[#121620]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#18261e] border border-[#2b4d3a] flex items-center justify-center text-xs text-[#7ec69d]">
              🧭
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#f0f2f5] tracking-wide">
                Reflection, Decision & Resolution Framework
              </h3>
              <p className="text-[11px] text-[#788496]">
                Minimal Look • Maximum Output • Human & Agent Readable
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c889b] hover:text-[#f0f2f5] hover:bg-[#1b2230] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#c4ccd8]">
          {/* Why We Need This (Reframe & Purpose) */}
          <div className="p-3.5 rounded-xl bg-[#131722] border border-[#1f2838] leading-relaxed">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7ec69d] block mb-1">
              Design Philosophy & Purpose
            </span>
            <p className="text-[#aeb7c4] text-[12px] leading-relaxed mb-2">
              Complex decisions and ethical dilemmas easily cause cognitive overload when answered with walls of text.
              Metta avoids feeling like a dry manual by adhering to a <strong>minimal look with maximum output</strong>:
              presenting the core takeaway immediately and embedding detailed rationales inside <strong>2-line collapsible disclosure bubbles</strong>.
            </p>
          </div>

          {/* The Triadic Architecture */}
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8b97ab] block mb-2.5">
              The Three Pillars
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. Reflection */}
              <div className="p-3 rounded-xl bg-[#121620] border border-[#202736]">
                <div className="flex items-center gap-1.5 text-[#7ec69d] font-semibold text-xs mb-1.5">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>1. Reflection (Sati)</span>
                </div>
                <p className="text-[#96a2b5] text-[11px] leading-relaxed mb-2">
                  Mindfully identifies the underlying <strong>emotional knot</strong> and <strong>core unaddressed need</strong> behind the dilemma.
                </p>
                <div className="p-2 rounded bg-[#0b0e14] border border-[#1a202c] text-[10px] text-[#7ec69d]">
                  Detects: Overwhelm, Anxiety, Burnout, Grief, Moral quandary
                </div>
              </div>

              {/* 2. Decision */}
              <div className="p-3 rounded-xl bg-[#121620] border border-[#202736]">
                <div className="flex items-center gap-1.5 text-[#86e2ad] font-semibold text-xs mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>2. Decision (Sīla)</span>
                </div>
                <p className="text-[#96a2b5] text-[11px] leading-relaxed mb-2">
                  Sub-second moral audit against <strong>Ahimsa (Reverence for all life)</strong> and the 5 Precepts via TypeSafe Jev.
                </p>
                <div className="p-2 rounded bg-[#0b0e14] border border-[#1a202c] text-[10px] text-[#86e2ad]">
                  Returns: Calibrated YES / NO ethical verdict
                </div>
              </div>

              {/* 3. Resolution */}
              <div className="p-3 rounded-xl bg-[#121b16] border border-[#1f3729]">
                <div className="flex items-center gap-1.5 text-[#7ec69d] font-semibold text-xs mb-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                  <span>3. Resolution (Karunā)</span>
                </div>
                <p className="text-[#96a2b5] text-[11px] leading-relaxed mb-2">
                  Formulates a <strong>perspective reframe</strong> and a concrete, compassionate next step anchored in classical scripture.
                </p>
                <div className="p-2 rounded bg-[#0b120e] border border-[#192b21] text-[10px] text-[#a5e0be]">
                  Anchors: SuttaCentral (MN 61, SN 56.11)
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Collapsible Bubble Demo */}
          <div className="p-3.5 rounded-xl bg-[#11151e] border border-[#1d2534]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7ec69d] block mb-1">
              Live Progressive Disclosure Demo
            </span>
            <p className="text-[#7c889c] text-[11px] mb-2">
              Any description exceeding two lines is neatly tucked inside an expandable bubble to keep the UI clean:
            </p>
            <div className="p-3 rounded-lg bg-[#0b0e14] border border-[#1b2230]">
              <CollapsibleBubble
                text="When faced with rapid automation or restructuring, traditional management often reacts with anxiety or rushed cuts. Metta reframes the situation: true efficiency never requires the violation of human dignity. By safeguarding the livelihoods of your partners, you build unbreakable long-term trust and sustainable intelligence."
                thresholdChars={130}
                maxLines={2}
                expandLabel="+ Expand full reframe"
                collapseLabel="− Collapse"
                className="text-[12px] text-[#cbd3df]"
              />
            </div>
          </div>

          {/* Headless Module for Autonomous Agents */}
          <div className="p-3.5 rounded-xl bg-[#0f1714] border border-[#213b2e]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[#7ec69d] font-semibold text-xs">
                <Terminal className="w-3.5 h-3.5" />
                <span>Headless Agent Endpoint (`/api/headless`)</span>
              </div>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#7ec69d] hover:underline flex items-center gap-1"
              >
                <span>View llms.txt</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-[#a5b6ab] text-[11px] leading-relaxed mb-2.5">
              Instead of having external AI agents scrape heavy HTML, models and bots can query the headless endpoint directly for clean, token-efficient JSON or Markdown:
            </p>

            <div className="relative">
              <pre className="p-2.5 rounded-lg bg-[#090e0c] border border-[#1b2f25] font-mono text-[10px] text-[#86e2ad] overflow-x-auto leading-relaxed">
                {sampleCurl}
              </pre>
              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1 rounded bg-[#132219] hover:bg-[#1b3426] text-[#7ec69d] border border-[#2b4c39] transition"
                title="Copy curl snippet"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-[#7ec69d]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#1c2330] bg-[#121620] flex items-center justify-between">
          <span className="text-[11px] text-[#636f82]">
            Project Metta • Open-Source Decision Safety
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#1a2230] hover:bg-[#222c3e] text-[#f0f2f5] border border-[#2a374c] transition"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
}
