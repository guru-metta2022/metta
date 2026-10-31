import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Sparkles,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

const ToastDialogContext = createContext(null);

export function useAppDialog() {
  const ctx = useContext(ToastDialogContext);
  if (!ctx) {
    throw new Error('useAppDialog must be used within ToastDialogProvider');
  }
  return ctx;
}

export function ToastDialogProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialogState, setDialogState] = useState(null); // { isOpen, isConfirm, title, message, confirmText, cancelText, danger, type, resolve }

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (param1, param2) => {
      let toastObj = {};
      if (typeof param1 === 'string') {
        toastObj = { message: param1, type: param2 || 'info', title: '' };
      } else if (param1 && typeof param1 === 'object') {
        toastObj = {
          title: param1.title || '',
          message: param1.message || '',
          type: param1.type || 'info',
          duration: param1.duration || 3500,
          action: param1.action || null,
        };
      }

      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const duration = toastObj.duration || 3500;

      const newToast = { ...toastObj, id };
      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  // --------------------------------------------------------------------------
  // MESSAGE BOX & CONFIRM DIALOGS
  // --------------------------------------------------------------------------
  const showAlert = useCallback(({ title = 'Notice', message = '', buttonText = 'Acknowledge', type = 'info' } = {}) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        isConfirm: false,
        title,
        message,
        confirmText: buttonText,
        type,
        danger: type === 'error',
        resolve: () => {
          setDialogState(null);
          resolve();
        },
      });
    });
  }, []);

  const showConfirm = useCallback(
    ({
      title = 'Confirm Action',
      message = 'Are you sure you wish to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      danger = false,
      type = danger ? 'error' : 'warning',
    } = {}) => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          isConfirm: true,
          title,
          message,
          confirmText,
          cancelText,
          danger,
          type,
          resolve: (val) => {
            setDialogState(null);
            resolve(val);
          },
        });
      });
    },
    []
  );

  // Keyboard navigation for dialogs (Enter to confirm, Escape to cancel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!dialogState?.isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (dialogState.isConfirm) {
          dialogState.resolve(false);
        } else {
          dialogState.resolve();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (dialogState.isConfirm) {
          dialogState.resolve(true);
        } else {
          dialogState.resolve();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState]);

  // Hook into window.alert so even third-party or legacy browser alerts use glassy theme
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      showAlert({
        title: 'Application Notice',
        message: String(msg),
        type: 'info',
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  return (
    <ToastDialogContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}

      {/* Glassy Floating Toast Stack Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none sm:max-w-md px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <GlassyToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Glassy Modal Dialog (Alert & Confirm) */}
      {dialogState?.isOpen && (
        <GlassyDialogOverlay state={dialogState} />
      )}
    </ToastDialogContext.Provider>
  );
}

