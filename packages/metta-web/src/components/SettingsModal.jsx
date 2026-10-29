import React, { useState, useEffect } from 'react';
import { X, Settings, Cpu, Zap, Check, AlertCircle, Volume2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [settings, setSettings] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash-high');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          setSettings(data);
          setSelectedProvider(data.active_provider);
          setSelectedModel(data.model);
        })
        .catch((err) => console.error('Failed to load settings:', err));
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      const updated = await res.json();
      setSettings(updated);
      setSaveSuccess(true);
      if (onSettingsUpdated) onSettingsUpdated(updated);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Settings update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101319] border border-[#232834] rounded-2xl max-w-lg w-full shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2430]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#182330] border border-[#263c54] flex items-center justify-center text-[#6c8eb5]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f0f2f5]">
                AI Gateway & Model Engine
              </h2>
              <p className="text-xs text-[#828a99]">
                Unified Adapter Interface • Dynamic Provider Swapping
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
          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold text-[#8b95a5] uppercase tracking-wider block mb-2">
              System 2 Generative Provider
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedProvider('gemini');
                  setSelectedModel('gemini-3.8-flash-high');
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedProvider === 'gemini'
                    ? 'bg-[#15231c] border-[#37634a] text-[#8dd4ac]'
                    : 'bg-[#121620] border-[#1f2533] text-[#9ba4b4] hover:border-[#2b3548]'
                }`}
              >
                <div className="font-semibold text-sm">Google Gemini</div>
                <div className="text-[11px] text-[#717b8c] mt-1">Antigravity API Cloud</div>
                <span className="text-[10px] text-[#7ec69d] mt-2 font-mono">Default • High Reasoning</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProvider('local_llm');
                  setSelectedModel('gemma-4-E4B-it');
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedProvider === 'local_llm'
                    ? 'bg-[#15231c] border-[#37634a] text-[#8dd4ac]'
                    : 'bg-[#121620] border-[#1f2533] text-[#9ba4b4] hover:border-[#2b3548]'
                }`}
              >
                <div className="font-semibold text-sm">Local / Open Source</div>
                <div className="text-[11px] text-[#717b8c] mt-1">LM Studio / llama.cpp</div>
                <span className="text-[10px] text-[#8b95a5] mt-2 font-mono">localhost:1234/v1</span>
              </button>
            </div>
          </div>

          {/* Model Target Field */}
          <div>
            <label className="text-xs font-semibold text-[#8b95a5] uppercase tracking-wider block mb-1.5">
              Target Model Target Identifier
            </label>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141822] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
            />
          </div>

          {/* System 1 Decision Model Status */}
          <div className="p-3.5 rounded-xl bg-[#131b17] border border-[#223d2e] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#7ec69d]" />
              <div>
                <span className="font-semibold text-[#e1ece5] block">
                  System 1: TypeSafe Jev Engine
                </span>
                <span className="text-[11px] text-[#88a895]">
                  Sub-second non-generative decisions & Sīla guardrails
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1d3528] text-[#8dd4ac] border border-[#2e543e]">
              {settings?.system_one_active ? 'ACTIVE' : 'DORMANT'}
            </span>
          </div>

          {/* Voice Diagnostics Status */}
          <div className="p-3 rounded-xl bg-[#121620] border border-[#1f2636] flex items-center justify-between text-xs text-[#9aa4b5]">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-[#6c8eb5]" />
              <span>Multi-Platform Voice Dictation Diagnostics</span>
            </div>
            <span className="text-[10px] font-mono text-[#7ec69d]">ENABLED</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1f2430] flex items-center justify-between">
          <span className="text-xs text-[#717a8a]">
            {saveSuccess && <span className="text-[#7ec69d] flex items-center gap-1 font-medium">✓ Settings updated live</span>}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#88909f] hover:text-[#e0e4ee] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1e382b] hover:bg-[#274837] text-[#93dfb4] border border-[#355f47] transition shadow-sm"
            >
              {isSaving ? 'Applying...' : 'Apply Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
