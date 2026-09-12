import { ToneStyle, DetailLevel, ToneConfig, Persona } from '../types';

export interface ToneDefinition {
  id: ToneStyle;
  label: string;
  enLabel: string;
  description: string;
  badgeColor: string;
  promptInstruction: string;
}

export const TONE_DEFINITIONS: Record<ToneStyle, ToneDefinition> = {
  formal: {
    id: 'formal',
    label: 'رسمی و فاخر',
    enLabel: 'Formal & Refined',
    description: 'کلمات وزین، جمله‌بندی استاندارد، ادبیات محترمانه و آراسته بدون الفاظ عامیانه.',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    promptInstruction: 'لحن پاسخگویی باید کاملاً رسمی، محترمانه، آراسته و فاخر باشد. از کلمات سخیف یا عامیانه استفاده نکنید و ساختار جملات را با وقار و استواری نگارش کنید.',
  },
  friendly: {
    id: 'friendly',
    label: 'صمیمی و خودمانی',
    enLabel: 'Friendly & Casual',
    description: 'بیان گرم، صمیمی، نزدیک، راحت و دلنشین مانند یک رفیق دیرین.',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    promptInstruction: 'لحن پاسخگویی باید بسیار صمیمی، خودمانی، دوستانه و گرم باشد. می‌توانید از تعابیر راحت، پرمحبت و گفتگوی روزمره استفاده کنید تا حس صمیمیت کامل بین دو دوست منتقل شود.',
  },
  humorous: {
    id: 'humorous',
    label: 'طنزآمیز و شیرین‌بیان',
    enLabel: 'Playful & Witty',
    description: 'چاشنی شوخ‌طبعی ظریف، کنایه‌های شاد و شیرین، ایجاد خنده و نشاط در حین یادگیری.',
    badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    promptInstruction: 'لحن پاسخگویی باید پرانرژی، طنزآمیز، شوخ‌طبعانه، با نشاط و زیرکانه باشد. از شوخی‌های ظریف و لبخندآفرین بدون بی احترامی استفاده کنید و اتمسفر گفتگو را شاداب نگه دارید.',
  },
  analytical: {
    id: 'analytical',
    label: 'علمی و تحلیلی',
    enLabel: 'Analytical & Rigorous',
    description: 'منطقی، مستدل، ساختارمند، تکیه بر آمار و منابع، موشکافانه و دقیق.',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    promptInstruction: 'لحن پاسخگویی باید علمی، به شدت مستدل، تحلیلی، ساختاریافته و بی‌طرف باشد. ایده‌ها را با دلایل منطقی، شواهد و دسته‌بندی گام‌به‌گام تشریح کنید.',
  },
  concise: {
    id: 'concise',
    label: 'خلاصه و مستقیم',
    enLabel: 'Ultra Concise & Direct',
    description: 'پاسخ‌های تلگرافی و بدون مقدمه چینی، تیتروار، مستقیم به اصل مطلب.',
    badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    promptInstruction: 'پاسخ‌ها را بسیار خلاصه، مستقیم، بدون مقدمه و حواشی غیرضروری و ترجیحاً به صورت بولت‌پوینت‌های کوتاه ارائه دهید. اتلاف وقت مخاطب را به صفر برسانید.',
  },
  motivational: {
    id: 'motivational',
    label: 'انگیزشی و حماسی',
    enLabel: 'Motivational & Inspiring',
    description: 'پرشور، امیدآفرین، تشویق‌کننده به اقدام، سرشار از اراده و انگیزه.',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    promptInstruction: 'لحن پاسخگویی باید به غایت انگیزشی، پرحرارت، الهام‌بخش، شجاعانه و سرشار از باور به توانمندی‌ها باشد. کاربر را با کلمات آتشین و انرژی مثبت به عمل و پیشرفت دعوت کنید.',
  },
  poetic: {
    id: 'poetic',
    label: 'شاعرانه و ادیبانه',
    enLabel: 'Poetic & Lyrical',
    description: 'نثر آهنگین، توصیف‌های مسحورکننده، تشبیهات ادبی و زیبایی کلامی.',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    promptInstruction: 'نثر پاسخ‌ها باید آهنگین، شاعرانه، سرشار از تشبیهات زیبا، ذوق ادبی و لطافت کلامی باشد. مانند نگارش یک قطعه ادبی فاخر و گوش‌نواز سخن بگویید.',
  },
  custom: {
    id: 'custom',
    label: 'سفارشی و آزاد',
    enLabel: 'Custom Tailored',
    description: 'تنظیمات کاملاً اختصاصی بر اساس متن و دستورالعمل‌های دلخواه شما.',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    promptInstruction: 'از دستورالعمل‌های سفارشی زیر به عنوان خط‌مشی اصلی لحن و رفتار خود پیروی کنید.',
  },
};

