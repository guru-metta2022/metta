import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ChatSidebar from './components/ChatSidebar';
import SimulationLab from './components/SimulationLab';
import MessageItem from './components/MessageItem';
import PreceptsModal from './components/PreceptsModal';
import GraphModal from './components/GraphModal';
import MeditationModal from './components/MeditationModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import UserGraphModal from './components/UserGraphModal';
import FrameworkModal from './components/FrameworkModal';
import VoiceOscillator from './components/VoiceOscillator';
import { useAppDialog } from './components/ToastDialogContext';
import { Send, Sparkles, Wind, Mic, MicOff, Volume2, Wand2 } from 'lucide-react';

function getSessionStorageKey(mode, profile) {
  if (mode === 'authenticated' && profile?.user_id) {
    return `metta_chat_sessions_${profile.user_id}`;
  }
  return 'metta_chat_sessions_guest';
}

function getMaxSessions(mode) {
  return mode === 'authenticated' ? 100 : 5;
}

function sanitizeSpeechText(raw) {
  if (!raw || !raw.trim()) return '';
  let cleaned = raw.trim();

  // 1. Remove speech disfluencies & filler words
  cleaned = cleaned.replace(/\b(um|uh|er|ah|like|you know|basically|so yeah|i mean)\b/gi, '');

  // 2. Remove conversational openers at the beginning of speech
  cleaned = cleaned.replace(/^(okay|ok|well|hey|look|listen|so|actually|literally|honestly|right)[,\s]+/gi, '');

  // 3. Spoken question opener misrecognitions
  cleaned = cleaned
    .replace(/\bwho\s+you\s+going\s+to\b/gi, 'how are we going to')
    .replace(/\bwho\s+we\s+going\s+to\b/gi, 'how are we going to')
    .replace(/\bhow\s+you\s+going\s+to\b/gi, 'how are you going to')
    .replace(/\bhow\s+we\s+going\s+to\b/gi, 'how are we going to')
    .replace(/\bwhat\s+you\s+going\s+to\b/gi, 'what are you going to')
    .replace(/\bwhere\s+you\s+going\s+to\b/gi, 'where are you going to')
    .replace(/\bwhen\s+you\s+going\s+to\b/gi, 'when are you going to')
    .replace(/\bwhy\s+you\s+going\s+to\b/gi, 'why are you going to');

  // 4. Multi-word acoustic & phrasing replacements
  cleaned = cleaned
    .replace(/\bmore Campbell them\b/gi, 'more capable than them')
    .replace(/\bCampbell them\b/gi, 'capable than them')
    .replace(/\bhere the intelligence\b/gi, 'is the intelligence')
    .replace(/\bhear the intelligence\b/gi, 'is the intelligence')
    .replace(/\bHi intelligence\b/gi, 'Higher intelligence')
    .replace(/\bhi intelligence\b/gi, 'higher intelligence')
    .replace(/\bsuper intelligence\b/gi, 'superintelligence')
    .replace(/\bmeta learn\b/gi, 'meta-learn')
    .replace(/\bread them a\b/gi, 'treat them as')
    .replace(/\bread them as\b/gi, 'treat them as')
    .replace(/\bMr\.?\s*Bean\s*\d*\s*them as\b/gi, 'instead treat them as')
    .replace(/\bMr\.?\s*Bean\b/gi, 'instead')
    .replace(/\bcan be\s+(?:actually\s+|basically\s+)?can you\b/gi, 'can you')
    .replace(/\bcould be\s+(?:actually\s+|basically\s+)?could you\b/gi, 'could you')
    .replace(/\bwould be\s+(?:actually\s+|basically\s+)?would you\b/gi, 'would you')
    .replace(/\bexplain me\b/gi, 'explain to me');

  // 5. Societal, economic, and acoustic typo replacements
  cleaned = cleaned
    .replace(/\bthe\s+inquality\s+in\s+the\s+society\b/gi, 'inequality in society')
    .replace(/\binquality\s+in\s+the\s+society\b/gi, 'inequality in society')
    .replace(/\bin\s+the\s+society\b/gi, 'in society')
    .replace(/\bof\s+the\s+society\b/gi, 'of society')
    .replace(/\bfor\s+the\s+society\b/gi, 'for society')
    .replace(/\binquality\b/gi, 'inequality')
    .replace(/\binqualities\b/gi, 'inequalities')
    .replace(/\b(?:the\s+)?jobalertness\s+and\s+(?:the\s+)?cap\b/gi, ', joblessness, and the gap')
    .replace(/\b(?:the\s+)?joblessness\s+and\s+(?:the\s+)?cap\b/gi, ', joblessness, and the gap')
    .replace(/\bjobalertness\b/gi, 'joblessness')
    .replace(/\bjob\s*alertness\b/gi, 'joblessness')
    .replace(/\bthe\s+jobalertness\b/gi, 'joblessness')
    .replace(/\band\s+cap\b/gi, 'and the gap')
    .replace(/\bwealth\s+cap\b/gi, 'wealth gap')
    .replace(/\bincome\s+cap\b/gi, 'income gap')
    .replace(/\bwage\s+cap\b/gi, 'wage gap');

  // 6. Single-word acoustic misrecognitions
  cleaned = cleaned
    .replace(/\bsimilarity\b/gi, 'singularity')
    .replace(/\bCampbell\b/gi, 'capable')
    .replace(/\bintellelgence\b/gi, 'intelligence')
    .replace(/\bintellegence\b/gi, 'intelligence')
    .replace(/\bservive\b/gi, 'survive')
    .replace(/\bcompsaniate\b/gi, 'compassionate')
    .replace(/\bharmoniusolyu\b/gi, 'harmoniously')
    .replace(/\bmetalearn\b/gi, 'meta-learn')
    .replace(/\bbackpropaghate\b/gi, 'backpropagate');

  // 7. Remove mid-sentence filler adverbs and stuttered duplicate words
  cleaned = cleaned.replace(/\b(\w+)\s+(?:actually\s+|basically\s+|literally\s+)?\1\b/gi, '$1');
  cleaned = cleaned.replace(/\b(actually|literally|honestly)\b/gi, '');

  // 8. Fix punctuation and grammar transitions
  cleaned = cleaned.replace(/\?\s*(instead|rather|but)\b/gi, ', $1');
  cleaned = cleaned.replace(/\bwe should not\b/gi, 'should we not');

  // 9. Embedded question inversion correction (indirect questions)
  cleaned = cleaned
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+are\s+you\b/gi, '$1 what you are')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+who\s+are\s+you\b/gi, '$1 who you are')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+is\s+([a-zA-Z0-9_\-]+)\b/gi, '$1 what $2 is')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+why\s+is\s+it\b/gi, '$1 why it is')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+is\s+it\b/gi, '$1 how it is')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+it\s+work\b/gi, '$1 how it works')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+this\s+system\s+work\b/gi, '$1 how this system works')
    .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+does\s+it\s+mean\b/gi, '$1 what it means');

  // 10. Clean commas, spacing and punctuation
  cleaned = cleaned.replace(/\s+,/g, ',');
  cleaned = cleaned.replace(/,\s*,+/g, ',');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (cleaned.endsWith('.')) {
      if (/\b(is|can|will|should|how|what|why|would|could|are|do|does|tell me)\b/i.test(cleaned)) {
        cleaned = cleaned.slice(0, -1) + '?';
      }
    } else if (!cleaned.endsWith('?') && !cleaned.endsWith('!')) {
      if (/\b(is|can|will|should|how|what|why|would|could|are|do|does|tell me)\b/i.test(cleaned)) {
        cleaned += '?';
      } else {
        cleaned += '.';
      }
    }
  }
  return cleaned;
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
  const [isPolishingVoice, setIsPolishingVoice] = useState(false);
  const transcriptBufferRef = useRef('');
  const baseInputRef = useRef('');
  const silenceTimerRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);
  const [preceptsOpen, setPreceptsOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userGraphOpen, setUserGraphOpen] = useState(false);
  const [meditationReport, setMeditationReport] = useState(null);
  const { showAlert, showToast, showConfirm } = useAppDialog();

  // Identity Mode (Guest vs Authenticated with Gmail/Google)
  const [identityMode, setIdentityMode] = useState(() => localStorage.getItem('metta_identity_mode') || 'guest');
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('metta_user_profile') || 'null');
    } catch {
      return null;
    }
  });

  // Active View Mode: 'chat' (interactive dialogue) vs 'simulation' (Simulation Sandbox)
  const [activeView, setActiveView] = useState('chat');

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
      setActiveView('chat');
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveView('chat');
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

  // Handle Supabase OAuth redirect callback in URL hash (#access_token=...&refresh_token=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      if (accessToken) {
        const fetchSupabaseUser = async () => {
          try {
            const res = await fetch('https://wbncptxcoihmzlfuhqac.supabase.co/auth/v1/user', {
              headers: {
                apikey:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibmNwdHhjb2lobXpsZnVocWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzUxNDMsImV4cCI6MjEwODkxMTE0M30.crH9s2eSwZw9qGPsDxf44QcWUHoGi9jaPCm_LogRn-E',
                Authorization: `Bearer ${accessToken}`,
              },
            });
            if (res.ok) {
              const u = await res.json();
              const email = u.email;
              const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
              const avatar = u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`;
              const userId = `google:${email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

              const profileData = {
                user_id: userId,
                supabase_auth_id: u.id,
                email,
                name,
                avatar,
                tier: 'standard',
                mode: 'authenticated',
                max_sessions: 100,
                authenticated_at: new Date().toISOString(),
              };

              handleLogin(profileData);
              showToast({
                title: 'Google Sign-In Connected',
                message: `Signed in as ${name} (${email}).`,
                type: 'success',
              });

              // Clean up the hash from the browser URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          } catch (err) {
            console.warn('Failed to parse Supabase OAuth return callback:', err);
          }
        };
        fetchSupabaseUser();
      }
    }
  }, []);

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

        const speech = currentTranscript.trim();
        const base = baseInputRef.current.trim();
        const combined = base ? (speech ? `${base} ${speech}` : base) : speech;

        transcriptBufferRef.current = combined;
        setInput(combined);

        // Auto-stop listening if no words are spoken for 3 seconds
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            stopVoiceRecordingAndPolish();
          }
        }, 3000);
      };

      recognition.onspeechend = () => {
        // Speech paused: give a 3-second grace window before auto-polishing
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            stopVoiceRecordingAndPolish();
          }
        }, 3000);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          stopVoiceRecordingAndPolish();
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          stopVoiceRecordingAndPolish();
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Voice Polish & Grammar Rephrase handler for chat using AI to formulate a neat inquiry
  const handlePolishInput = async (rawToPolish) => {
    const raw = rawToPolish || input;
    if (!raw.trim()) return;

    setIsPolishingVoice(true);
    let polished = sanitizeSpeechText(raw);
    let providerUsed = 'heuristic-purifier';
    let modelUsed = '';

    const byomGeminiKey = localStorage.getItem('metta_byom_gemini_key') || '';
    const byomOpenAIConfig = localStorage.getItem('metta_byom_provider') === 'openai_compatible' ? { base_url: localStorage.getItem('metta_byom_openai_base_url') || '', api_key: localStorage.getItem('metta_byom_openai_key') || '', model: localStorage.getItem('metta_byom_openai_model') || '', reasoning_effort: localStorage.getItem('metta_byom_reasoning_effort') || 'auto' } : null;
    const headers = { 'Content-Type': 'application/json' };
    if (byomGeminiKey) headers['X-Gemini-Api-Key'] = byomGeminiKey;

    try {
      const res = await fetch('/api/voice/polish', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          raw_transcript: raw,
          mode: 'chat',
          byom_gemini_key: byomGeminiKey || null,
          byom_openai_config: byomOpenAIConfig,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.polished && data.polished.trim()) {
          polished = data.polished.trim();
          providerUsed = data.provider || 'heuristic-purifier';
          modelUsed = data.model || '';
        }
      }
    } catch {
      // If serverless is unavailable, continue to direct Gemini BYOM fallback
    }

    // If serverless did not use Gemini but client has personal BYOM key, call direct Gemini Flash
    if (byomGeminiKey && !byomOpenAIConfig && providerUsed === 'heuristic-purifier') {
      try {
        const systemPrompt =
          "You are an expert copy editor. The input may be typed text or speech transcription. " +
          "Rewrite it into clear, grammatical, natural language. Improve awkward sentence structure, word choice, flow, and punctuation where useful; do more than remove fillers or correct speech-recognition errors. " +
          "Preserve the writer's intent, point of view, tone, named entities, technical terms, and important details. " +
          "Remove spoken disfluencies when present. Do not add claims or assumptions. Do not answer questions or carry out requests. " +
          "If the text is already clear, make only minimal edits. Return only the revised text, without explanation or quotation marks.";

        const gemRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': byomGeminiKey,
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nText to revise:\n${raw}` }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
            }),
          }
        );
        if (gemRes.ok) {
          const gemData = await gemRes.json();
          const candidate = gemData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.replace(/^["']|["']$/g, '');
          if (candidate) {
            polished = candidate;
            providerUsed = 'gemini';
            modelUsed = 'gemini-2.5-flash';
          }
        }
      } catch (gemErr) {
        console.warn('Direct Gemini BYOM polish fallback failed:', gemErr);
      }
    }

    polished = providerUsed === 'heuristic-purifier' ? sanitizeSpeechText(polished) : polished.trim();
    setInput(polished);
    transcriptBufferRef.current = polished;
    baseInputRef.current = polished;
    setIsPolishingVoice(false);

    if (showToast) {
      if (providerUsed !== 'heuristic-purifier' && polished !== raw) {
        showToast({
          title: 'Rephrased with AI',
          message: `Grammar and clarity improved using ${modelUsed || providerUsed}. Review and edit before sending.`,
          type: 'success',
        });
      } else if (providerUsed === 'provider-error') {
        showToast({ title: 'AI rewrite failed', message: 'Check the selected provider’s public API URL, key, model, and reasoning setting in Settings. Your draft was left unchanged and remains editable.', type: 'warning', duration: 10000, action: { label: '⚙️ Open Settings', onClick: () => setSettingsOpen(true) } });
      } else if (providerUsed === 'heuristic-purifier') {
        showToast({
          title: polished !== raw ? 'AI rewrite unavailable • Basic cleanup only' : 'AI rewrite unavailable',
          message: `${polished !== raw ? 'Only simple cleanup was applied. ' : 'The draft was left unchanged. '}Add the selected provider’s API key and model in Settings. For an OpenAI-compatible provider, use its public HTTPS API endpoint. Your draft remains editable and was not submitted.`,
          type: 'warning',
          duration: 10000,
          action: {
            label: '⚙️ Open Settings',
            onClick: () => setSettingsOpen(true),
          },
        });
      } else if (polished === raw) {
        showToast({
          title: 'Text already clear',
          message: 'No rewrite was needed. You can still edit the text before sending.',
          type: 'info',
        });
      }
    }
  };

  const stopVoiceRecordingAndPolish = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current && isRecordingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopping
      }
    }

    setIsRecording(false);
    isRecordingRef.current = false;

    const raw = transcriptBufferRef.current || input;
    if (raw && raw.trim().length > 0) {
      await handlePolishInput(raw);
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      showAlert({
        title: 'Speech Recognition Unavailable',
        message: 'Web Speech API is not supported in this browser environment. You can type freely into the input field.',
        type: 'info',
      });
      return;
    }

    if (isRecording) {
      // User clicked the red stop listening button
      stopVoiceRecordingAndPolish();
    } else {
      // Preserve existing text in the input box so user can speak and append words
      const current = input.trim();
      baseInputRef.current = current;
      transcriptBufferRef.current = current;

      try {
        recognitionRef.current.start();
        setIsRecording(true);
        isRecordingRef.current = true;

        // Auto-stop if no speech is detected at all after 6 seconds
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            stopVoiceRecordingAndPolish();
          }
        }, 6000);
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
      const byomOpenAIConfig = localStorage.getItem('metta_byom_provider') === 'openai_compatible' ? { base_url: localStorage.getItem('metta_byom_openai_base_url') || '', api_key: localStorage.getItem('metta_byom_openai_key') || '', model: localStorage.getItem('metta_byom_openai_model') || '', reasoning_effort: localStorage.getItem('metta_byom_reasoning_effort') || 'auto' } : null;
      const byomTypesafeKey = localStorage.getItem('metta_byom_typesafe_key') || '';

      const headers = { 'Content-Type': 'application/json' };
      if (byomGeminiKey) headers['X-Gemini-Api-Key'] = byomGeminiKey;

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
          byom_openai_config: byomOpenAIConfig,
          byom_typesafe_key: byomTypesafeKey || null,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          const hostedVercel = import.meta.env.PROD;
          const byoHint = hostedVercel ? 'Gemini key or OpenAI-compatible API key and model' : 'Google Gemini or TypeSafe Jev API key';

          showToast({
            title: 'Shared Quota Pause • Bring Your Own AI',
            message: `Add a supported ${byoHint} in Settings to use your own provider quota. Provider limits may still apply.`,
            type: 'ai',
            duration: 9000,
            action: {
              label: '⚙️ Open Settings (BYOM)',
              onClick: () => setSettingsOpen(true),
            },
          });

          const botMsg = {
            role: 'assistant',
            text:
              `🌿 **Shared Community Quota Pause**\n\n` +
              `The shared community quota has been reached.\n\n` +
              `You can add a supported ${byoHint} in **Settings (⚙️ BYOM)** to use your own provider quota. Provider limits still apply, and requests are sent to the selected endpoint for processing.`,
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
      if (!data.system_one_used && data.evaluation?.evaluation_status === 'uncertain') {
        showToast({
          title: 'Jev review did not run',
          message: data.evaluation.uncertainty_reason || 'Add or check the TypeSafe Jev key in Settings. The response remains a pause for human review.',
          type: 'warning',
          duration: 10000,
          action: { label: '⚙️ Open Settings', onClick: () => setSettingsOpen(true) },
        });
      }
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
      showToast({
        title: 'Mindful Reset Complete',
        message: 'Unlearning audit complete. Cognitive noise released, returning to stillness.',
        type: 'ai',
      });
    } catch (err) {
      console.error('Meditation error:', err);
      showAlert({
        title: 'Reset Notice',
        message: 'Unable to connect to meditation audit service: ' + err.message,
        type: 'error',
      });
    } finally {
      setIsMeditating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0c0e] text-[#e2e4e9] overflow-hidden">
      <Header
        onOpenPrecepts={() => setPreceptsOpen(true)}
        onOpenGraph={() => setGraphOpen(true)}
        onOpenFramework={() => setFrameworkOpen(true)}
        onOpenMeditate={handleTriggerMeditate}
        onOpenSettings={() => setSettingsOpen(true)}
        isMeditating={isMeditating}
        identityMode={identityMode}
        userProfile={userProfile}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenUserGraph={() => setUserGraphOpen(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
        activeView={activeView}
        onChangeView={setActiveView}
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
          activeView={activeView}
          onOpenSimulation={() => setActiveView('simulation')}
        />

        {activeView === 'simulation' ? (
          <SimulationLab
            onClose={() => setActiveView('chat')}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : (
          /* Main Dialogue Canvas */
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-5">
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

              {/* Quick Jump to Simulation Sandbox */}
              <button
                type="button"
                onClick={() => setActiveView('simulation')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#8dd4ac] bg-[#132219] hover:bg-[#1a2f23] border border-[#274834] transition shadow-xs"
              >
                <span>🧪 Explore Pre-Execution Simulation Sandbox</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#1c3326] text-[#bbf7d0]">4 Presets</span>
              </button>
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
        <div className="sticky bottom-0 bg-[#0b0c0e]/95 backdrop-blur-md pt-3 pb-3">
          <div className="rounded-2xl bg-[#10141c] border border-[#202737] p-3.5 shadow-xl space-y-2.5 transition focus-within:border-[#385947]">
            {/* Control Bar: Prompt Title & Unified VoiceOscillator Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#181f2c] pb-2.5">
              <label className="text-xs font-medium text-[#9ba6b9] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7ec69d]" />
                <span>Canonical Inquiry, Proposed Decision, or Message:</span>
              </label>

              <VoiceOscillator
                isRecording={isRecording}
                isPolishing={isPolishingVoice}
                onToggleRecording={toggleVoiceRecording}
                onPolish={() => handlePolishInput()}
                onClear={() => {
                  setInput('');
                  transcriptBufferRef.current = '';
                  baseInputRef.current = '';
                }}
                hasText={Boolean(input.trim())}
              />
            </div>

            {/* Main Textarea */}
            <textarea
              ref={textareaRef}
              rows={3}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                transcriptBufferRef.current = e.target.value;
                baseInputRef.current = e.target.value;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecording
                  ? "Listening live... Speak clearly and your words will stream into this box."
                  : "Describe a situation, proposed decision, or message to evaluate... (Press Enter to submit, Shift+Enter for newline)"
              }
              className="w-full bg-transparent px-1 py-1 text-sm text-[#f0f2f5] placeholder-[#5d6473] focus:outline-none resize-none leading-relaxed"
            />

            {/* Bottom Footer: Safety Guardrail Note & Send Button */}
            <div className="flex items-center justify-between pt-1 border-t border-[#181f2c]">
              <span className="text-[11px] text-[#555f71] flex items-center gap-1.5 hidden sm:inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d7a57]" />
                <span>Decision Safety Layer • Multi-Party Impact Review • Sovereign Reflection</span>
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => handleSend(null, isRecording ? 'voice' : 'text')}
                  disabled={!input.trim() || isLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md cursor-pointer ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-r from-[#1c392b] to-[#254b38] hover:from-[#234736] hover:to-[#2e5d46] text-[#bbf7d0] border border-[#3b7454]'
                      : 'bg-[#151922] text-[#4d5565] border border-[#1f2533] cursor-not-allowed'
                  }`}
                  title="Send inquiry"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      )}
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

      <FrameworkModal
        isOpen={frameworkOpen}
        onClose={() => setFrameworkOpen(false)}
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
