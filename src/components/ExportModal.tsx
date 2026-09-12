import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  FileSpreadsheet,
  Printer,
  Shield,
  Eye,
  Key,
} from 'lucide-react';
import { ChatSession, Persona, ExportFormat } from '../types';
import {
  generateMarkdown,
  generatePlainText,
  generatePrintableHtml,
  downloadFile,
  generateEncryptedVaultFile,
} from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
  persona?: Persona;
  vaultPassphrase?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  session,
  persona,
  vaultPassphrase = '',
}) => {
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [copied, setCopied] = useState(false);
  const [passphrase, setPassphrase] = useState(vaultPassphrase);
  const [previewContent, setPreviewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (vaultPassphrase) {
      setPassphrase(vaultPassphrase);
    }
  }, [vaultPassphrase]);

  // Update preview whenever format, session, or passphrase changes
  useEffect(() => {
    if (!session || !isOpen) return;

    const updatePreview = async () => {
      setIsGenerating(true);
      try {
        switch (format) {
          case 'markdown':
            setPreviewContent(generateMarkdown(session, persona));
            break;
          case 'txt':
            setPreviewContent(generatePlainText(session, persona));
            break;
          case 'json':
            setPreviewContent(JSON.stringify(session, null, 2));
            break;
          case 'html':
            setPreviewContent(generatePrintableHtml(session, persona));
            break;
          case 'encrypted':
            if (passphrase) {
              const enc = await generateEncryptedVaultFile(session, passphrase);
              setPreviewContent(enc);
            } else {
              setPreviewContent('برای تولید فایل رمزنگاری شده، لطفاً رمز عبور را در کادر زیر وارد فرمایید.');
            }
            break;
        }
      } catch (err: any) {
        setPreviewContent(`خطا در تولید خروجی: ${err.message}`);
      } finally {
        setIsGenerating(false);
      }
    };

    updatePreview();
  }, [format, session, persona, passphrase, isOpen]);

  if (!isOpen || !session) return null;

  const handleDownload = async () => {
    const titleSlug = session.title.replace(/[\s\W]+/g, '_').slice(0, 30);
    const dateStr = new Date().toISOString().slice(0, 10);

    switch (format) {
      case 'markdown':
        downloadFile(generateMarkdown(session, persona), `chat_${titleSlug}_${dateStr}.md`, 'text/markdown;charset=utf-8');
        break;
      case 'txt':
        downloadFile(generatePlainText(session, persona), `chat_${titleSlug}_${dateStr}.txt`, 'text/plain;charset=utf-8');
        break;
      case 'json':
        downloadFile(JSON.stringify(session, null, 2), `chat_${titleSlug}_${dateStr}.json`, 'application/json;charset=utf-8');
        break;
      case 'html':
        downloadFile(generatePrintableHtml(session, persona), `chat_${titleSlug}_${dateStr}.html`, 'text/html;charset=utf-8');
        break;
      case 'encrypted':
        if (!passphrase) {
          alert('لطفاً یک رمز عبور برای رمزنگاری فایل تعیین نمایید.');
          return;
        }
        const encData = await generateEncryptedVaultFile(session, passphrase);
        downloadFile(encData, `chat_vault_${titleSlug}_${dateStr}.enc.json`, 'application/json;charset=utf-8');
        break;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatButtons: { id: ExportFormat; label: string; icon: any; ext: string }[] = [
    { id: 'markdown', label: 'مارک‌داون (Markdown)', icon: FileCode, ext: '.md' },
    { id: 'json', label: 'داده ساختاریافته (JSON)', icon: FileSpreadsheet, ext: '.json' },
    { id: 'html', label: 'سند چاپی و PDF (HTML)', icon: Printer, ext: '.html' },
    { id: 'txt', label: 'متن ساده (Text)', icon: FileText, ext: '.txt' },
    { id: 'encrypted', label: 'گاوصندوق رمزنگاری (AES)', icon: Shield, ext: '.enc.json' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                خروجی گرفتن از گفتگو
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                دانلود یا اشتراک‌گذاری گفتگو با فرمت‌های مختلف
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
          {/* Format Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              فرمت خروجی مورد نظر را انتخاب کنید:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {formatButtons.map((btn) => {
                const Icon = btn.icon;
                const isSelected = format === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setFormat(btn.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs">{btn.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">{btn.ext}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Encrypted Password Input if Encrypted Format */}
          {format === 'encrypted' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Key className="w-4 h-4" />
                <span>کلید رمزنگاری پیشرفته (AES-256-GCM)</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                این فایل با الگوریتم استاندارد نظامی AES-256 کدگذاری می‌شود و بدون داشتن این رمز عبور، خواندن محتوای آن برای هیچ‌کس (حتی سرور) ممکن نخواهد بود.
              </p>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="رمز عبور رمزنگاری برای قفل کردن این فایل..."
                className="w-full text-xs sm:text-sm px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>پیش‌نمایش خروجی:</span>
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کپی شد' : 'کپی کل متن'}</span>
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-3 max-h-60 overflow-y-auto text-xs font-mono dir-ltr text-left">
              {isGenerating ? (
                <div className="flex items-center justify-center py-8 text-slate-400">در حال تولید...</div>
              ) : (
                <pre className="whitespace-pre-wrap break-words">{previewContent}</pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {session.messages.length} پیام در این گفتگو
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