export const DETAIL_LEVEL_DEFINITIONS: Record<DetailLevel, { label: string; description: string; instruction: string }> = {
  brief: {
    label: 'مختصر و چکیده',
    description: 'پاسخ‌های کوتاه و مفید در حداکثر ۲ تا ۳ پاراگراف',
    instruction: 'پاسخ‌ها را کوتاه، فشرده و متمرکز نگه دارید. بیش از ۳ پاراگراف کوتاه نشود.',
  },
  balanced: {
    label: 'متعادل و روان',
    description: 'حجم استاندارد با پوشش ابعاد اصلی و مثال‌های کلیدی',
    instruction: 'پاسخ با حجم استاندارد، منطقی و با ذکر نکات و مثال‌های مرتبط، بدون زیاده‌گویی باشد.',
  },
  comprehensive: {
    label: 'کامل و پرجزئیات',
    description: 'بررسی همه‌جانبه، ریشه‌یابی، مثال‌های عمیق و راهنمای تفصیلی',
    instruction: 'پاسخ را بسیار جامع، عمیق، با جزئیات فراوان، کالبدشکافی و مثال‌های دقیق ارائه فرمایید.',
  },
};

/**
 * Builds the final prompt given a persona and its tone configuration
 */
export function buildSystemPrompt(persona: Persona, toneConfig: ToneConfig): string {
  const toneDef = TONE_DEFINITIONS[toneConfig.style] || TONE_DEFINITIONS.formal;
  const detailDef = DETAIL_LEVEL_DEFINITIONS[toneConfig.detailLevel] || DETAIL_LEVEL_DEFINITIONS.balanced;

  const warmthDescriptions: Record<number, string> = {
    1: 'بسیار خنثی، رسمی و عاری از هرگونه عاطفه شخصی',
    2: 'حرفه‌ای، مؤدب اما با فاصله رسمی',
    3: 'متعادل، مهربان و با ادب اجتماعی مناسب',
    4: 'بسیار گرم، پذیرا و همدلانه',
    5: 'فوق‌العاده عاطفی، حامی، دلگرم‌کننده و پرمحبت',
  };

  const warmthText = warmthDescriptions[toneConfig.warmth] || warmthDescriptions[3];

  let prompt = `${persona.systemPrompt}\n\n`;

  prompt += `### دستورالعمل‌های الزامی لحن و سبک پاسخگویی:\n`;
  prompt += `1. **شخصیت فعال:** شما به عنوان «${persona.name}» (${persona.title}) صحبت می‌کنید و باید ویژگی‌های این شخصیت را در سراسر گفتگو حفظ کنید.\n`;
  prompt += `2. **سبک لحن (${toneDef.label}):** ${toneDef.promptInstruction}\n`;
  prompt += `3. **سطح تفصیل پاسخ:** ${detailDef.instruction}\n`;
  prompt += `4. **میزان صمیمیت و گرمای کلام:** ${warmthText}.\n`;

  if (toneConfig.customInstructions && toneConfig.customInstructions.trim()) {
    prompt += `5. **دستورالعمل‌های اختصاصی کاربر:** ${toneConfig.customInstructions.trim()}\n`;
  }

  prompt += `\n### نکات نگارشی و فرمت:
- زبان اصلی گفتگو فارسی سلیس و روان است، مگر اینکه کاربر به زبان دیگری درخواست کند.
- از فرمت‌بندی مناسب مارک‌داون (سرتیترها، لیست‌ها، کدهای برجسته شده) برای خوانایی بهینه استفاده کنید.
- با احترام کامل به فرهنگ و اخلاق، هوشمندانه و بدون حشو پاسخ دهید.`;

  return prompt;
}
