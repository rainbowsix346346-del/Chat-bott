import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  Lock,
  MessageSquarePlus,
  Sliders,
  Download,
  Cloud,
  ChevronDown,
} from 'lucide-react';
import {
  Persona,
  ToneConfig,
  ChatSession,
  ChatMessage,
  EncryptionVaultState,
} from './types';
import { INITIAL_PERSONAS } from './data/personas';
import { buildSystemPrompt, TONE_DEFINITIONS } from './data/tones';
import { encryptText, decryptText } from './crypto/encryption';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { PersonaModal } from './components/PersonaModal';
import { ToneCustomizerModal } from './components/ToneCustomizerModal';
import { ExportModal } from './components/ExportModal';
import { EncryptionModal } from './components/EncryptionModal';
import { CloudSyncModal } from './components/CloudSyncModal';

const STORAGE_KEYS = {
  SESSIONS: 'persona_chat_sessions_v1',
  PERSONAS: 'persona_chat_custom_personas_v1',
  ACTIVE_ID: 'persona_chat_active_session_id',
  VAULT_STATE: 'persona_chat_vault_state',
  AUTO_SYNC: 'persona_chat_auto_sync',
};

export default function App() {
  // Personas
  const [personas, setPersonas] = useState<Persona[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERSONAS);
      if (saved) {
        const custom = JSON.parse(saved);
        return [...INITIAL_PERSONAS, ...custom];
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PERSONAS;
  });

  // Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial session
    const initialPersona = INITIAL_PERSONAS[0];
    return [
      {
        id: `session_${Date.now()}`,
        title: 'گفتگوی نخست با ' + initialPersona.name,
        personaId: initialPersona.id,
        toneConfig: { ...initialPersona.defaultTone },
        messages: [
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: `درود و خیرمقدم! من **${initialPersona.name}** (${initialPersona.title}) هستم.\n\nشما می‌توانید با من در هر زمینه‌ای گفتگو کنید، لحن پاسخگویی مرا بر اساس نیاز خود شخصی‌سازی نمایید، یا از منوی بالای صفحه شخصیت دیگری را برگزینید.\n\nتمام گفتگوهای ما با **رمزنگاری پیشرفته (AES-256)** و قابلیت **ذخیره در فضای ابری** ایمن‌سازی می‌شوند. چه پرسش یا موضوعی مد نظر دارید؟`,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEncrypted: false,
        cloudSyncedAt: null,
      },
    ];
  });

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
    return saved || (sessions[0]?.id ?? '');
  });

  // Vault / Encryption state
  const [vaultState, setVaultState] = useState<EncryptionVaultState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VAULT_STATE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      isVaultEnabled: false,
      isUnlocked: false,
      hasPassphrase: false,
    };
  });

  // In-memory encryption key / passphrase (not written plainly to localStorage for maximum security)
  const [vaultPassphrase, setVaultPassphrase] = useState<string>('');

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isToneModalOpen, setIsToneModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Cloud Sync
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Active session and persona objects
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activePersona =
    personas.find((p) => p.id === activeSession?.personaId) || personas[0] || INITIAL_PERSONAS[0];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VAULT_STATE, JSON.stringify(vaultState));
  }, [vaultState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, JSON.stringify(autoSync));
  }, [autoSync]);

  // Scroll to bottom when messages or streaming change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, streamingContent]);

  // Sync to Cloud
  const syncSessionsToCloud = async (currentSessions: ChatSession[] = sessions) => {
    setIsCloudSyncing(true);
    try {
      const response = await fetch('/api/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessions: currentSessions,
          vaultMeta: {
            hasPassphrase: vaultState.hasPassphrase,
            sessionCount: currentSessions.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.statusText}`);
      }

      const data = await response.json();
      setLastSyncedTime(data.updatedAt || new Date().toISOString());

      // Update cloudSyncedAt on sessions
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          cloudSyncedAt: new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error('Cloud sync error:', err);
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Restore from Cloud
  const restoreSessionsFromCloud = async () => {
    setIsCloudSyncing(true);
    try {
      const response = await fetch('/api/cloud/chats');
      if (!response.ok) throw new Error('خطا در بارگذاری اطلاعات از فضای ابری');
      const data = await response.json();
      if (data.sessions && Array.isArray(data.sessions) && data.sessions.length > 0) {
        setSessions(data.sessions);
        setActiveSessionId(data.sessions[0].id);
        setLastSyncedTime(data.updatedAt || new Date().toISOString());
      }
    } catch (err) {
      console.error('Cloud restore error:', err);
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Create new Chat Session
  const handleNewSession = (targetPersona: Persona = activePersona) => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `گفتگو با ${targetPersona.name}`,
      personaId: targetPersona.id,
      toneConfig: { ...targetPersona.defaultTone },
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEncrypted: vaultState.hasPassphrase,
      cloudSyncedAt: null,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete Session
  const handleDeleteSession = async (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);

    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        handleNewSession(activePersona);
      }
    }

    try {
      await fetch(`/api/cloud/chats/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Cloud delete failed', e);
    }
  };

  // Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
    );
  };

  // Toggle Pin Session
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Switch Active Persona for current session or create new
  const handleSelectPersona = (selected: Persona) => {
    if (!activeSession || activeSession.messages.length > 0) {
      // Create new session for this persona to give clean context
      handleNewSession(selected);
    } else {
      // Empty session: switch persona in place
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                personaId: selected.id,
                title: `گفتگو با ${selected.name}`,
                toneConfig: { ...selected.defaultTone },
              }
            : s
        )
      );
    }
  };

  // Update Tone Configuration
  const handleSaveToneConfig = (newToneConfig: ToneConfig) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              toneConfig: newToneConfig,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  // Toggle Encryption for Current Session
  const handleToggleSessionEncryption = () => {
    if (!vaultState.hasPassphrase) {
      setIsEncryptionModalOpen(true);
      return;
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              isEncrypted: !s.isEncrypted,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  // Set Passphrase in Vault
  const handleSetPassphrase = (passphrase: string) => {
    setVaultPassphrase(passphrase);
    setVaultState({
      isVaultEnabled: true,
      isUnlocked: true,
      hasPassphrase: true,
      lastEncryptedAt: new Date().toISOString(),
    });

    // Mark current session as encrypted
    if (activeSession) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, isEncrypted: true } : s
        )
      );
    }
  };

  // Clear Passphrase
  const handleClearPassphrase = () => {
    setVaultPassphrase('');
    setVaultState({
      isVaultEnabled: false,
      isUnlocked: false,
      hasPassphrase: false,
    });
  };

  // Custom Persona Management
  const handleCreateCustomPersona = (newPersona: Persona) => {
    const updated = [...personas, newPersona];
    setPersonas(updated);
    const customOnly = updated.filter((p) => p.isCustom);
    localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(customOnly));
  };

  const handleDeleteCustomPersona = (id: string) => {
    const updated = personas.filter((p) => p.id !== id);
    setPersonas(updated);
    const customOnly = updated.filter((p) => p.isCustom);
    localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(customOnly));
  };

  // Send Message & Stream Response
  const handleSendMessage = async (textToSend: string = input) => {
    const query = textToSend.trim();
    if (!query || isLoading || !activeSession) return;

    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Encrypt content if session encryption is enabled and passphrase is available
    let encryptedMeta;
    if (activeSession.isEncrypted && vaultPassphrase) {
      try {
        const enc = await encryptText(query, vaultPassphrase);
        encryptedMeta = enc;
      } catch (err) {
        console.error('Encryption error:', err);
      }
    }

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      isEncrypted: activeSession.isEncrypted,
      encryptedData: encryptedMeta,
    };

    // Append user message immediately
    const updatedMessages = [...activeSession.messages, userMessage];

    // Generate smart title if it's the first user message
    const isFirstUserMessage = activeSession.messages.filter((m) => m.role === 'user').length === 0;
    const sessionTitle = isFirstUserMessage
      ? query.slice(0, 32) + (query.length > 32 ? '...' : '')
      : activeSession.title;

    const updatedSession: ChatSession = {
      ...activeSession,
      title: sessionTitle,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updatedSession : s)));

    // Prepare system instruction and contents for Gemini API
    const systemInstruction = buildSystemPrompt(activePersona, activeSession.toneConfig);

    // Abort controller setup
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: systemInstruction,
          temperature: activeSession.toneConfig.creativity,
          model: 'gemini-3.8-flash',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `خطای سرور: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('پاسخ جریان داده قابل خواندن نیست.');

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        const lines = textChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.chunk) {
                accumulatedText += data.chunk;
                setStreamingContent(accumulatedText);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Ignore non-json chunks
            }
          }
        }
      }

      // Final assistant message
      if (accumulatedText.trim()) {
        const assistantMessage: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'assistant',
          content: accumulatedText,
          timestamp: new Date().toISOString(),
          isEncrypted: activeSession.isEncrypted,
        };

        const finalSession: ChatSession = {
          ...updatedSession,
          messages: [...updatedMessages, assistantMessage],
          updatedAt: new Date().toISOString(),
        };

        setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? finalSession : s)));

        // Auto-sync to cloud if enabled
        if (autoSync) {
          syncSessionsToCloud(
            sessions.map((s) => (s.id === activeSession.id ? finalSession : s))
          ).catch((e) => console.warn('Auto-sync notice:', e));
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('User stopped generation');
        if (streamingContent.trim()) {
          const interruptedMsg: ChatMessage = {
            id: `msg_ai_${Date.now()}`,
            role: 'assistant',
            content: streamingContent + ' _(تولید پاسخ متوقف شد)_',
            timestamp: new Date().toISOString(),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSession.id
                ? { ...s, messages: [...updatedMessages, interruptedMsg] }
                : s
            )
          );
        }
      } else {
        console.error('Chat generation error:', err);
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **خطا در دریافت پاسخ:**\n${err.message || 'مشکلی در برقراری ارتباط با مدل رخ داد.'}`,
          timestamp: new Date().toISOString(),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? { ...s, messages: [...updatedMessages, errorMsg] }
              : s
          )
        );
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const currentTone = TONE_DEFINITIONS[activeSession?.toneConfig.style] || TONE_DEFINITIONS.formal;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-850 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setIsSidebarOpen(false);
        }}
        onNewSession={() => handleNewSession(activePersona)}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        personas={personas}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onOpenEncryptionModal={() => setIsEncryptionModalOpen(true)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        vaultState={vaultState}
        isCloudSyncing={isCloudSyncing}
      />

      {/* Main Chat View Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-900/50 relative">
        {/* Header */}
        <ChatHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activePersona={activePersona}
          toneConfig={activeSession?.toneConfig || activePersona.defaultTone}
          onOpenToneModal={() => setIsToneModalOpen(true)}
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
          onOpenEncryptionModal={() => setIsEncryptionModalOpen(true)}
          isEncrypted={activeSession?.isEncrypted || false}
          onToggleEncryption={handleToggleSessionEncryption}
          isCloudSyncing={isCloudSyncing}
          onCloudSyncNow={() => syncSessionsToCloud()}
        />

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-2">
          <div className="w-full max-w-4xl mx-auto">
            {activeSession?.messages.length === 0 ? (
              /* Welcome / Empty Conversation Hero Card */
              <div className="py-8 sm:py-14 text-center flex flex-col items-center justify-center max-w-xl mx-auto animate-fade-in">
                {/* Persona Avatar */}
                <div
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${activePersona.color} flex items-center justify-center text-4xl sm:text-5xl text-white shadow-lg shadow-indigo-100 dark:shadow-none mb-4`}
                >
                  {activePersona.avatar}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                  گفتگو با {activePersona.name}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                  {activePersona.title}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 px-4">
                  {activePersona.description}
                </p>

                {/* Badges Info */}
                <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
                  <button
                    onClick={() => setIsToneModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    <span>لحن:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentTone.label}</span>
                  </button>

                  <button
                    onClick={handleToggleSessionEncryption}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      activeSession?.isEncrypted
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {activeSession?.isEncrypted ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Shield className="w-3.5 h-3.5" />
                    )}
                    <span>{activeSession?.isEncrypted ? 'رمزنگاری AES فعال' : 'رمزنگاری خاموش'}</span>
                  </button>
                </div>

                {/* Sample Starter Prompts */}
                {activePersona.samplePrompts.length > 0 && (
                  <div className="w-full text-right">
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-2">
                      پرسش‌های پیشنهادی برای شروع:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activePersona.samplePrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt)}
                          className="p-3 text-right rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group"
                        >
                          <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
                            {prompt}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Message Thread */
              activeSession.messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  persona={activePersona}
                />
              ))
            )}

            {/* Live Streaming Message chunk */}
            {isLoading && streamingContent && (
              <MessageItem
                message={{
                  id: 'streaming_msg',
                  role: 'assistant',
                  content: streamingContent,
                  timestamp: new Date().toISOString(),
                }}
                persona={activePersona}
                isStreaming={true}
              />
            )}

            {/* Loading indicator when waiting for first chunk */}
            {isLoading && !streamingContent && (
              <div className="flex items-center gap-3 my-4">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${activePersona.color} flex items-center justify-center text-lg text-white shadow-xs animate-pulse`}
                >
                  {activePersona.avatar}
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    «{activePersona.name}» در حال تفکر و نگارش پاسخ...
                  </span>
                  <div className="flex items-center gap-1 mr-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          onStop={handleStopGeneration}
          isLoading={isLoading}
          activePersona={activePersona}
          toneConfig={activeSession?.toneConfig || activePersona.defaultTone}
          onOpenToneModal={() => setIsToneModalOpen(true)}
          isEncrypted={activeSession?.isEncrypted || false}
        />
      </main>

      {/* Modals */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        personas={personas}
        activePersonaId={activePersona.id}
        onSelectPersona={handleSelectPersona}
        onCreateCustomPersona={handleCreateCustomPersona}
        onDeleteCustomPersona={handleDeleteCustomPersona}
      />

      <ToneCustomizerModal
        isOpen={isToneModalOpen}
        onClose={() => setIsToneModalOpen(false)}
        activePersona={activePersona}
        currentToneConfig={activeSession?.toneConfig || activePersona.defaultTone}
        onSaveToneConfig={handleSaveToneConfig}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        session={activeSession}
        persona={activePersona}
        vaultPassphrase={vaultPassphrase}
      />

      <EncryptionModal
        isOpen={isEncryptionModalOpen}
        onClose={() => setIsEncryptionModalOpen(false)}
        vaultState={vaultState}
        onSetPassphrase={handleSetPassphrase}
        onClearPassphrase={handleClearPassphrase}
        onImportVaultSession={(importedSession) => {
          setSessions((prev) => [importedSession, ...prev]);
          setActiveSessionId(importedSession.id);
          setIsEncryptionModalOpen(false);
        }}
      />

      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        sessions={sessions}
        onSyncToCloud={syncSessionsToCloud}
        onRestoreFromCloud={restoreSessionsFromCloud}
        isSyncing={isCloudSyncing}
        lastSyncedTime={lastSyncedTime}
        autoSync={autoSync}
        onToggleAutoSync={setAutoSync}
        isEncryptedVault={vaultState.hasPassphrase}
      />
    </div>
  );
}
