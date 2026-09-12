import React, { useState } from 'react';
import {
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  Check,
  RefreshCw,
  Server,
  ShieldCheck,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { ChatSession } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSyncToCloud: () => Promise<void>;
  onRestoreFromCloud: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedTime: string | null;
  autoSync: boolean;
  onToggleAutoSync: (val: boolean) => void;
  isEncryptedVault: boolean;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSyncToCloud,
  onRestoreFromCloud,
  isSyncing,
  lastSyncedTime,
  autoSync,
  onToggleAutoSync,
  isEncryptedVault,
}) => {
  const [syncMessage, setSyncMessage] = useState('');

  if (!isOpen) return null;

  const handleManualSync = async () => {
    try {
      await onSyncToCloud();
      setSyncMessage('همگام‌سازی ابری با موفقیت به پایان رسید.');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (err: any) {
      setSyncMessage(`خطا در همگام‌سازی: ${err.message}`);
    }
  };

  const handleManualRestore = async () => {
    if (!confirm('آیا مایلید گفتگوها از سرور ابری بارگذاری و ادغام شوند؟')) return;
    try {
      await onRestoreFromCloud();
      setSyncMessage('تاریخچه با موفقیت از فضای ابری بازیابی شد.');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (err: any) {
      setSyncMessage(`خطا در بازیابی: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ذخیره‌سازی و همگام‌سازی در فضای ابری
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پشتیبان‌گیری امن و دسترسی به تاریخچه گفتگوها در هر دستگاه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Status Panel */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">وضعیت فضای ابری:</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                متصل و فعال
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <span className="text-slate-400 block text-[11px]">تعداد گفتگوها:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{sessions.length} گفتگو</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <span className="text-slate-400 block text-[11px]">آخرین زمان سینک:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  {lastSyncedTime ? new Date(lastSyncedTime).toLocaleTimeString('fa-IR') : 'هنوز سینک نشده'}
                </span>
              </div>
            </div>

            {/* Cloud Security Indicator */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {isEncryptedVault
                  ? 'اطلاعات قبل از ارسال به فضای ابری با کلید AES-256 شما رمزنگاری کلاینت‌ساید می‌شوند.'
                  : 'رمزنگاری استاندارد برقرار است. برای امنیت Zero-Knowledge می‌توانید در گاوصندوق رمز عبور بگذارید.'}
              </span>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'در حال ارسال به ابر...' : 'همگام‌سازی گفتگوها در ابر'}</span>
            </button>

            <button
              onClick={handleManualRestore}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <CloudDownload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>بازیابی از سرور ابری</span>
            </button>
          </div>

          {syncMessage && (
            <div className="p-2.5 text-center text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 rounded-lg border border-sky-200 dark:border-sky-800">
              {syncMessage}
            </div>
          )}

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
            <div>
              <span className="font-bold text-xs text-slate-850 dark:text-slate-100 block">
                همگام‌سازی خودکار (Auto-Sync)
              </span>
              <span className="text-[11px] text-slate-400">
                پشتیبان‌گیری بی‌درنگ در فضای ابری به محض دریافت هر پیام جدید
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => onToggleAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
