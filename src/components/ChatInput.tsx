import React, { useRef, useEffect } from 'react';
import { Send, Square, Sliders, Shield, Sparkles } from 'lucide-react';
import { Persona, ToneConfig } from '../types';
import { TONE_DEFINITIONS } from '../data/tones';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  activePersona: Persona;
  toneConfig: ToneConfig;
  onOpenToneModal: () => void;
  isEncrypted: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  activePersona,
  toneConfig,
  onOpenToneModal,
  isEncrypted,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  const currentTone = TONE_DEFINITIONS[toneConfig.style] || TONE_DEFINITIONS.formal;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4 pt-2">
      {/* Sub-bar: active tone & encryption status */}
      <div className="flex items-center justify-between px-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenToneModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
            title="شخصی‌سازی لحن و سبک پاسخگویی این شخصیت"
          >
            <Sliders className="w-3 h-3 text-indigo-500" />
            <span>لحن:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentTone.label}</span>
          </button>

          {isEncrypted && (
            <span
              title="داده‌های این گفتگو با الگوریتم AES-GCM 256-bit رمزنگاری می‌شوند"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60"
            >
              <Shield className="w-3 h-3" />
              <span>رمزنگاری محافظت‌شده</span>
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
          <span>ارسال با</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Enter
          </kbd>
        </div>
      </div>

      {/* Main Input Box */}
      <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`پیامی برای «${activePersona.name}» بنویسید...`}
          rows={1}
          className="w-full px-4 pt-3.5 pb-12 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none outline-hidden text-[15px] leading-relaxed max-h-[180px]"
        />

        {/* Bottom Actions Bar inside input */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1 pointer-events-auto text-slate-400 text-xs px-2">
            <span className="text-[11px] select-none">{input.length > 0 ? `${input.length} نویسه` : ''}</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {isLoading ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
                title="توقف تولید پاسخ"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>توقف</span>
              </button>
            ) : (
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                  input.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none scale-100 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed scale-95 opacity-60'
                }`}
                title="ارسال پیام"
              >
                <Send className="w-4 h-4 transform rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
