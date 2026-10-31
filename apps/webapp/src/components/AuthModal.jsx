import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { useAppDialog } from './ToastDialogContext';

export default function AuthModal({
  isOpen,
  onClose,
  currentMode,
  userProfile,
  onLogin,
  onLogout,
  onSelectGuest,
}) {
  const [authTab, setAuthTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }
  const { showToast } = useAppDialog();

  // Reset fields whenever modal opens/closes or auth state changes
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setStatusNotice(null);
      if (currentMode === 'authenticated') {
        setEmail(userProfile?.email || '');
      } else {
        setEmail('');
        setName('');
      }
    } else {
      setPassword('');
      setShowPassword(false);
      setStatusNotice(null);
    }
  }, [isOpen, currentMode, userProfile]);

  if (!isOpen) return null;

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setStatusNotice({ type: 'error', message: 'Please enter both your email address and password.' });
      return;
    }

    setIsSubmitting(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusNotice({
          type: 'error',
          message: data.error || 'Failed to sign in. Please verify your credentials.',
        });
        setIsSubmitting(false);
        return;
      }

      const profileData = {
        user_id: data.user_id,
        supabase_auth_id: data.supabase_auth_id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        tier: data.tier || 'standard',
        mode: 'authenticated',
        max_sessions: 100,
        authenticated_at: new Date().toISOString(),
      };

      if (data.access_token) {
        localStorage.setItem('metta_supabase_access_token', data.access_token);
      }
      localStorage.setItem('metta_user_profile', JSON.stringify(profileData));
      localStorage.setItem('metta_identity_mode', 'authenticated');

      setPassword('');
      setStatusNotice(null);
      onLogin(profileData);
      onClose();

      showToast({
        title: 'Welcome Back',
        message: `Signed in as ${profileData.name} (${profileData.email}). Up to 100 reflection sessions enabled.`,
        type: 'success',
      });
    } catch (err) {
      setStatusNotice({
        type: 'error',
        message: 'Network error connecting to authentication: ' + err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setStatusNotice({ type: 'error', message: 'Email and password are required to create an account.' });
      return;
    }
    if (password.length < 6) {
      setStatusNotice({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsSubmitting(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: email.trim(),
          password,
          name: name.trim() || email.split('@')[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusNotice({
          type: 'error',
          message: data.error || 'Unable to create account. Please try again.',
        });
        setIsSubmitting(false);
        return;
      }

      if (data.confirmed) {
        // Auto-confirmed or existing confirmed session
        const profileData = {
          user_id: data.user_id,
          supabase_auth_id: data.supabase_auth_id,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          tier: 'standard',
          mode: 'authenticated',
          max_sessions: 100,
          authenticated_at: new Date().toISOString(),
        };

        if (data.access_token) {
          localStorage.setItem('metta_supabase_access_token', data.access_token);
        }
        localStorage.setItem('metta_user_profile', JSON.stringify(profileData));
        localStorage.setItem('metta_identity_mode', 'authenticated');

        setPassword('');
        setName('');
        setStatusNotice(null);
        onLogin(profileData);
        onClose();

        showToast({
          title: 'Account Created',
          message: `Welcome, ${profileData.name}! Your sovereign reflection journey is ready.`,
          type: 'success',
        });
      } else {
        // Verification email fallback
        setStatusNotice({
          type: 'info',
          message:
            data.message ||
            'Verification email sent. Please check your inbox to confirm your account, then sign in.',
        });
      }
    } catch (err) {
      setStatusNotice({
        type: 'error',
        message: 'Error during signup: ' + err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setStatusNotice({
        type: 'error',
        message: 'Please enter your email address above to receive a password reset link.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recover',
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusNotice({ type: 'error', message: data.error || 'Failed to send recovery link.' });
      } else {
        setStatusNotice({
          type: 'info',
          message: data.message || 'Password reset link sent! Check your inbox to choose a new password.',
        });
      }
    } catch (err) {
      setStatusNotice({ type: 'error', message: 'Recovery request failed: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestChoice = () => {
    setEmail('');
    setPassword('');
    setName('');
    setStatusNotice(null);
    onSelectGuest();
    onClose();
    showToast({
      title: 'Guest Mode Active',
      message: 'Operating with ephemeral memory (up to 5 recent sessions).',
      type: 'info',
    });
  };

  const handleLogoutChoice = () => {
    setEmail('');
    setPassword('');
    setName('');
    setStatusNotice(null);
    onLogout();
    onClose();
    showToast({
      title: 'Signed Out',
      message: 'Account session disconnected. Returned to local guest mode.',
      type: 'info',
    });
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
              <p className="text-[11px] text-[#7d8799]">
                Choose how Metta handles your reflection history and session context
              </p>
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
        <div className="p-6 space-y-5">
          {/* Current Status Pill */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-[#21293a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentMode === 'authenticated'
                    ? 'bg-[#1b3829] text-[#7ec69d] border border-[#2e5d42]'
                    : 'bg-[#1c2230] text-[#939db2] border border-[#2d374d]'
                }`}
              >
                {currentMode === 'authenticated' ? '🌿' : '👤'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#f0f2f5]">
                    {currentMode === 'authenticated'
                      ? userProfile?.name || 'Authenticated User'
                      : 'Guest Mode'}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                      currentMode === 'authenticated'
                        ? 'bg-[#172c20] text-[#7ec69d] border border-[#2d5940]'
                        : 'bg-[#1c2331] text-[#9da6b9] border border-[#2e3a50]'
                    }`}
                  >
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
          <div
            className={`p-4 rounded-xl border transition ${
              currentMode === 'guest'
                ? 'bg-[#121926]/40 border-[#324564]'
                : 'bg-[#11141c] border-[#1d222e] hover:border-[#2a3449]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
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
              Completely private and ephemeral. Metta retains zero history, patterns, or data across sessions.
            </p>
            {currentMode !== 'guest' && (
              <button
                onClick={handleGuestChoice}
                className="w-full py-1.5 rounded-lg text-xs font-medium bg-[#161d2a] hover:bg-[#1e2738] text-[#c4cddc] border border-[#263247] transition cursor-pointer"
              >
                Switch to Guest Mode
              </button>
            )}
          </div>

          {/* Option 2: Email Account Authentication */}
          <div
            className={`p-4 rounded-xl border transition ${
              currentMode === 'authenticated'
                ? 'bg-[#13231a]/40 border-[#2b533b]'
                : 'bg-[#11141c] border-[#1d222e] hover:border-[#2a4635]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7ec69d]" />
                <h4 className="text-xs font-semibold text-[#f0f2f5]">
                  Email Account (Save Reflection History)
                </h4>
              </div>
              {currentMode === 'authenticated' && (
                <span className="text-[10px] text-[#7ec69d] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#808a9d] leading-relaxed mb-3">
              Stores your recurring decision themes, personal milestones, and up to 100 reflection sessions securely in your private cloud storage.
            </p>

            {/* Tab Switcher: Sign In vs Sign Up */}
            <div className="flex items-center p-1 rounded-xl bg-[#090b0f] border border-[#1a202c] mb-3.5">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setStatusNotice(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  authTab === 'signin'
                    ? 'bg-[#1b2b22] text-[#8dd4ac] shadow-sm border border-[#2b4d3a]'
                    : 'text-[#7e899b] hover:text-[#e4e7ee]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setStatusNotice(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  authTab === 'signup'
                    ? 'bg-[#1b2b22] text-[#8dd4ac] shadow-sm border border-[#2b4d3a]'
                    : 'text-[#7e899b] hover:text-[#e4e7ee]'
                }`}
              >
                Sign Up (New Account)
              </button>
            </div>

            {/* Notice / Alert Card */}
            {statusNotice && (
              <div
                className={`mb-3 p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                  statusNotice.type === 'error'
                    ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                    : statusNotice.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                    : 'bg-[#13202e] border-[#254261] text-[#93c5fd]'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <span className="leading-relaxed block">{statusNotice.message}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={authTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-3">
              {authTab === 'signup' && (
                <div>
                  <label className="text-[10px] text-[#8e98aa] block font-medium mb-1">
                    Your Name or Handle:
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#5e6678] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Guru"
                      className="w-full bg-[#0c0e14] border border-[#212736] focus:border-[#385c49] focus:ring-1 focus:ring-[#385c49] rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-[#f0f2f5] placeholder-[#555d6e] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-[#8e98aa] block font-medium mb-1">Email Address:</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#5e6678] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#0c0e14] border border-[#212736] focus:border-[#385c49] focus:ring-1 focus:ring-[#385c49] rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-[#f0f2f5] placeholder-[#555d6e] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[#8e98aa] block font-medium">Password:</label>
                  {authTab === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isSubmitting}
                      className="text-[10px] text-[#717b8f] hover:text-[#95d5b2] transition underline underline-offset-2"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#5e6678] absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authTab === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
                    className="w-full bg-[#0c0e14] border border-[#212736] focus:border-[#385c49] focus:ring-1 focus:ring-[#385c49] rounded-lg pl-8.5 pr-9 py-1.5 text-xs text-[#f0f2f5] placeholder-[#555d6e] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#5e6678] hover:text-[#a5b2c7] transition"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1c392b] to-[#254b38] hover:from-[#234736] hover:to-[#2e5d46] text-[#bbf7d0] border border-[#3b7454] flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : authTab === 'signin' ? (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Email</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account with Verification</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Privacy & Data Sovereignty */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[#0e1118] border border-[#1b202e] text-[11px] text-[#6d778a]">
            <ShieldCheck className="w-4 h-4 text-[#5e9e7b] shrink-0 mt-0.5" />
            <p>
              <strong>Data Sovereignty:</strong> You maintain complete ownership over your data. All records
              are safely kept in your private cloud storage and can be deleted at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