// ============================================================================
// Glassy Toast Item Component
// ============================================================================
function GlassyToastItem({ toast, onDismiss }) {
  const { title, message, type, action } = toast;

  let icon = <Info className="w-4 h-4 text-[#7ec69d]" />;
  let accentBorder = 'border-[#232c3f]/80';
  let accentGlow = 'shadow-black/70';
  let badgeBg = 'bg-[#121c17] text-[#95d5b2] border-[#294c39]';

  if (type === 'success') {
    icon = <CheckCircle2 className="w-4 h-4 text-[#52b788]" />;
    accentBorder = 'border-emerald-500/40';
    accentGlow = 'shadow-emerald-950/30';
    badgeBg = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
  } else if (type === 'error') {
    icon = <AlertCircle className="w-4 h-4 text-rose-400" />;
    accentBorder = 'border-rose-500/40';
    accentGlow = 'shadow-rose-950/30';
    badgeBg = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
  } else if (type === 'warning') {
    icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
    accentBorder = 'border-amber-500/40';
    accentGlow = 'shadow-amber-950/30';
    badgeBg = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
  } else if (type === 'ai') {
    icon = <Sparkles className="w-4 h-4 text-[#7ec69d]" />;
    accentBorder = 'border-[#3d6952]/70';
    accentGlow = 'shadow-emerald-950/30';
    badgeBg = 'bg-[#15231c] text-[#8dd4ac] border-[#2e5d42]';
  }

  return (
    <div
      role="status"
      className={`pointer-events-auto backdrop-blur-2xl bg-[#0b0f16]/92 border ${accentBorder} shadow-2xl ${accentGlow} rounded-2xl p-4 flex items-start gap-3 transition-all duration-300 animate-slide-in relative overflow-hidden group`}
    >
      {/* Top subtle glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7ec69d]/40 to-transparent" />

      <div className={`p-1.5 rounded-xl border shrink-0 ${badgeBg}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className="text-xs font-semibold text-[#f0f2f5] leading-snug">
            {title}
          </h4>
        )}
        <p className="text-xs text-[#9aa4b7] leading-relaxed mt-0.5 break-words">
          {message}
        </p>
        {action && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => {
                if (action.onClick) action.onClick();
                onDismiss();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-[#182a20] text-[#93dfb4] border border-[#2e5d42] hover:bg-[#203a2c] hover:border-[#3c7855] transition shadow-xs cursor-pointer"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-lg text-[#616c80] hover:text-[#e2e8f0] hover:bg-[#1a2230] transition shrink-0"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ============================================================================
// Glassy Message Box & Confirmation Dialog Overlay
// ============================================================================
function GlassyDialogOverlay({ state }) {
  const { isConfirm, title, message, confirmText, cancelText, danger, type, resolve } = state;

  let icon = <Info className="w-5 h-5 text-[#7ec69d]" />;
  let headerGlow = 'from-[#52b788]/40 via-teal-500/50 to-[#52b788]/40';
  let badgeColor = 'bg-[#14231b] border-[#2d523e] text-[#86e2ad]';

  if (danger || type === 'error') {
    icon = <ShieldAlert className="w-5 h-5 text-rose-400" />;
    headerGlow = 'from-rose-500/40 via-rose-600/50 to-rose-500/40';
    badgeColor = 'bg-rose-950/70 border-rose-500/40 text-rose-400';
  } else if (type === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
    headerGlow = 'from-amber-500/40 via-amber-600/50 to-amber-500/40';
    badgeColor = 'bg-amber-950/70 border-amber-500/40 text-amber-400';
  } else if (type === 'question') {
    icon = <HelpCircle className="w-5 h-5 text-[#86e2ad]" />;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isConfirm) resolve(false);
          else resolve();
        }
      }}
    >
      <div className="relative max-w-md w-full backdrop-blur-2xl bg-[#0c1017]/95 border border-[#222a3d]/90 rounded-2xl shadow-2xl shadow-black/90 p-6 overflow-hidden animate-scale-in">
        {/* Top glassy chromatic accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${headerGlow}`} />

        <div className="flex items-start gap-3.5">
          <div className={`p-2 rounded-xl border shrink-0 ${badgeColor}`}>
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#f0f2f5] tracking-tight leading-snug">
              {title}
            </h3>
            <div className="mt-2 text-xs text-[#9ba6ba] leading-relaxed whitespace-pre-line">
              {message}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#1c2433]">
          {isConfirm && (
            <button
              type="button"
              onClick={() => resolve(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#9ba6ba] hover:text-[#f0f2f5] bg-[#141a24] hover:bg-[#1d2534] border border-[#222c3d] transition"
            >
              {cancelText || 'Cancel'}
            </button>
          )}

          <button
            type="button"
            autoFocus
            onClick={() => resolve(isConfirm ? true : undefined)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md flex items-center gap-1.5 ${
              danger
                ? 'bg-rose-900/90 hover:bg-rose-800 border border-rose-500/60 text-white shadow-rose-950/50'
                : 'bg-gradient-to-r from-[#2d6a4f] to-[#40916c] hover:brightness-110 border border-[#52b788]/40 text-[#f0fdf4] shadow-emerald-950/50'
            }`}
          >
            {confirmText || (isConfirm ? 'Confirm' : 'Acknowledge')}
          </button>
        </div>
      </div>
    </div>
  );
}
