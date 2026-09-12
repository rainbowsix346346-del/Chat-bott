import { ChatSession, Persona } from '../types';
import { createEncryptedVault } from '../crypto/encryption';

/**
 * Download a string as a file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate Markdown transcript
 */
export function generateMarkdown(session: ChatSession, persona?: Persona): string {
  const personaName = persona ? persona.name : session.personaId;
  let md = `# گفتگو با ${personaName}: ${session.title}\n\n`;
  md += `> **تاریخ ایجاد:** ${new Date(session.createdAt).toLocaleString('fa-IR')}\n`;
  md += `> **شخصیت هوش مصنوعی:** ${personaName} (${persona?.title || ''})\n`;
  md += `> **سبک لحن:** ${session.toneConfig.style} | **سطح تفصیل:** ${session.toneConfig.detailLevel}\n`;
  md += `> **امنیت:** ${session.isEncrypted ? 'رمزنگاری‌شده با AES-256' : 'عادی'}\n\n`;
  md += `---\n\n`;

  session.messages.forEach((msg, idx) => {
    const sender = msg.role === 'user' ? '👤 کاربر' : `🤖 ${personaName}`;
    const time = new Date(msg.timestamp).toLocaleTimeString('fa-IR');
    md += `### ${sender} _(${time})_\n\n`;
    md += `${msg.content}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

/**
 * Generate Plain Text transcript
 */
export function generatePlainText(session: ChatSession, persona?: Persona): string {
  const personaName = persona ? persona.name : session.personaId;
  let txt = `=======================================================\n`;
  txt += `تاریخچه گفتگو: ${session.title}\n`;
  txt += `مخاطب: ${personaName} (${persona?.title || ''})\n`;
  txt += `تاریخ: ${new Date(session.createdAt).toLocaleString('fa-IR')}\n`;
  txt += `=======================================================\n\n`;

  session.messages.forEach((msg) => {
    const sender = msg.role === 'user' ? 'کاربر' : personaName;
    const time = new Date(msg.timestamp).toLocaleTimeString('fa-IR');
    txt += `[${time}] ${sender}:\n`;
    txt += `${msg.content}\n`;
    txt += `-------------------------------------------------------\n\n`;
  });

  return txt;
}

/**
 * Generate Printable HTML document (for PDF export / direct printing)
 */
export function generatePrintableHtml(session: ChatSession, persona?: Persona): string {
  const personaName = persona ? persona.name : session.personaId;
  const messagesHtml = session.messages
    .map((msg) => {
      const isUser = msg.role === 'user';
      const sender = isUser ? 'کاربر' : personaName;
      const time = new Date(msg.timestamp).toLocaleTimeString('fa-IR');
      const bg = isUser ? '#f1f5f9' : '#eef2ff';
      const border = isUser ? '#cbd5e1' : '#c7d2fe';
      const safeContent = msg.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');

      return `
      <div style="margin-bottom: 16px; padding: 14px 18px; background: ${bg}; border-right: 4px solid ${border}; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; color: #1e293b;">
          <span>${sender}</span>
          <span style="font-size: 12px; color: #64748b; font-weight: normal;">${time}</span>
        </div>
        <div style="line-height: 1.8; color: #334155; font-size: 15px;">${safeContent}</div>
      </div>
    `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${session.title} - خروجی گفتگو</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 32px;
      background: #ffffff;
      color: #0f172a;
      direction: rtl;
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #1e1b4b;
    }
    .meta {
      font-size: 13px;
      color: #64748b;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .print-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      margin-bottom: 20px;
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ چاپ یا ذخیره به صورت PDF</button>
  <div class="header">
    <h1>${session.title}</h1>
    <div class="meta">
      <span><strong>شخصیت:</strong> ${personaName}</span>
      <span><strong>تاریخ:</strong> ${new Date(session.createdAt).toLocaleDateString('fa-IR')}</span>
      <span><strong>تعداد پیام‌ها:</strong> ${session.messages.length}</span>
      <span><strong>امنیت:</strong> ${session.isEncrypted ? 'رمزنگاری‌شده AES-256' : 'استاندارد'}</span>
    </div>
  </div>
  <div class="chat-container">
    ${messagesHtml}
  </div>
</body>
</html>`;
}

/**
 * Generate Encrypted Vault (.enc.json)
 */
export async function generateEncryptedVaultFile(session: ChatSession, passphrase: string): Promise<string> {
  return await createEncryptedVault(session, passphrase);
}
