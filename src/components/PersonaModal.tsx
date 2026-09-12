import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Sparkles, UserCheck, Shield } from 'lucide-react';
import { Persona, ToneStyle } from '../types';
import { TONE_DEFINITIONS } from '../data/tones';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  activePersonaId: string;
  onSelectPersona: (persona: Persona) => void;
  onCreateCustomPersona: (persona: Persona) => void;
  onDeleteCustomPersona: (id: string) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  personas,
  activePersonaId,
  onSelectPersona,
  onCreateCustomPersona,
  onDeleteCustomPersona,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [toneStyle, setToneStyle] = useState<ToneStyle>('formal');
  const [selectedTag, setSelectedTag] = useState<string>('همه');

  if (!isOpen) return null;

  const allTags = ['همه', ...Array.from(new Set(personas.flatMap((p) => p.specialty)))];

  const filteredPersonas =
    selectedTag === 'همه'
      ? personas
      : personas.filter((p) => p.specialty.includes(selectedTag));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    const newPersona: Persona = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      title: title.trim() || 'شخصیت سفارشی',
      avatar: avatar || '✨',
      color: 'from-fuchsia-600 to-indigo-600',
      description: description.trim() || 'شخصیت ساخته‌شده توسط کاربر',
      specialty: ['سفارشی', title.trim() || 'هوش مصنوعی'],
      systemPrompt: systemPrompt.trim(),
      defaultTone: {
        style: toneStyle,
        detailLevel: 'balanced',
        creativity: 0.7,
        warmth: 3,
        language: 'fa',
      },
      isCustom: true,
      samplePrompts: [
        `سلام ${name.trim()}، درباره تخصص خودت توضیح بده.`,
        'چگونه می‌توانی به من کمک کنی؟',
      ],
    };

    onCreateCustomPersona(newPersona);
    onSelectPersona(newPersona);
    setIsCreating(false);
    setName('');
    setTitle('');
    setDescription('');
    setSystemPrompt('');
    onClose();
  };

  const sampleEmojiList = ['🤖', '📜', '💻', '🌱', '📈', '✨', '🏛️', '🎨', '🧠', '🔬', '⚖️', '🪄', '💡', '🛡️'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isCreating ? 'طراحی شخصیت اختصاصی جدید' : 'انتخاب و مدیریت شخصیت‌های هوش مصنوعی'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isCreating
                  ? 'نام، اموجی و دستورالعمل‌های رفتاری شخصیت دلخواه خود را تعیین نمایید.'
                  : 'هر شخصیت دارای دانش، لحن، نگرش و سبک پاسخگویی منحصربه‌فردی است.'}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isCreating ? (
            /* Create Form */
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نام شخصیت *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: استاد پندار، مشاور حقوقی، شاعر سپید..."
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان و تخصص
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: کارشناس حقوق، طراح صنعتی..."
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Emoji Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  آیکون / اموجی شخصیت:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {sampleEmojiList.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        avatar === emoji
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 ring-offset-2'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    maxLength={2}
                    className="w-12 text-center text-sm py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیح کوتاه
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="خلاصه‌ای از تخصص و ماموریت این شخصیت..."
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  دستورالعمل‌های رفتاری و هویت (System Prompt) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="شما یک متخصص ... هستید. باید با لحن ... صحبت کنید و همیشه ..."
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  سبک پیش‌فرض لحن
                </label>
                <select
                  value={toneStyle}
                  onChange={(e) => setToneStyle(e.target.value as ToneStyle)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden"
                >
                  {Object.values(TONE_DEFINITIONS).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} ({t.enLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  ذخیره و فعال‌سازی شخصیت
                </button>
              </div>
            </form>
          ) : (
            /* Personas Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Specialty Tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {allTags.slice(0, 7).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        selectedTag === tag
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Create Custom Persona Button */}
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ساخت شخصیت دلخواه</span>
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPersonas.map((persona) => {
                  const isActive = persona.id === activePersonaId;
                  const defaultTone = TONE_DEFINITIONS[persona.defaultTone.style] || TONE_DEFINITIONS.formal;

                  return (
                    <div
                      key={persona.id}
                      onClick={() => {
                        onSelectPersona(persona);
                        onClose();
                      }}
                      className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-right group ${
                        isActive
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-md'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top avatar & title */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${persona.color} flex items-center justify-center text-2xl text-white shadow-xs select-none`}
                            >
                              {persona.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm text-slate-850 dark:text-slate-100">{persona.name}</h3>
                                {persona.isCustom && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                                    سفارشی
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                {persona.title}
                              </span>
                            </div>
                          </div>

                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <Check className="w-3 h-3" />
                              <span>فعال</span>
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                          {persona.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {persona.specialty.map((spec) => (
                            <span
                              key={spec}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-normal"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer info */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>لحن پیش‌فرض: {defaultTone.label}</span>
                        {persona.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`آیا از حذف شخصیت «${persona.name}» مطمئن هستید؟`)) {
                                onDeleteCustomPersona(persona.id);
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="حذف شخصیت سفارشی"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
