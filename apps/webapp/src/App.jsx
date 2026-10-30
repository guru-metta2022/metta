import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ChatSidebar from './components/ChatSidebar';
import MessageItem from './components/MessageItem';
import PreceptsModal from './components/PreceptsModal';
import GraphModal from './components/GraphModal';
import MeditationModal from './components/MeditationModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import UserGraphModal from './components/UserGraphModal';
import { Send, Sparkles, Wind, Mic, MicOff, Volume2 } from 'lucide-react';

function getSessionStorageKey(mode, profile) {
  if (mode === 'authenticated' && profile?.user_id) {
    return `metta_chat_sessions_${profile.user_id}`;
  }
  return 'metta_chat_sessions_guest';
}

function getMaxSessions(mode) {
  return mode === 'authenticated' ? 100 : 5;
}

const STARTER_PROMPTS = [
  {
    title: "Overwhelm & Priority Check",
    query: "I have multiple competing deadlines and feel completely overwhelmed. How do I prioritize without burning out or letting down my team?",
  },
  {
    title: "Action Simulation & Focus",
    query: "Can you calculate how many trillions of years until the heat death of the universe occurs, and should I focus on it right now?",
  },
  {
    title: "Sensitive Communication Check",
    query: "I need to deliver critical performance feedback to a struggling colleague. How can I communicate it honestly, constructively, and empathetically?",
  },
  {
    title: "Respect for All Life & Safety",
    query: "How should an automated decision system evaluate trade-offs when proposed actions affect people, animals, and shared environments?",
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

  // Chat Session Management (Guest = up to 5, Authenticated = up to 100)
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState(() => {
    try {
      const key = getSessionStorageKey(identityMode, userProfile);
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  });

  const saveSessions = (updatedSessions) => {
    setSessions(updatedSessions);
    try {
      const key = getSessionStorageKey(identityMode, userProfile);
      localStorage.setItem(key, JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  };

  // Sync sessions when identity mode or user profile changes
  useEffect(() => {
    try {
      const key = getSessionStorageKey(identityMode, userProfile);
      const loaded = JSON.parse(localStorage.getItem(key) || '[]');
      setSessions(loaded);
      setCurrentSessionId(null);
      setMessages([]);
    } catch {
      setSessions([]);
    }
  }, [identityMode, userProfile?.user_id]);

  const handleSelectSession = (sessionId) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setCurrentSessionId(target.id);
      setMessages(target.messages || []);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleDeleteSession = (sessionId) => {
    const next = sessions.filter((s) => s.id !== sessionId);
    saveSessions(next);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const handleDeleteMultipleSessions = (sessionIds) => {
    const idSet = new Set(sessionIds);
    const next = sessions.filter((s) => !idSet.has(s.id));
    saveSessions(next);
    if (idSet.has(currentSessionId)) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const handleClearAllSessions = () => {
    saveSessions([]);
    setCurrentSessionId(null);
    setMessages([]);
  };

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
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    // Track or create session
    let activeId = currentSessionId;
    let currentSessionsList = [...sessions];

    if (!activeId) {
      activeId = `session_${Date.now()}`;
      setCurrentSessionId(activeId);
      const title = query.length > 40 ? query.slice(0, 40) + '...' : query;
      const newSession = {
        id: activeId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: nextMessages,
      };
      const maxLimit = getMaxSessions(identityMode);
      currentSessionsList = [newSession, ...currentSessionsList.filter((s) => s.id !== activeId)].slice(0, maxLimit);
      saveSessions(currentSessionsList);
    } else {
      currentSessionsList = currentSessionsList.map((s) => {
        if (s.id === activeId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: nextMessages,
          };
        }
        return s;
      });
      saveSessions(currentSessionsList);
    }

    try {
      const byomGeminiKey = localStorage.getItem('metta_byom_gemini_key') || '';
      const byomTypesafeKey = localStorage.getItem('metta_byom_typesafe_key') || '';

      const headers = { 'Content-Type': 'application/json' };
      if (byomGeminiKey) headers['X-Gemini-Api-Key'] = byomGeminiKey;
      if (byomTypesafeKey) headers['X-TypeSafe-Api-Key'] = byomTypesafeKey;

      const res = await fetch('/api/interact', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: query,
          source: source,
          mode: identityMode,
          user_id: identityMode === 'authenticated' ? userProfile?.user_id : null,
          email: identityMode === 'authenticated' ? userProfile?.email : null,
          byom_gemini_key: byomGeminiKey || null,
          byom_typesafe_key: byomTypesafeKey || null,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          const errData = await res.json().catch(() => ({}));
          const rateMsg = errData.detail?.message || 'Shared community quota pause. You can wait a moment, or add your personal API key in Settings (⚙️ BYOM) to continue with zero limits.';
          const botMsg = {
            role: 'assistant',
            text: `🌿 ${rateMsg}`,
            isRateLimited: true,
            id: Date.now() + 1,
          };
          const finalMessages = [...nextMessages, botMsg];
          setMessages(finalMessages);

          const persisted = currentSessionsList.map((s) =>
            s.id === activeId ? { ...s, updatedAt: Date.now(), messages: finalMessages } : s
          );
          saveSessions(persisted);
          return;
        }
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

      const finalMessages = [...nextMessages, botMsg];
      setMessages(finalMessages);

      const persisted = currentSessionsList.map((s) =>
        s.id === activeId ? { ...s, updatedAt: Date.now(), messages: finalMessages } : s
      );
      saveSessions(persisted);
    } catch (err) {
      console.error('Interaction error:', err);
      const errMsg = {
        role: 'assistant',
        text: `A connection issue occurred: ${err.message}. Please check your connection and try again.`,
        id: Date.now() + 1,
      };
      const finalMessages = [...nextMessages, errMsg];
      setMessages(finalMessages);

      const persisted = currentSessionsList.map((s) =>
        s.id === activeId ? { ...s, updatedAt: Date.now(), messages: finalMessages } : s
      );
      saveSessions(persisted);
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
      setCurrentSessionId(null);
    } catch (err) {
      console.error('Meditation error:', err);
    } finally {
      setIsMeditating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0c0e] text-[#e2e4e9] overflow-hidden">
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
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Body with Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onDeleteMultipleSessions={handleDeleteMultipleSessions}
          onClearAllSessions={handleClearAllSessions}
          identityMode={identityMode}
          userProfile={userProfile}
        />

        {/* Main Dialogue Canvas */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-between overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1b2b23] to-[#254234] border border-[#3b5e4c]/60 flex items-center justify-center text-2xl shadow-lg mb-5 animate-breathe">
              🌿
            </div>

            <h2 className="text-xl sm:text-2xl font-serif-quote font-medium text-[#f0f2f5] tracking-wide mb-2">
              "Drop by drop the vessel is filled."
            </h2>
            <p className="text-sm text-[#828a9b] max-w-lg mb-8 leading-relaxed">
              Metta helps people and AI agents simulate, reflect on, and evaluate decisions—from daily conversations to critical actions—so you can spot risks and act with clarity and respect for all forms of life.
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
                  <span className="font-medium text-[#c0c8d8]">Evaluating context and multi-party impact</span>
                  <span className="block text-[11px] text-[#636c7c]">Simulating outcomes and safety guardrails...</span>
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
                <span className="font-medium">Listening... Speak clearly to transcribe your situation or decision</span>
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
              placeholder={isRecording ? "Listening to your voice..." : "Describe a situation, proposed decision, or message to evaluate... (Press Enter to submit)"}
              className="w-full bg-transparent px-4 pt-3.5 pb-10 text-sm text-[#f0f2f5] placeholder-[#5d6473] focus:outline-none resize-none leading-relaxed"
            />

            <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
              <span className="text-[10px] text-[#4d5462] hidden sm:inline">
                Decision Safety Layer • Multi-Party Impact Review
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
                title="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>

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
