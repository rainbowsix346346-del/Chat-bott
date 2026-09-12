import React, { useState, useEffect } from 'react';
import { X, Sliders, Check, RotateCcw, Sparkles, MessageSquare } from 'lucide-react';
import { ToneConfig, ToneStyle, DetailLevel, Persona } from '../types';
import { TONE_DEFINITIONS, DETAIL_LEVEL_DEFINITIONS } from '../data/tones';

interface ToneCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: Persona;
  currentToneConfig: ToneConfig;
  onSaveToneConfig: (newConfig: ToneConfig) => void;
}

export const ToneCustomizerModal: React.FC<ToneCustomizerModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  currentToneConfig,
  onSaveToneConfig,
}) => {
  const [style, setStyle] = useState<ToneStyle>(currentToneConfig.style);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(currentToneConfig.detailLevel);
  const [creativity, setCreativity] = useState<number>(currentToneConfig.creativity);
  const [warmth, setWarmth] = useState<number>(currentToneConfig.warmth);
  const [customInstructions, setCustomInstructions] = useState<string>(
    currentToneConfig.customInstructions || ''
  );

  useEffect(() => {
    if (isOpen) {
      setStyle(currentToneConfig.style);
      setDetailLevel(currentToneConfig.detailLevel);
      setCreativity(currentToneConfig.creativity);
      setWarmth(currentToneConfig.warmth);
      setCustomInstructions(currentToneConfig.customInstructions || '');
    }
  }, [isOpen, currentToneConfig]);

  if (!isOpen) return null;

  const handleResetToDefault = () => {
    setStyle(activePersona.defaultTone.style);
    setDetailLevel(activePersona.defaultTone.detailLevel);
    setCreativity(activePersona.defaultTone.creativity);
    setWarmth(activePersona.defaultTone.warmth);
    setCustomInstructions('');
  };

  const handleSave = () => {
    onSaveToneConfig({
      style,
      detailLevel,
      creativity,
      warmth,
      customInstructions: customInstructions.trim() || undefined,
      language: currentToneConfig.language,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                شخصی‌سازی لحن پاسخگویی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تنظیم دقیق حس، عمق و ادبیات سخن گفتن «{activePersona.name}»
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Tone Archetype Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              ۱. سبک و ادبیات اصلی (Tone Style)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(TONE_DEFINITIONS).map((tone) => {
                const isSelected = style === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setStyle(tone.id)}
                    className={`flex flex-col p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-1">
                      {tone.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {tone.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Response Detail Level */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              ۲. عمق و حجم پاسخ‌ها (Detail & Length)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(Object.keys(DETAIL_LEVEL_DEFINITIONS) as DetailLevel[]).map((levelKey) => {
                const detail = DETAIL_LEVEL_DEFINITIONS[levelKey];
                const isSelected = detailLevel === levelKey;
                return (
                  <button
                    key={levelKey}
                    type="button"
                    onClick={() => setDetailLevel(levelKey)}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold text-xs text-slate-800 dark:text-slate-100 mb-0.5">
                      {detail.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {detail.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders: Creativity & Warmth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            {/* Creativity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>۳. میزان خلاقیت و تخیل (Temperature)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{creativity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.1"
                value={creativity}
                onChange={(e) => setCreativity(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>منطقی و دقیق (۰.۱)</span>
                <span>متعادل (۰.۷)</span>
                <span>نوآور و بداهه (۱.۲)</span>
              </div>
            </div>

            {/* Warmth Rating */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>۴. گرمای عاطفی و صمیمیت</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{warmth} از ۵</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={warmth}
                onChange={(e) => setWarmth(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>رسمی و خنثی (۱)</span>
                <span>مهربان (۳)</span>
                <span>بسیار پرمحبت (۵)</span>
              </div>
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              ۵. دستورالعمل‌های خاص و دلخواه شما برای این شخصیت (اختیاری)
            </label>
            <textarea
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="مثال: همیشه در پایان پاسخت یک بیت شعر مرتبط بیاور، یا جواب‌ها را با کدهای پایتون توضیح بده..."
              className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی به پیش‌فرض شخصیت</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>اعمال تنظیمات لحن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
