import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  MessageSquare,
  X,
  Clock,
  ShieldCheck,
  Check,
  Activity
} from 'lucide-react';
import { useAppDialog } from './ToastDialogContext';

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ChatSidebar({
  isOpen,
  onClose,
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onDeleteMultipleSessions,
  onClearAllSessions,
  identityMode = 'guest',
  userProfile = null,
  activeView = 'chat',
  onOpenSimulation,
}) {
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const { showConfirm, showToast } = useAppDialog();

  const maxSessions = identityMode === 'authenticated' ? 100 : 5;
  const count = sessions.length;

  const toggleSelectId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map((s) => s.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const num = selectedIds.size;
    const confirmed = await showConfirm({
      title: 'Delete Selected Sessions?',
      message: `Are you sure you want to delete ${num} selected chat session${num > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: `Delete ${num} Session${num > 1 ? 's' : ''}`,
      cancelText: 'Cancel',
      danger: true,
    });
    if (confirmed) {
      onDeleteMultipleSessions(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsMultiSelect(false);
      showToast({
        title: 'Sessions Removed',
        message: `${num} session${num > 1 ? 's have' : ' has'} been deleted.`,
        type: 'info',
      });
    }
  };

  const handleClearAll = async () => {
    if (sessions.length === 0) return;
    const confirmed = await showConfirm({
      title: 'Clear All Sessions?',
      message: `Are you sure you want to clear all ${sessions.length} chat session${sessions.length > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'Clear All Sessions',
      cancelText: 'Keep History',
      danger: true,
    });
    if (confirmed) {
      onClearAllSessions();
      setSelectedIds(new Set());
      setIsMultiSelect(false);
      showToast({
        title: 'History Cleared',
        message: 'All previous chat sessions have been released.',
        type: 'info',
      });
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-40 w-72 bg-[#0c0e13] border-r border-[#1c212c] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full md:hidden'
        }`}
      >
        {/* Top Header & Actions */}
        <div className="p-3.5 border-b border-[#1b202a] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#798394]">
              Chat History
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsMultiSelect(!isMultiSelect);
                  setSelectedIds(new Set());
                }}
                className={`p-1.5 rounded-lg text-xs transition ${
                  isMultiSelect
                    ? 'bg-[#1e2736] text-[#7ec69d]'
                    : 'text-[#6f7889] hover:text-[#e0e4ee] hover:bg-[#161a22]'
                }`}
                title={isMultiSelect ? 'Exit multi-select' : 'Multi-select sessions'}
              >
                {isMultiSelect ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#6f7889] hover:text-[#e0e4ee] hover:bg-[#161a22] transition md:hidden"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#14231b] to-[#1c3326] hover:from-[#1b3025] hover:to-[#244232] text-[#93dfb4] border border-[#2b543c] flex items-center justify-center gap-2 text-xs font-medium transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reflection</span>
          </button>

          {/* Simulation Lab Direct Access */}
          <button
            type="button"
            onClick={() => {
              onOpenSimulation?.();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full py-2 px-3 rounded-xl flex items-center justify-between text-xs font-medium transition border shadow-xs ${
              activeView === 'simulation'
                ? 'border-[#3b664e] bg-[#14261c] text-[#86e2ad]'
                : 'border-[#1f2533] bg-[#11141c] hover:bg-[#161b26] text-[#a1adbf]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#7ec69d]" />
              <span>Simulation Lab</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#17251e] text-[#7ec69d] border border-[#2b4437]">
              Sandbox
            </span>
          </button>

          {/* Quota & Storage Pill */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-[#11141c] border border-[#1d222e]">
            <span className="text-[#848d9f]">
              {identityMode === 'authenticated' ? 'Account History' : 'Guest History'}
            </span>
            <span className={`font-mono font-medium ${count >= maxSessions ? 'text-[#e07d7d]' : 'text-[#7ec69d]'}`}>
              {count} / {maxSessions}
            </span>
          </div>

          {/* Multi-Select Toolbar (when active) */}
          {isMultiSelect && (
            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] text-[#7ec69d] hover:underline"
              >
                {selectedIds.size === sessions.length ? 'Deselect All' : 'Select All'}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#697282]">{selectedIds.size} selected</span>
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={handleDeleteSelected}
                  className="px-2 py-0.5 rounded bg-[#2b1717] hover:bg-[#3d1c1c] text-[#fca5a5] border border-[#522525] text-[10px] font-medium transition disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-xs text-[#5d6575]">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-[#353b49]" />
              <p className="font-medium text-[#7d8799] mb-1">No saved sessions</p>
              <p className="text-[11px]">Inquiries and reflections will appear here as you chat.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isSelected = selectedIds.has(session.id);
              const isActive = currentSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (isMultiSelect) {
                      toggleSelectId(session.id);
                    } else {
                      onSelectSession(session.id);
                      if (window.innerWidth < 768) onClose();
                    }
                  }}
                  className={`group relative p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 text-xs ${
                    isActive
                      ? 'bg-[#15231c] border-[#2e543e] text-[#f0f2f5]'
                      : 'bg-[#101319] border-[#181d27] hover:bg-[#141822] hover:border-[#252c3c] text-[#a0a8b8]'
                  }`}
                >
                  {isMultiSelect ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectId(session.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 accent-[#34d399] rounded cursor-pointer"
                    />
                  ) : (
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isActive ? 'text-[#7ec69d]' : 'text-[#5d6677]'}`} />
                  )}

                  <div className="flex-1 min-w-0 pr-6">
                    <p className={`text-xs truncate font-medium ${isActive ? 'text-[#93dfb4]' : 'text-[#cbd2df]'}`}>
                      {session.title || 'Untitled Inquiry'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#697282]">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatRelativeTime(session.updatedAt || session.createdAt)}
                      </span>
                      <span>•</span>
                      <span>{session.messages?.length || 0} msgs</span>
                    </div>
                  </div>

                  {/* Single Delete Button */}
                  {!isMultiSelect && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const confirmed = await showConfirm({
                          title: 'Delete Session?',
                          message: `Delete "${session.title || 'Untitled Inquiry'}"?`,
                          confirmText: 'Delete Session',
                          cancelText: 'Cancel',
                          danger: true,
                        });
                        if (confirmed) {
                          onDeleteSession(session.id);
                          showToast({
                            title: 'Session Removed',
                            message: 'The selected chat session has been deleted.',
                            type: 'info',
                          });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#788295] hover:text-[#e06d6d] hover:bg-[#261818] transition absolute right-2 top-2.5"
                      title="Delete this session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Clear All & Privacy Note */}
        <div className="p-3 border-t border-[#1b202a] space-y-2">
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium text-[#9a6464] hover:text-[#f87171] hover:bg-[#211414] transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All Sessions</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-[#555d6e] px-1">
            <ShieldCheck className="w-3 h-3 text-[#5e9e7b] shrink-0" />
            <span>Stored isolated in your browser. Zero server load.</span>
          </div>
        </div>
      </aside>
    </>
  );
}
