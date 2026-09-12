import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Cloud storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const CLOUD_STORAGE_FILE = path.join(DATA_DIR, 'cloud_chats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure cloud storage file exists
if (!fs.existsSync(CLOUD_STORAGE_FILE)) {
  fs.writeFileSync(CLOUD_STORAGE_FILE, JSON.stringify({ sessions: [], updatedAt: new Date().toISOString() }, null, 2));
}

// Lazy Gemini client initialization
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined yet.');
    }
    genAiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Gemini Streaming Chat endpoint
app.post('/api/chat/stream', async (req, res) => {
  const { messages, systemInstruction, temperature = 0.7, model = 'gemini-3.8-flash' } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'پیام‌ها ارسال نشده‌اند (messages are required)' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'کلید وب‌سرویس جمینای (GEMINI_API_KEY) یافت نشد. لطفاً در پنل تنظیمات Secrets آن را تنظیم فرمایید.',
    });
  }

  try {
    const ai = getGeminiClient();

    // Prepare contents formatted for Gemini SDK
    // Convert conversational history: user and model turns
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const responseStream = await ai.models.generateContentStream({
      model: model || 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction || 'شما یک دستیار هوشمند و توانمند به زبان فارسی هستید.',
        temperature: Math.max(0.0, Math.min(1.5, Number(temperature) || 0.7)),
      },
    });

    for await (const chunk of responseStream) {
      const textChunk = chunk.text || '';
      if (textChunk) {
        res.write(`data: ${JSON.stringify({ chunk: textChunk })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Gemini streaming error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || 'خطا در ارتباط با مدل هوش مصنوعی',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'خطا در تولید پاسخ' })}\n\n`);
      res.end();
    }
  }
});

// Cloud Storage: Get all saved sessions
app.get('/api/cloud/chats', (req, res) => {
  try {
    if (!fs.existsSync(CLOUD_STORAGE_FILE)) {
      return res.json({ sessions: [], updatedAt: new Date().toISOString() });
    }
    const raw = fs.readFileSync(CLOUD_STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err: any) {
    console.error('Error reading cloud chats:', err);
    res.status(500).json({ error: 'خطا در خواندن تاریخچه ابری', details: err.message });
  }
});

// Cloud Storage: Sync / Save sessions
app.post('/api/cloud/sync', (req, res) => {
  try {
    const { sessions, encryptedPayload, vaultMeta } = req.body;

    const payload = {
      sessions: sessions || [],
      encryptedPayload: encryptedPayload || null,
      vaultMeta: vaultMeta || null,
      updatedAt: new Date().toISOString(),
      syncCount: (sessions || []).length,
    };

    fs.writeFileSync(CLOUD_STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf-8');

    res.json({
      success: true,
      message: 'تاریخچه گفتگوها با موفقیت در فضای ابری ذخیره و همگام‌سازی شد',
      updatedAt: payload.updatedAt,
      sessionCount: payload.sessions.length,
    });
  } catch (err: any) {
    console.error('Error syncing cloud chats:', err);
    res.status(500).json({ error: 'خطا در همگام‌سازی ابری', details: err.message });
  }
});

// Cloud Storage: Delete a specific session
app.delete('/api/cloud/chats/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(CLOUD_STORAGE_FILE)) {
      return res.json({ success: true });
    }
    const raw = fs.readFileSync(CLOUD_STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    parsed.sessions = (parsed.sessions || []).filter((s: any) => s.id !== id);
    parsed.updatedAt = new Date().toISOString();
    fs.writeFileSync(CLOUD_STORAGE_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    res.json({ success: true, message: 'گفتگو از فضای ابری حذف گردید' });
  } catch (err: any) {
    console.error('Error deleting cloud chat:', err);
    res.status(500).json({ error: 'خطا در حذف گفتگو از فضای ابری', details: err.message });
  }
});

// ==================== VITE MIDDLEWARE / PRODUCTION ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
