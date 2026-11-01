import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Sparkles, Wand2, X } from 'lucide-react';

/**
 * VoiceOscillator Component
 * Provides real-time audio visualization (via Web Audio API AnalyserNode or animated fallback),
 * live streaming indicators, auto-stop notification, and AI Polish controls.
 */
export default function VoiceOscillator({
  isRecording = false,
  isPolishing = false,
  onToggleRecording,
  onPolish,
  onClear,
  hasText = false,
  compact = false,
}) {
  const [audioLevels, setAudioLevels] = useState([20, 45, 75, 95, 60, 40, 25]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isRecording) {
      // Clean up audio graph
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
        audioContextRef.current = null;
      }
      setAudioLevels([15, 35, 60, 80, 50, 30, 20]);
      return;
    }

    let isMounted = true;

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.6;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevels = () => {
          if (!isMounted || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Sample 7 frequency bands
          const levels = [];
          const step = Math.floor(bufferLength / 7) || 1;
          for (let i = 0; i < 7; i++) {
            const val = dataArray[i * step] || 0;
            // Normalize to percentage between 15% and 100%
            const pct = Math.max(15, Math.min(100, (val / 255) * 100));
            levels.push(pct);
          }
          setAudioLevels(levels);
          animFrameRef.current = requestAnimationFrame(updateLevels);
        };

        updateLevels();
      } catch (err) {
        // Fallback to animated cadence if mic stream access is restricted
        console.info('Using synthetic audio oscillator visualization:', err.message);
        let tick = 0;
        const interval = setInterval(() => {
          if (!isMounted) {
            clearInterval(interval);
            return;
          }
          tick++;
          setAudioLevels([
            25 + Math.sin(tick * 0.4) * 20,
            40 + Math.sin(tick * 0.5 + 1) * 35,
            65 + Math.sin(tick * 0.6 + 2) * 30,
            85 + Math.sin(tick * 0.7 + 3) * 15,
            60 + Math.sin(tick * 0.5 + 4) * 30,
            40 + Math.sin(tick * 0.4 + 5) * 25,
            20 + Math.sin(tick * 0.3 + 6) * 15,
          ]);
        }, 80);

        return () => clearInterval(interval);
      }
    }

    initAudio();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [isRecording]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Live Audio Oscillator Waveform when listening */}
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 shadow-md">
          <div className="flex items-end gap-1 h-4">
            {audioLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="w-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full transition-all duration-75"
                style={{ height: `${lvl}%` }}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono font-medium tracking-tight">
            Streaming voice... (auto-stops on 3s silence)
          </span>
        </div>
      )}

      {/* AI Polish Indicator */}
      {isPolishing && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14231b] border border-[#2d523e] text-[#86e2ad] text-xs font-mono animate-pulse shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-[#52b788]" />
          <span>Improving grammar and phrasing...</span>
        </div>
      )}

      {/* Manual Polish AI Button */}
      {!isRecording && hasText && onPolish && (
        <button
          type="button"
          onClick={onPolish}
          disabled={isPolishing}
          className="px-2.5 py-1.5 rounded-xl border border-[#27382c] bg-[#121c16] hover:bg-[#1a2920] text-[#8dd4ac] text-xs font-medium flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
          title="Rewrite this draft for grammar and clarity, then review it before sending"
        >
          <Wand2 className="w-3.5 h-3.5 text-[#7ec69d]" />
          <span>Polish AI</span>
        </button>
      )}

      {/* Voice Toggle Button: Red Stop Listening when active, Neutral Voice when idle */}
      {onToggleRecording && (
        <button
          type="button"
          onClick={onToggleRecording}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
            isRecording
              ? 'bg-rose-900/90 border-rose-500 text-rose-100 shadow-rose-950/50 animate-pulse hover:bg-rose-800'
              : 'bg-[#151a24] border-[#222a3a] text-[#8f9bb0] hover:text-[#f0f2f5] hover:bg-[#1c2331]'
          }`}
          title={
            isRecording
              ? 'Click to stop listening and rewrite the draft for grammar and clarity'
              : 'Speak your inquiry via live streaming voice'
          }
        >
          {isRecording ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-white animate-bounce" />
              <span className="font-semibold text-white">Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-[#7ec69d]" />
              <span>Voice Input</span>
            </>
          )}
        </button>
      )}

      {/* Clear Button */}
      {hasText && onClear && !isRecording && (
        <button
          type="button"
          onClick={onClear}
          className="px-2 py-1.5 rounded-lg text-xs text-[#717c91] hover:text-[#cbd4e1] hover:bg-[#181d26] transition"
          title="Clear text"
        >
          Clear
        </button>
      )}
    </div>
  );
}
