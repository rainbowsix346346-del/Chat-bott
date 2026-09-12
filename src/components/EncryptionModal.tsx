import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Check,
  AlertCircle,
  Upload,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { EncryptionVaultState, ChatSession } from '../types';
import { readEncryptedVault } from '../crypto/encryption';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultState: EncryptionVaultState;
  onSetPassphrase: (passphrase: string) => void;
  onClearPassphrase: () => void;
  onImportVaultSession: (session: ChatSession) => void;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  isOpen,
  onClose,
  vaultState,
  onSetPassphrase,
  onClearPassphrase,
  onImportVaultSession,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleSavePassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (passphrase.length < 6) {
      setError('رمز عبور باید حداقل ۶ نویسه (کاراکتر) باشد.');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    onSetPassphrase(passphrase);
    setSuccessMsg('گاوصندوق رمزنگاری با موفقیت فعال و کلید AES-256 ساخته شد.');
    setPassphrase('');
    setConfirmPassphrase('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!importPassphrase.trim()) {
      alert('لطفاً ابتدا رمز عبور فایل رمزنگاری‌شده را در کادر زیر وارد کنید.');
      return;
    }

    try {
      setImportStatus('در حال رمزگشایی و اعتبارسنجی...');
      const text = await file.text();
      const recoveredSession = await readEncryptedVault(text, importPassphrase.trim());
      onImportVaultSession(recoveredSession);
      setImportStatus(`گفتگو با موفقیت رمزگشایی شد: ${recoveredSession.title}`);
    } catch (err: any) {
      setImportStatus(`خطا در رمزگشایی: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                امنیت پیشرفته و گاوصندوق رمزنگاری
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                رمزنگاری پیشرفته کلاینت‌ساید (AES-256-GCM) برای تضمین حریم خصوصی
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Security Spec Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-850 dark:text-slate-200">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span>مشخصات استاندارد رمزنگاری:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block">الگوریتم:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">AES-256-GCM</span>
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block">اشتقاق کلید:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">PBKDF2 (100k)</span>
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block">معماری امنیتی:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Zero-Knowledge</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              تمام پیام‌ها با استفاده از رابط برنامه‌نویسی بومی مرورگر (Web Crypto API) رمزگذاری می‌شوند. هیچ کلیدی بدون رمز عبور شما در سرور ذخیره نمی‌شود.
            </p>
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              {vaultState.hasPassphrase ? (
                <Lock className="w-5 h-5 text-emerald-500" />
              ) : (
                <Unlock className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                  {vaultState.hasPassphrase
                    ? 'گاوصندوق رمزنگاری فعال و قفل‌گذاری شده است'
                    : 'رمز عبور گاوصندوق هنوز تنظیم نشده است'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {vaultState.hasPassphrase
                    ? 'پیام‌های شما با کلید شخصی محافظت می‌شوند'
                    : 'برای محافظت حداکثری از داده‌ها، رمز عبور تنظیم فرمایید'}
                </span>
              </div>
            </div>

            {vaultState.hasPassphrase && (
              <button
                onClick={() => {
                  if (confirm('آیا از غیرفعال کردن رمز عبور گاوصندوق اطمینان دارید؟')) {
                    onClearPassphrase();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                حذف رمز عبور
              </button>
            )}
          </div>

          {/* Set / Change Passphrase Form */}
          <form onSubmit={handleSavePassphrase} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {vaultState.hasPassphrase ? 'تغییر رمز عبور گاوصندوق:' : 'تعیین رمز عبور برای فعال‌سازی رمزنگاری:'}
            </h3>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
                  رمز عبور امن
                </label>
                <input
                  type="password"
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="حداقل ۶ نویسه..."
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
                  تکرار رمز عبور
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="دوباره وارد کنید..."
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{vaultState.hasPassphrase ? 'بروزرسانی کلید رمزنگاری' : 'فعال‌سازی رمزنگاری امن'}</span>
            </button>
          </form>

          {/* Import Encrypted Vault File Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>بازیابی گفتگو از فایل رمزنگاری شده (.enc.json):</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              اگر قبلاً گفتگویی را با فرمت رمزنگاری شده خروجی گرفته‌اید، می‌توانید آن را با وارد کردن رمز عبور بازگردانید.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={importPassphrase}
                onChange={(e) => setImportPassphrase(e.target.value)}
                placeholder="رمز عبور فایل رمزنگاری..."
                className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden"
              />
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>انتخاب فایل .enc.json</span>
                <input
                  type="file"
                  accept=".json,.enc.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{importStatus}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
