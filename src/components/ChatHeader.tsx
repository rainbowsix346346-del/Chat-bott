import React from 'react';
import {
  Menu,
  Sliders,
  Download,
  Shield,
  ShieldCheck,
  Cloud,
  CloudUpload,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Persona, ToneConfig } from '../types';
import { TONE_DEFINITIONS } from '../data/tones';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  activePersona: Persona;
  toneConfig: ToneConfig;
  onOpenToneModal: () => void;
  onOpenPersonaModal: () => void;
  onOpenExportModal: () => void;
  onOpenCloudModal: () => void;
  onOpenEncryptionModal: () => void;
  isEncrypted: boolean;
  onToggleEncryption: () => void;
  isCloudSyncing: boolean;
  onCloudSyncNow: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleSidebar,
  activePersona,
  toneConfig,
  onOpenToneModal,
  onOpenPersonaModal,
  onOpenExportModal,
  onOpenCloudModal,
  onOpenEncryptionModal,
  isEncrypted,
  onToggleEncryption,
  isCloudSyncing,
  onCloudSyncNow,
}) => {
  const currentTone = TONE_DEFINITIONS[toneConfig.style] || TONE_DEFINITIONS.formal;

  return (
    <header className="shrink-0 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-10">
      {/* Left: Mobile menu toggle + Active Persona Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -mr-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
          title="باز کردن منو"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenPersonaModal}
          className="flex items-center gap-2.5 text-right p-1.5 -m-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
          title="تغییر یا مشاهده شخصیت"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activePersona.color} flex items-center justify-center text-xl text-white shadow-xs select-none transition-transform group-hover:scale-105`}
          >
            {activePersona.avatar}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-850 dark:text-slate-100">{activePersona.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                {activePersona.title}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-xs">
              {activePersona.specialty.slice(0, 2).join(' • ')}
            </span>
          </div>
        </button>
      </div>

      {/* Right: Actions toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Tone selector badge */}
        <button
          onClick={onOpenToneModal}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer"
          title="شخصی‌سازی لحن"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          <span>لحن:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentTone.label}</span>
        </button>

        {/* Change Persona button */}
        <button
          onClick={onOpenPersonaModal}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
          title="تعویض شخصیت هوش مصنوعی"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">شخصیت‌ها</span>
        </button>

        {/* Encryption toggle badge */}
        <button
          onClick={onToggleEncryption}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
            isEncrypted
              ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title={isEncrypted ? 'رمزنگاری AES-256 فعال است' : 'رمزنگاری برای این گفتگو غیرفعال است (کلیک کنید تا فعال شود)'}
        >
          {isEncrypted ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="hidden sm:inline">{isEncrypted ? 'رمزنگاری امن' : 'رمزنگاری'}</span>
        </button>

        {/* Cloud Sync trigger */}
        <button
          onClick={onCloudSyncNow}
          className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-medium border border-sky-200/60 dark:border-sky-800/60 transition-colors"
          title="همگام‌سازی ابری تاریخچه"
        >
          <Cloud className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin text-sky-600' : ''}`} />
          <span className="hidden sm:inline">{isCloudSyncing ? 'در حال سینک...' : 'ابر'}</span>
        </button>

        {/* Export chat button */}
        <button
          onClick={onOpenExportModal}
          className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200/80 dark:border-slate-700 transition-colors"
          title="خروجی گرفتن از گفتگو (Markdown, JSON, PDF, TXT, AES)"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">خروجی</span>
        </button>
      </div>
    </header>
  );
};
