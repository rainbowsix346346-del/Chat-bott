import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Lock,
  Unlock,
  Cloud,
  CloudCheck,
  Search,
  Pin,
  Edit2,
  Check,
  X,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { ChatSession, Persona, EncryptionVaultState } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  personas: Persona[];
  onOpenPersonaModal: () => void;
  onOpenEncryptionModal: () => void;
  onOpenCloudModal: () => void;
  vaultState: EncryptionVaultState;
  isCloudSyncing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  personas,
  onOpenPersonaModal,
  onOpenEncryptionModal,
  onOpenCloudModal,
  vaultState,
  isCloudSyncing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = s.title.toLowerCase().includes(query);
    const persona = personas.find((p) => p.id === s.personaId);
    const matchesPersona = persona ? persona.name.toLowerCase().includes(query) : false;
    return matchesTitle || matchesPersona;
  });

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const regularSessions = filteredSessions.filter((s) => !s.isPinned);

  const startEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(s.id);
    setEditTitle(s.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const persona = personas.find((p) => p.id === session.personaId);
    const isEditing = editingSessionId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => onSelectSession(session.id)}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-sm ${
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-medium border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <span className="text-base shrink-0 select-none">{persona?.avatar || '💬'}</span>

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-indigo-400 rounded outline-hidden"
              />
              <button
                onClick={(e) => saveEditing(session.id, e)}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={cancelEditing} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs sm:text-[13px]">{session.title}</span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="truncate max-w-[90px]">{persona?.name || 'چت'}</span>
                <span>•</span>
                <span>{session.messages.length} پیام</span>
                {session.isEncrypted && (
                  <span title="رمزنگاری‌شده با AES-256">
                    <Shield className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  </span>
                )}
                {session.cloudSyncedAt && (
                  <span title="همگام با فضای ابری">
                    <Cloud className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-1 text-slate-400 shrink-0 mr-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              className={`p-1 rounded hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 ${
                session.isPinned ? 'text-indigo-600' : ''
              }`}
              title={session.isPinned ? 'برداشتن پین' : 'پین کردن گفتگو'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => startEditing(session, e)}
              className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
              title="تغییر عنوان"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('آیا از حذف این گفتگو اطمینان دارید؟')) {
                  onDeleteSession(session.id);
                }
              }}
              className="p-1 rounded hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800"
              title="حذف گفتگو"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 right-0 h-full w-72 sm:w-80 bg-slate-50 dark:bg-slate-900/90 border-l border-slate-200/80 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header with New Chat button */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">چت‌بات شخصیت‌ها</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>گفتگوی تازه</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در گفتگوها..."
              className="w-full text-xs pr-8 pl-3 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl placeholder:text-slate-400 text-slate-800 dark:text-slate-200 outline-hidden focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {pinnedSessions.length > 0 && (
            <div className="mb-3">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Pin className="w-3 h-3 text-indigo-500" />
                <span>پین‌شده‌ها</span>
              </div>
              <div className="space-y-1">{pinnedSessions.map(renderSessionItem)}</div>
            </div>
          )}

          <div>
            {pinnedSessions.length > 0 && regularSessions.length > 0 && (
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400">سایر گفتگوها</div>
            )}
            {regularSessions.length > 0 ? (
              <div className="space-y-1">{regularSessions.map(renderSessionItem)}</div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-1" />
                <span>هیچ گفتگویی یافت نشد</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer: Cloud sync & Security Vault status */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col gap-2 text-xs">
          {/* Persona selector quick button */}
          <button
            onClick={onOpenPersonaModal}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="font-medium">فهرست شخصیت‌ها</span>
            </div>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
              {personas.length}
            </span>
          </button>

          {/* Cloud Sync shortcut */}
          <button
            onClick={onOpenCloudModal}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cloud className={`w-4 h-4 ${isCloudSyncing ? 'text-sky-500 animate-spin' : 'text-sky-500'}`} />
              <span className="font-medium">فضای ابری</span>
            </div>
            <span className="text-[11px] text-sky-600 dark:text-sky-400">
              {isCloudSyncing ? 'در حال سینک...' : 'متصل'}
            </span>
          </button>

          {/* Encryption Vault shortcut */}
          <button
            onClick={onOpenEncryptionModal}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors ${
              vaultState.hasPassphrase
                ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {vaultState.hasPassphrase ? (
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Unlock className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-medium">گاوصندوق رمزنگاری</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                vaultState.hasPassphrase
                  ? 'bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {vaultState.hasPassphrase ? 'AES-256' : 'پیکربندی'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
