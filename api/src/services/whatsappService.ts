import wppconnect from '@wppconnect-team/wppconnect';
import type { Whatsapp } from '@wppconnect-team/wppconnect';
import fs from 'fs';
import path from 'path';

let client: Whatsapp | null = null;
let qrDataUrl: string | null = null;
let isConnected = false;
let isStarting = false;
let hasEverConnected = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let startPromise: Promise<void> | null = null;
let lastDisconnectAt = 0;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60_000;
const TOKEN_DIR = path.join(process.cwd(), '.wa-tokens');

if (!fs.existsSync(TOKEN_DIR)) {
  fs.mkdirSync(TOKEN_DIR, { recursive: true });
}

function clearReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect(reason: string) {
  clearReconnect();
  const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
  reconnectAttempts++;
  console.log(`🔄 Reconnecting WhatsApp in ${(delay / 1000).toFixed(1)}s (${reason})...`);
  reconnectTimer = setTimeout(() => {
    startWhatsApp().catch((err) => {
      console.error('Reconnect failed:', err);
    });
  }, delay);
}

export async function startWhatsApp(): Promise<void> {
  if (client) return;
  if (startPromise) return startPromise;

  isStarting = true;
  startPromise = (async () => {
    try {
      client = await wppconnect.create({
        session: 'kutipcrew',
        catchQR: (base64Qrimg, _asciiQR, attempts) => {
          qrDataUrl = base64Qrimg;
          console.log(`📱 QR code generated (attempt ${attempts}). Scan to connect.`);
        },
        statusFind: (statusSession) => {
          console.log('WhatsApp status:', statusSession);
          switch (statusSession) {
            case 'isLogged':
            case 'qrReadSuccess':
            case 'inChat':
              isConnected = true;
              qrDataUrl = null;
              hasEverConnected = true;
              reconnectAttempts = 0;
              console.log('✅ WhatsApp connected! Ready to send threats. 💀');
              break;
            case 'notLogged':
            case 'qrReadError':
            case 'qrReadFail':
              isConnected = false;
              break;
            case 'browserClose':
            case 'autocloseCalled':
            case 'phoneNotConnected':
            case 'disconnectedMobile':
            case 'serverClose':
              isConnected = false;
              qrDataUrl = null;
              client = null;
              lastDisconnectAt = Date.now();
              if (hasEverConnected) {
                scheduleReconnect(statusSession);
              } else {
                console.log(`ℹ️  Initial state '${statusSession}' — waiting for QR scan (no reconnect).`);
              }
              break;
          }
        },
        headless: true,
        logQR: false,
        disableWelcome: true,
        autoClose: 0,
        folderNameToken: './.wa-tokens',
        puppeteerOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
          ],
        },
      });

      try {
        await client.startPhoneWatchdog(60_000);
      } catch (err) {
        console.warn('Phone watchdog not available:', err);
      }
    } catch (error) {
      console.error('❌ Failed to start WhatsApp:', error);
      client = null;
      scheduleReconnect('start-failed');
      throw error;
    } finally {
      isStarting = false;
      startPromise = null;
    }
  })();

  return startPromise;
}

export async function stopWhatsApp(): Promise<void> {
  clearReconnect();
  if (client) {
    try {
      await client.close();
    } catch (err) {
      console.error('Error closing WhatsApp:', err);
    }
    client = null;
  }
  isConnected = false;
  qrDataUrl = null;
}

export function getQRCode(): string | null {
  return qrDataUrl;
}

export function isWhatsAppConnected(): boolean {
  return isConnected;
}

export async function logoutWhatsApp(): Promise<void> {
  clearReconnect();
  if (client) {
    try {
      await client.logout();
      await client.close();
    } catch (err) {
      console.error('Error during logout:', err);
    }
    client = null;
  }
  isConnected = false;
  qrDataUrl = null;
  reconnectAttempts = 0;
}

export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length > 1) {
    digits = digits.slice(1);
  }
  if (!digits.startsWith('6')) {
    digits = `60${digits}`;
  }
  return digits;
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!client || !isConnected) {
    throw new Error('WhatsApp not connected. Scan QR code first.');
  }

  const formattedPhone = normalizePhone(phone);
  const chatId = `${formattedPhone}@c.us`;

  try {
    await client.sendText(chatId, message);
    console.log(`📨 Threat sent to ${phone} (${chatId}) successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send to ${phone}:`, error);
    throw error;
  }
}

export async function sendBulkMessages(
  recipients: Array<{ phone: string; message: string }>,
  options: { delayMs?: number } = {}
): Promise<Array<{ phone: string; success: boolean; error?: string }>> {
  const delay = options.delayMs ?? 1500;
  const results: Array<{ phone: string; success: boolean; error?: string }> = [];

  for (const recipient of recipients) {
    try {
      await sendWhatsAppMessage(recipient.phone, recipient.message);
      results.push({ phone: recipient.phone, success: true });
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error: any) {
      results.push({ phone: recipient.phone, success: false, error: error.message });
    }
  }

  return results;
}

process.on('SIGINT', async () => {
  await stopWhatsApp();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopWhatsApp();
  process.exit(0);
});
