import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Volume2, VolumeX, ShieldCheck, User } from 'lucide-react';
import { ChatMessage, Persona } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  persona?: Persona;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, persona, isStreaming = false }) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = 'fa-IR';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group flex gap-3.5 my-4 transition-all duration-200 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg select-none shadow-sm transition-transform duration-200 ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-200 dark:shadow-none'
            : 'bg-gradient-to-tr ' +
              (persona?.color || 'from-emerald-500 to-teal-600') +
              ' text-white shadow-slate-200 dark:shadow-none ring-2 ring-white/20'
        }`}
      >
        {isUser ? <User className="w-5 h-5 text-white" /> : persona?.avatar || '🤖'}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name & Time Header */}
        <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {isUser ? 'شما' : persona?.name || 'دستیار هوشمند'}
          </span>
          <span>•</span>
          <span className="tabular-nums">{formattedTime}</span>
          {message.isEncrypted && (
            <span
              title="این پیام با کلید امنیتی AES-256 رمزنگاری شده است"
              className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>رمزنگاری امن</span>
            </span>
          )}
        </div>

        {/* Message Bubble Body */}
        <div
          className={`relative px-4 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-xs transition-colors ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap select-text break-words font-normal">{message.content}</p>
          ) : (
            <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-right">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    return isInline ? (
                      <code
                        className="px-1.5 py-0.5 mx-1 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="relative my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 dir-ltr text-left">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
                          <span className="font-mono">{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(String(children))}
                            className="hover:text-white transition-colors cursor-pointer text-[11px]"
                          >
                            کپی کد
                          </button>
                        </div>
                        <pre className="p-3 text-xs font-mono overflow-x-auto">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-inside space-y-1 my-2 pr-2">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside space-y-1 my-2 pr-2">{children}</ol>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse align-middle mr-1 rounded-xs" />
              )}
            </div>
          )}
        </div>

        {/* Action Toolbar on Hover */}
        {!isStreaming && (
          <div
            className={`flex items-center gap-1.5 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <button
              onClick={handleCopy}
              title="کپی پیام"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-500 font-medium">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">کپی</span>
                </>
              )}
            </button>

            {!isUser && 'speechSynthesis' in window && (
              <button
                onClick={handleSpeak}
                title={isPlayingAudio ? 'توقف خواندن' : 'خواندن صوتی متن'}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span className="text-[11px] text-amber-500">توقف</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">شنیدن</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
