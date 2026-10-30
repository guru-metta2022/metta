import React, { useState } from 'react';
import { X, User, CheckCircle2, ShieldCheck, Mail, LogOut, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, currentMode, userProfile, onLogin, onLogout, onSelectGuest }) {
  const [emailInput, setEmailInput] = useState(userProfile?.email || 'seeker.bodhi@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          name: emailInput.split('@')[0],
        }),
      });
      if (!res.ok) throw new Error('Authentication failed');
      const data = await res.json();
      onLogin(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Unable to authenticate with Google: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestChoice = () => {
    onSelectGuest();
    onClose();
  };

  const handleLogoutChoice = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#10131a] border border-[#212736] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1c2230] flex items-center justify-between bg-[#131722]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18261e] border border-[#2b4c39] flex items-center justify-center text-sm">
              ⚖️
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f0f2f5]">Session & Account Settings</h3>
              <p className="text-[11px] text-[#7d8799]">Choose how Metta handles your reflection history and session context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6f788b] hover:text-[#e4e7ee] hover:bg-[#1a202d] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status Pill */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-[#21293a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentMode === 'authenticated'
                  ? 'bg-[#1b3829] text-[#7ec69d] border border-[#2e5d42]'
                  : 'bg-[#1c2230] text-[#939db2] border border-[#2d374d]'
              }`}>
                {currentMode === 'authenticated' ? '🌿' : '👤'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#f0f2f5]">
                    {currentMode === 'authenticated' ? userProfile?.name || 'Authenticated User' : 'Guest Mode'}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                    currentMode === 'authenticated'
                      ? 'bg-[#172c20] text-[#7ec69d] border border-[#2d5940]'
                      : 'bg-[#1c2331] text-[#9da6b9] border border-[#2e3a50]'
                  }`}>
                    {currentMode === 'authenticated' ? 'Account Active' : 'Guest Mode'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7b8598]">
                  {currentMode === 'authenticated'
                    ? userProfile?.email
                    : 'Private & ephemeral session • No data stored'}
                </p>
              </div>
            </div>

            {currentMode === 'authenticated' && (
              <button
                onClick={handleLogoutChoice}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#e06d6d] hover:bg-[#2b1818] border border-[#442323] transition"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Option 1: Guest Mode */}
          <div className={`p-4 rounded-xl border transition ${
            currentMode === 'guest'
              ? 'bg-[#121926]/40 border-[#324564]'
              : 'bg-[#11141c] border-[#1d222e] hover:border-[#2a3449]'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#7592b5]" />
                <h4 className="text-xs font-semibold text-[#f0f2f5]">Guest Mode (Private & Ephemeral)</h4>
              </div>
              {currentMode === 'guest' && (
                <span className="text-[10px] text-[#7592b5] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#808a9d] leading-relaxed mb-3">
              Completely private and ephemeral. Metta retains zero history, patterns, or data across sessions. Ideal for one-off decision reviews.
            </p>
            {currentMode !== 'guest' && (
              <button
                onClick={handleGuestChoice}
                className="w-full py-2 rounded-lg text-xs font-medium bg-[#161d2a] hover:bg-[#1e2738] text-[#c4cddc] border border-[#263247] transition"
              >
                Switch to Guest Mode
              </button>
            )}
          </div>

          {/* Option 2: Gmail Login (Personal Memory Graph) */}
          <div className={`p-4 rounded-xl border transition ${
            currentMode === 'authenticated'
              ? 'bg-[#13231a]/40 border-[#2b533b]'
              : 'bg-[#11141c] border-[#1d222e] hover:border-[#2a4635]'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7ec69d]" />
                <h4 className="text-xs font-semibold text-[#f0f2f5]">Account Login (Save Reflection History)</h4>
              </div>
              {currentMode === 'authenticated' && (
                <span className="text-[10px] text-[#7ec69d] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#808a9d] leading-relaxed mb-3.5">
              Keeps a private map of recurring themes (e.g. prioritization, sensitive communication, decision risks) and effective resolution strategies, accessible only to you.
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#5e6678] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[#0c0e14] border border-[#212736] focus:border-[#385c49] focus:ring-1 focus:ring-[#385c49] rounded-lg pl-9 pr-3 py-2 text-xs text-[#f0f2f5] placeholder-[#555d6e] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-[#1c392b] to-[#254b38] hover:from-[#234736] hover:to-[#2e5d46] text-[#a5e8c4] border border-[#3b6b52] flex items-center justify-center gap-2 transition shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isSubmitting ? 'Authenticating...' : 'Sign in with Google'}</span>
              </button>
            </form>
          </div>

          {/* Privacy & Data Sovereignty */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[#0e1118] border border-[#1b202e] text-[11px] text-[#6d778a]">
            <ShieldCheck className="w-4 h-4 text-[#5e9e7b] shrink-0 mt-0.5" />
            <p>
              <strong>Data Sovereignty:</strong> You maintain complete ownership over your data. No information is sold or used for model training, and you may delete your saved data with a single click at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
