export type Role = 'user' | 'assistant' | 'system';

export type ToneStyle =
  | 'formal'       // رسمی و دانشگاهی
  | 'friendly'     // صمیمی و دوستانه
  | 'humorous'     // شوخ‌طبع و با نشاط
  | 'analytical'   // تحلیلی و علمی
  | 'concise'      // خلاصه و تلگرافی
  | 'motivational' // انگیزشی و انرژی‌بخش
  | 'poetic'       // شاعرانه و ادیبانه
  | 'custom';      // سفارشی کاربر

export type DetailLevel = 'brief' | 'balanced' | 'comprehensive';

export interface ToneConfig {
  style: ToneStyle;
  detailLevel: DetailLevel;
  creativity: number; // 0.0 (strict/precise) to 1.2 (creative)
  warmth: number;     // 1 to 5
  customInstructions?: string;
  language: 'fa' | 'en' | 'auto';
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  avatar: string; // Emoji or icon indicator
  color: string;  // Tailwind gradient or color identifier
  description: string;
  specialty: string[];
  systemPrompt: string;
  defaultTone: ToneConfig;
  isCustom?: boolean;
  samplePrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  isEncrypted?: boolean;
  model?: string;
  encryptedData?: {
    ciphertext: string;
    iv: string;
    salt: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  personaId: string;
  toneConfig: ToneConfig;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isEncrypted: boolean;
  isPinned?: boolean;
  cloudSyncedAt?: string | null;
}

export interface EncryptionVaultState {
  isVaultEnabled: boolean;
  isUnlocked: boolean;
  hasPassphrase: boolean;
  lastEncryptedAt?: string;
}

export type ExportFormat = 'markdown' | 'json' | 'txt' | 'html' | 'encrypted';
