import React, { useState, useEffect } from 'react';
import { X, Settings, Cpu, Zap, Check, AlertCircle, Volume2, Key, ShieldCheck, Sparkles } from 'lucide-react';
import { useAppDialog } from './ToastDialogContext';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [settings, setSettings] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash-high');
  const [byomGeminiKey, setByomGeminiKey] = useState(() => localStorage.getItem('metta_byom_gemini_key') || '');
  const [byomTypesafeKey, setByomTypesafeKey] = useState(() => localStorage.getItem('metta_byom_typesafe_key') || '');
  const [byomOpenAIKey, setByomOpenAIKey] = useState(() => localStorage.getItem('metta_byom_openai_key') || '');
  const [byomOpenAIBaseUrl, setByomOpenAIBaseUrl] = useState(() => localStorage.getItem('metta_byom_openai_base_url') || 'https://api.openai.com/v1');
  const [byomOpenAIModel, setByomOpenAIModel] = useState(() => localStorage.getItem('metta_byom_openai_model') || '');
  const [reasoningEffort, setReasoningEffort] = useState(() => localStorage.getItem('metta_byom_reasoning_effort') || 'auto');
  const [showKeys, setShowKeys] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { showToast, showAlert } = useAppDialog();
  const hostedVercel = import.meta.env.PROD;

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          setSettings(data);
          setSelectedProvider(hostedVercel
            ? (localStorage.getItem('metta_byom_provider') || 'gemini')
            : data.active_provider);
          setSelectedModel(hostedVercel
            ? (localStorage.getItem('metta_byom_openai_model') || data.model)
            : data.model);
        })
        .catch((err) => console.error('Failed to load settings:', err));

      setByomGeminiKey(localStorage.getItem('metta_byom_gemini_key') || '');
      setByomTypesafeKey(localStorage.getItem('metta_byom_typesafe_key') || '');
      setByomOpenAIKey(localStorage.getItem('metta_byom_openai_key') || '');
      setByomOpenAIBaseUrl(localStorage.getItem('metta_byom_openai_base_url') || 'https://api.openai.com/v1');
      setByomOpenAIModel(localStorage.getItem('metta_byom_openai_model') || '');
      setReasoningEffort(localStorage.getItem('metta_byom_reasoning_effort') || 'auto');
    }
  }, [isOpen, hostedVercel]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Save BYOM credentials/configuration in this browser; do not persist them on Metta's server.
      if (byomGeminiKey.trim()) {
        localStorage.setItem('metta_byom_gemini_key', byomGeminiKey.trim());
      } else {
        localStorage.removeItem('metta_byom_gemini_key');
      }

      if (byomTypesafeKey.trim()) {
        localStorage.setItem('metta_byom_typesafe_key', byomTypesafeKey.trim());
      } else {
        localStorage.removeItem('metta_byom_typesafe_key');
      }

      localStorage.setItem('metta_byom_provider', selectedProvider);
      if (byomOpenAIKey.trim()) localStorage.setItem('metta_byom_openai_key', byomOpenAIKey.trim());
      else localStorage.removeItem('metta_byom_openai_key');
      localStorage.setItem('metta_byom_openai_base_url', byomOpenAIBaseUrl.trim());
      localStorage.setItem('metta_byom_openai_model', byomOpenAIModel.trim());
      localStorage.setItem('metta_byom_reasoning_effort', reasoningEffort);

      let updated = settings;
      if (!hostedVercel) {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: selectedProvider, model: selectedModel }),
        });
        if (!res.ok) throw new Error('Failed to update settings');
        updated = await res.json();
        setSettings(updated);
      }
      setSaveSuccess(true);
      if (onSettingsUpdated) onSettingsUpdated(updated);
      showToast({
        title: 'Settings Saved',
        message: hostedVercel
          ? 'Your provider, model, and BYO API settings were saved in this browser.'
          : 'AI provider and BYO API settings were saved.',
        type: 'success',
      });
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Settings update error:', err);
      showAlert({
        title: 'Settings Error',
        message: 'Failed to update settings: ' + err.message,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasByomActive = selectedProvider === 'openai_compatible'
    ? Boolean(byomOpenAIKey.trim() && byomOpenAIModel.trim() && byomOpenAIBaseUrl.trim())
    : Boolean(byomGeminiKey.trim() || (!hostedVercel && byomTypesafeKey.trim()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101319] border border-[#232834] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2430]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#182330] border border-[#263c54] flex items-center justify-center text-[#6c8eb5]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f0f2f5]">
                AI Model & Gateway Settings
              </h2>
              <p className="text-xs text-[#828a99]">
                Provider Configuration & Custom API Keys
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
          {/* BYOM Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
            hasByomActive
              ? 'bg-[#15231c] border-[#2e5d42] text-[#8dd4ac]'
              : 'bg-[#181d28] border-[#252f44] text-[#939eb2]'
          }`}>
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-[#7ec69d]" />
              <div>
                <span className="font-semibold block">
                  {hasByomActive ? 'Personal provider key active' : 'Shared Community Tier'}
                </span>
                <span className="text-[11px] opacity-80">
                  {hasByomActive
                    ? 'Shared Metta quota bypassed • Provider limits may still apply'
                    : 'Shared requests are rate-limited. Add a provider key and model to use your own quota.'}
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              hasByomActive
                ? 'bg-[#1a3828] text-[#93dfb4] border-[#2e6245]'
                : 'bg-[#1f2638] text-[#8fa0ba] border-[#2c3850]'
            }`}>
              {hasByomActive ? 'BYOM ACTIVE' : 'RATE-LIMITED'}
            </span>
          </div>

          {/* BYOM Input Fields */}
          <div className="p-4 rounded-xl bg-[#121620] border border-[#1f2533] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8b95a5] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#e0a96d]" />
                Bring Your Own Model (BYOM) Keys
              </label>
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="text-[11px] text-[#788295] hover:text-[#c4ccd9] transition"
              >
                {showKeys ? 'Hide Keys' : 'Show Keys'}
              </button>
            </div>

            {selectedProvider === 'gemini' ? (
              <div>
                <label className="text-[11px] text-[#717b8c] block mb-1" htmlFor="metta-gemini-key">
                  Google Gemini API Key
                </label>
                <input
                  id="metta-gemini-key"
                  type={showKeys ? 'text' : 'password'}
                  value={byomGeminiKey}
                  onChange={(e) => setByomGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1016] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
                />
              </div>
            ) : hostedVercel ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-[#717b8c] block mb-1" htmlFor="metta-openai-base-url">
                    Public API Base URL
                  </label>
                  <input
                    id="metta-openai-base-url"
                    type="url"
                    value={byomOpenAIBaseUrl}
                    onChange={(e) => setByomOpenAIBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1016] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
                  />
                  <span className="text-[10px] text-[#677184] block mt-1">Use a public HTTPS endpoint that supports `/chat/completions`.</span>
                </div>
                <div>
                  <label className="text-[11px] text-[#717b8c] block mb-1" htmlFor="metta-openai-key">
                    Provider API Key
                  </label>
                  <input
                    id="metta-openai-key"
                    type={showKeys ? 'text' : 'password'}
                    value={byomOpenAIKey}
                    onChange={(e) => setByomOpenAIKey(e.target.value)}
                    placeholder="Your provider's API key"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1016] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#717b8c] block mb-1" htmlFor="metta-openai-model">
                    Provider Model ID
                  </label>
                  <input
                    id="metta-openai-model"
                    type="text"
                    value={byomOpenAIModel}
                    onChange={(e) => setByomOpenAIModel(e.target.value)}
                    placeholder="Enter the exact model ID from your provider"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1016] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
                  />
                  <span className="text-[10px] text-[#677184] block mt-1">Recommended: Frontier reasoning models (e.g. Claude 3.7 Sonnet, GPT-4o, DeepSeek-R1, Qwen 2.5 72B, Gemini 2.5) yield significantly richer reflections and text polish than small or free-tier models.</span>
                </div>
                <div>
                  <label className="text-[11px] text-[#717b8c] block mb-1" htmlFor="metta-reasoning-effort">
                    Reasoning Effort
                  </label>
                  <select
                    id="metta-reasoning-effort"
                    value={reasoningEffort}
                    onChange={(e) => setReasoningEffort(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1016] border border-[#212736] text-xs text-[#f0f2f5] focus:outline-none focus:border-[#385343]"
                  >
                    <option value="auto">Provider default (recommended)</option>
                    <option value="none">No reasoning-effort setting</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <span className="text-[10px] text-[#677184] block mt-1">Effort is sent only when selected. Your provider and model must support `reasoning_effort`.</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-[#717b8c] block mb-1" htmlFor="metta-gemini-key">
                  Google Gemini API Key
                </label>
                <input
                  id="metta-gemini-key"
                  type={showKeys ? 'text' : 'password'}
                  value={byomGeminiKey}
                  onChange={(e) => setByomGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1016] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
                />
              </div>
            )}

            <div className="pt-3 border-t border-[#202735] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] text-[#c7d1df] block" htmlFor="metta-typesafe-key">
                  TypeSafe Jev API Key — structured decision review
                </label>
                <span className={`text-[9px] uppercase font-mono ${byomTypesafeKey.trim() ? 'text-[#7ec69d]' : 'text-[#8993a4]'}`}>
                  {byomTypesafeKey.trim() ? 'Personal key saved' : 'No personal key'}
                </span>
              </div>
              <input
                id="metta-typesafe-key"
                type={showKeys ? 'text' : 'password'}
                value={byomTypesafeKey}
                onChange={(e) => setByomTypesafeKey(e.target.value)}
                placeholder="Your TypeSafe API key"
                autoComplete="off"
                className="w-full px-3 py-2 rounded-lg bg-[#0d1016] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
              />
              <span className="text-[10px] text-[#758094] block">
                Jev reviews the text first. The selected Gemini or OpenAI-compatible model then writes the human-facing response using Jev’s verdict. A generative key cannot replace Jev; without a personal or hosted Jev key, decision responses pause at CAUTION. Your key stays in this browser and is sent through Metta’s API only when a review runs.
              </span>
            </div>

            <p className="text-[10px] text-[#616a7a] flex items-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5e9e7b] shrink-0" />
              {hostedVercel
                ? 'Settings and keys stay in this browser. Generative and Jev keys pass through Metta’s API to their respective providers when used; Metta does not save them server-side. Provider data and billing policies apply.'
                : 'Keys are stored in this browser and sent to the configured gateway when used. TypeSafe Jev is a separate structured decision model.'}
            </p>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold text-[#8b95a5] uppercase tracking-wider block mb-2">
              Reasoning & Generative Provider
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
                <div className="text-[11px] text-[#717b8c] mt-1">Google’s Gemini API</div>
                <span className="text-[10px] text-[#7ec69d] mt-2 font-mono">Use your Gemini key</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProvider(hostedVercel ? 'openai_compatible' : 'local_llm');
                  setSelectedModel(hostedVercel ? '' : 'gemma-4-E4B-it');
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedProvider === 'openai_compatible'
                    ? 'bg-[#15231c] border-[#37634a] text-[#8dd4ac]'
                    : 'bg-[#121620] border-[#1f2533] text-[#9ba4b4] hover:border-[#2b3548]'
                }`}
              >
                <div className="font-semibold text-sm">{hostedVercel ? 'OpenAI-Compatible API' : 'Local / Open Source'}</div>
                <div className="text-[11px] text-[#717b8c] mt-1">{hostedVercel ? 'Public hosted provider endpoint' : 'LM Studio / llama.cpp'}</div>
                <span className="text-[10px] text-[#8b95a5] mt-2 font-mono">{hostedVercel ? 'Custom URL • model • key' : 'localhost:1234/v1'}</span>
              </button>
            </div>
          </div>

          {/* Model Quality & Reasoning Guidance */}
          <div className="p-3.5 rounded-xl bg-[#131722] border border-[#222b3d] text-xs text-[#a2adbf] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#ccd6e6]">
              <Sparkles className="w-3.5 h-3.5 text-[#e0a96d] shrink-0" />
              <span>Model Quality & Output Guidance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#8a96aa]">
              Both AI text polishing and conversational reflections directly reflect the intelligence and reasoning depth of the model configured here. Lightweight or free-tier models (such as small 3B/8B parameter models) often return terse, generic, or low-depth responses. For deep emotional attunement, thoughtful practical guidance, and precise text editing, we recommend configuring a <strong>frontier-level reasoning model</strong> (e.g. Gemini 2.5 Flash, Claude 3.7 Sonnet, GPT-4o, DeepSeek-R1, or high-tier models via OpenRouter/Groq).
            </p>
          </div>

          {/* Model Target Field */}
          {!hostedVercel && <div>
            <label className="text-xs font-semibold text-[#8b95a5] uppercase tracking-wider block mb-1.5">
              Target Model Identifier
            </label>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141822] border border-[#212736] text-xs text-[#f0f2f5] font-mono focus:outline-none focus:border-[#385343]"
            />
          </div>}

          {/* System 1 Decision Model Status */}
          {!hostedVercel && <div className="p-3.5 rounded-xl bg-[#131b17] border border-[#223d2e] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#7ec69d]" />
              <div>
                <span className="font-semibold text-[#e1ece5] block">
                  Structured Decision Model (TypeSafe Jev)
                </span>
                <span className="text-[11px] text-[#88a895]">
                  Structured decision review when Jev is configured on a self-hosted gateway
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1d3528] text-[#8dd4ac] border border-[#2e543e]">
              {settings?.system_one_active ? 'ACTIVE' : 'DORMANT'}
            </span>
          </div>}

          {/* Voice Diagnostics Status */}
          <div className="p-3 rounded-xl bg-[#121620] border border-[#1f2636] flex items-center justify-between text-xs text-[#9aa4b5]">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-[#6c8eb5]" />
              <span>Voice Input Diagnostics</span>
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
