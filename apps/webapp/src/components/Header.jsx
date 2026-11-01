import React from 'react';
import { Shield, Network, Sparkles, Settings, User, Brain, PanelLeft, MessageSquare, Activity, Compass } from 'lucide-react';

export default function Header({
  onOpenPrecepts,
  onOpenGraph,
  onOpenMeditate,
  onOpenSettings,
  onOpenFramework,
  isMeditating,
  identityMode = 'guest',
  userProfile = null,
  onOpenAuthModal,
  onOpenUserGraph,
  onToggleSidebar,
  sidebarOpen = false,
  activeView = 'chat',
  onChangeView,
}) {
  return (
    <header className="border-b border-[#1c2028] bg-[#0c0d10]/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between transition-all gap-2">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-[#8891a1] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#1f242e] transition"
          title={sidebarOpen ? "Hide chat history" : "Show chat history"}
        >
          <PanelLeft className="w-4 h-4 text-[#7ec69d]" />
        </button>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#1b2b23] to-[#2b4437] border border-[#3b5e4c]/50 flex items-center justify-center shadow-inner shrink-0">
          <span className="text-base sm:text-lg">🌿</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold tracking-wide text-[#f0f2f5]">METTA</h1>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-[#17241e] text-[#7ec69d] border border-[#2b4437] hidden xs:inline-block">
              Decision Safety
            </span>
          </div>
          <p className="text-[11px] text-[#8c929e] hidden lg:block">
            Thoughtful Decision & Reflection Layer • Respect for All Life
          </p>
        </div>
      </div>

      {/* Center View Mode Switcher: Dialogue vs Simulation Lab */}
      <div className="flex items-center p-1 rounded-xl bg-[#080b0f] border border-[#1d232f] shadow-inner">
        <button
          type="button"
          onClick={() => onChangeView?.('chat')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition ${
            activeView === 'chat'
              ? 'bg-[#18202c] text-[#f0f2f5] shadow-xs'
              : 'text-[#7d889b] hover:text-[#c4cbda]'
          }`}
          title="Interactive dialogue and conversational reflection"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#5e9e7b]" />
          <span className="hidden sm:inline">Dialogue</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView?.('simulation')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition ${
            activeView === 'simulation'
              ? 'bg-[#15291e] text-[#86e2ad] border border-[#2d523e] shadow-xs'
              : 'text-[#7d889b] hover:text-[#c4cbda]'
          }`}
          title="Explore an advisory review using the configured decision service"
        >
          <Activity className="w-3.5 h-3.5 text-[#7ec69d]" />
          <span>Simulation Lab</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Identity Pill (Guest vs Authenticated) */}
        {identityMode === 'authenticated' ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenUserGraph}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#7ec69d] bg-[#14261c] hover:bg-[#1b3426] border border-[#2a543b] transition shadow-sm"
              title="View your reflection journey and insights"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden md:inline">My Journey</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#c0c7d4] hover:text-[#f0f2f5] hover:bg-[#181d28] border border-[#232b3b] transition"
              title="Session & Account Settings"
            >
              <span className="w-2 h-2 rounded-full bg-[#48d689]" />
              <span className="max-w-[80px] sm:max-w-[110px] truncate">{userProfile?.name || 'Account'}</span>
              <span className="text-[10px] font-mono uppercase text-[#34d399] px-1.5 py-0.5 rounded bg-[#102419] border border-[#1b3d2b] hidden sm:inline">{userProfile?.tier || 'standard'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#9da6b7] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#222836] transition"
            title="Session mode (Guest or Account)"
          >
            <User className="w-3.5 h-3.5 text-[#7c889f]" />
            <span className="hidden sm:inline">Guest Mode</span>
          </button>
        )}

        <button
          onClick={onOpenFramework}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#b0b6c2] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#1f242e] transition"
          title="Reflection, Decision & Resolution Framework Reference"
        >
          <Compass className="w-3.5 h-3.5 text-[#7ec69d]" />
          <span className="hidden xl:inline">Framework</span>
        </button>

        <button
          onClick={onOpenPrecepts}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#b0b6c2] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#1f242e] transition"
          title="Core AI Principles"
        >
          <Shield className="w-3.5 h-3.5 text-[#5e9e7b]" />
          <span className="hidden xl:inline">AI Principles</span>
        </button>

        <button
          onClick={onOpenGraph}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#b0b6c2] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#1f242e] transition"
          title="Decision & Resolution Framework"
        >
          <Network className="w-3.5 h-3.5 text-[#6c8eb5]" />
          <span className="hidden xl:inline">Resolution Map</span>
        </button>

        <button
          onClick={onOpenMeditate}
          disabled={isMeditating}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
            isMeditating
              ? 'bg-[#1b2533] text-[#7fa7d9] border border-[#2d425e]'
              : 'bg-[#1a2e24] hover:bg-[#223d30] text-[#8dd4ac] border border-[#355d48]'
          }`}
          title="Clear current session and start fresh"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isMeditating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isMeditating ? 'Resetting...' : 'Start Fresh'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-[#8891a1] hover:text-[#f0f2f5] hover:bg-[#181c24] border border-[#1f242e] transition"
          title="AI Model & Gateway Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
