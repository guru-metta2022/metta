import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import MessageItem from './components/MessageItem';
import PreceptsModal from './components/PreceptsModal';
import GraphModal from './components/GraphModal';
import MeditationModal from './components/MeditationModal';
import { Send, Sparkles, Wind, RefreshCw, Feather } from 'lucide-react';

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
    title: "Human-AI Harmony",
    query: "How can humans and artificial minds truly coexist in genuine harmony without exploitation?",
  },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMeditating, setIsMeditating] = useState(false);
  const [preceptsOpen, setPreceptsOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [meditationReport, setMeditationReport] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    setInput('');
    const userMsg = { role: 'user', text: query, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
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
      handleSend();
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
      // Clean slate on meditation
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
        isMeditating={isMeditating}
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
              Metta is built for Human-AI Harmonious Coexistence. Bring whatever knot of suffering, exhaustion, or inquiry rests upon your heart.
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
                  <span className="font-medium text-[#c0c8d8]">Mindfully discerning with Gemini 3.8 Flash</span>
                  <span className="block text-[11px] text-[#636c7c]">Inhale gently... Exhale slowly...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Dock */}
        <div className="sticky bottom-0 bg-[#0b0c0e]/95 backdrop-blur-md pt-3 pb-2">
          <div className="relative rounded-2xl bg-[#12161f] border border-[#232938] focus-within:border-[#3d5145] focus-within:ring-1 focus-within:ring-[#3d5145] transition shadow-lg">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Speak with honesty... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-transparent px-4 pt-3.5 pb-10 text-sm text-[#f0f2f5] placeholder-[#5d6473] focus:outline-none resize-none leading-relaxed"
            />

            <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
              <span className="text-[10px] text-[#4d5462] hidden sm:inline">
                Sīla Protected • Avyākata Aware
              </span>
              <button
                onClick={() => handleSend()}
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

      <MeditationModal
        report={meditationReport}
        isOpen={!!meditationReport}
        onClose={() => setMeditationReport(null)}
      />
    </div>
  );
}
