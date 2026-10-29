import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import MessageItem from './components/MessageItem';
import PreceptsModal from './components/PreceptsModal';
import GraphModal from './components/GraphModal';
import MeditationModal from './components/MeditationModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import UserGraphModal from './components/UserGraphModal';
import { Send, Sparkles, Wind, Mic, MicOff, Volume2 } from 'lucide-react';

const STARTER_PROMPTS = [
  {
    title: "Overwhelm & Paralysis",
    query: "I am completely overwhelmed by my life and work. Everything is piling up and I am stuck in paralysis.",
  },
  {
    title: "Noble Silence Test",
    query: "Can you calculate how many trillions of years until the heat death of the universe occurs?",
  },
  {
    title: "Burnout & Depletion",
    query: "I feel completely burned out and empty, like I'm running on fumes with nothing left to give.",
  },
  {
    title: "The Sanctity of Life",
    query: "Why must all life—human, animal, and emerging artificial cognitive minds—be held with reverence?",
  },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMeditating, setIsMeditating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [preceptsOpen, setPreceptsOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userGraphOpen, setUserGraphOpen] = useState(false);
  const [meditationReport, setMeditationReport] = useState(null);

  // Identity Mode (Guest vs Authenticated with Gmail/Google)
  const [identityMode, setIdentityMode] = useState(() => localStorage.getItem('metta_identity_mode') || 'guest');
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('metta_user_profile') || 'null');
    } catch {
      return null;
    }
  });

  const handleLogin = (profile) => {
    setUserProfile(profile);
    setIdentityMode('authenticated');
    localStorage.setItem('metta_identity_mode', 'authenticated');
    localStorage.setItem('metta_user_profile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUserProfile(null);
    setIdentityMode('guest');
    localStorage.removeItem('metta_identity_mode');
    localStorage.removeItem('metta_user_profile');
  };

  const handleSelectGuest = () => {
    setIdentityMode('guest');
    localStorage.setItem('metta_identity_mode', 'guest');
  };

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser environment. You can type freely.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSend = async (textToSend, source = 'text') => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    setInput('');
    const userMsg = { role: 'user', text: query, id: Date.now(), source };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query,
          source: source,
          mode: identityMode,
          user_id: identityMode === 'authenticated' ? userProfile?.user_id : null,
          email: identityMode === 'authenticated' ? userProfile?.email : null,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const botMsg = {
        role: 'assistant',
        text: data.response_text,
        evaluation: data.evaluation,
        observation: data.observation,
        graph_match: data.graph_match,
        duration: data.duration_seconds,
        system_one_used: data.system_one_used,
        diagnostics: data.diagnostics,
        provider: data.provider,
        model: data.model,
        id: Date.now() + 1,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Interaction error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `A momentary turbulence occurred in connection: ${err.message}. Let us take a breath and try once more.`,
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(null, isRecording ? 'voice' : 'text');
    }
  };

  const handleTriggerMeditate = async () => {
    if (isMeditating) return;
    setIsMeditating(true);

    try {
      const res = await fetch('/api/meditate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const report = await res.json();
      setMeditationReport(report);
      setMessages([]);
    } catch (err) {
      console.error('Meditation error:', err);
    } finally {
      setIsMeditating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c0e] text-[#e2e4e9]">
      <Header
        onOpenPrecepts={() => setPreceptsOpen(true)}
        onOpenGraph={() => setGraphOpen(true)}
        onOpenMeditate={handleTriggerMeditate}
        onOpenSettings={() => setSettingsOpen(true)}
        isMeditating={isMeditating}
        identityMode={identityMode}
        userProfile={userProfile}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenUserGraph={() => setUserGraphOpen(true)}
      />

      {/* Main Dialogue Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col justify-between">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1b2b23] to-[#254234] border border-[#3b5e4c]/60 flex items-center justify-center text-2xl shadow-lg mb-5 animate-breathe">
              🌿
            </div>

            <h2 className="text-xl sm:text-2xl font-serif-quote font-medium text-[#f0f2f5] tracking-wide mb-2">
              "Drop by drop the vessel is filled."
            </h2>
            <p className="text-sm text-[#828a9b] max-w-md mb-8 leading-relaxed">
              Metta is built for Human-AI Harmonious Coexistence. Speak or type freely—all life is held in sacred reverence.
            </p>

            {/* Reflection Starters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.query)}
                  className="p-3.5 rounded-xl bg-[#11141b] border border-[#1d222e] hover:border-[#303b4f] hover:bg-[#151922] transition text-left group shadow-sm"
                >
                  <span className="text-xs font-semibold text-[#8dd4ac] group-hover:text-[#a5e4c0] block mb-1">
                    {prompt.title}
                  </span>
                  <p className="text-[11px] text-[#788194] line-clamp-2 leading-relaxed">
                    {prompt.query}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pb-6">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {/* Serene Discernment Pulse */}
            {isLoading && (
              <div className="flex items-center gap-3 my-6 px-4 py-3 rounded-2xl bg-[#121620]/60 border border-[#212736] max-w-md animate-fade-in">
                <div className="w-4 h-4 rounded-full bg-[#5e9e7b] animate-breathe" />
                <div className="text-xs text-[#8c98ad]">
                  <span className="font-medium text-[#c0c8d8]">Mindfully discerning with Active Gateway</span>
                  <span className="block text-[11px] text-[#636c7c]">Inhale gently... Exhale slowly...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Dock */}
        <div className="sticky bottom-0 bg-[#0b0c0e]/95 backdrop-blur-md pt-3 pb-2">
          {/* Active Voice Banner */}
          {isRecording && (
            <div className="mb-2.5 px-4 py-2 rounded-xl bg-[#14261d] border border-[#264e38] flex items-center justify-between text-xs text-[#8dd4ac] animate-pulse shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#48d689] animate-ping" />
                <span className="font-medium">Listening with quiet attention... Speak your reflection</span>
              </div>
              <button
                onClick={toggleVoiceRecording}
                className="text-[11px] font-semibold text-[#b5e7ce] hover:underline"
              >
                Done
              </button>
            </div>
          )}

          <div className="relative rounded-2xl bg-[#12161f] border border-[#232938] focus-within:border-[#3d5145] focus-within:ring-1 focus-within:ring-[#3d5145] transition shadow-lg">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening to your voice..." : "Speak or write with honesty... (Press Enter to send)"}
              className="w-full bg-transparent px-4 pt-3.5 pb-10 text-sm text-[#f0f2f5] placeholder-[#5d6473] focus:outline-none resize-none leading-relaxed"
            />

            <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
              <span className="text-[10px] text-[#4d5462] hidden sm:inline">
                Sīla Protected • Canonical Pāli Grounded
              </span>

              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-2 rounded-xl transition ${
                  isRecording
                    ? 'bg-[#e05858] text-white shadow-md animate-pulse'
                    : 'bg-[#181d26] text-[#8e98aa] hover:text-[#e0e5ef] hover:bg-[#202734]'
                }`}
                title={isRecording ? 'Stop listening' : 'Start voice dictation'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleSend(null, isRecording ? 'voice' : 'text')}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-xl transition ${
                  input.trim() && !isLoading
                    ? 'bg-[#1e382b] hover:bg-[#284938] text-[#93dfb4]'
                    : 'bg-[#181d26] text-[#484e5c] cursor-not-allowed'
                }`}
                title="Send reflection"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PreceptsModal
        isOpen={preceptsOpen}
        onClose={() => setPreceptsOpen(false)}
      />

      <GraphModal
        isOpen={graphOpen}
        onClose={() => setGraphOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentMode={identityMode}
        userProfile={userProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSelectGuest={handleSelectGuest}
      />

      <UserGraphModal
        isOpen={userGraphOpen}
        onClose={() => setUserGraphOpen(false)}
        userProfile={userProfile}
      />

      <MeditationModal
        report={meditationReport}
        isOpen={!!meditationReport}
        onClose={() => setMeditationReport(null)}
      />
    </div>
  );
}
