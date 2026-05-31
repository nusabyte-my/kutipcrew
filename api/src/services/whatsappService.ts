import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  type WASocket,
  type ConnectionState,
} from 'baileys';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';

let sock: WASocket | null = null;
let qrDataUrl: string | null = null;
let isConnected = false;
const authDir = path.join(process.cwd(), '.wa-auth');

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

export async function startWhatsApp(): Promise<void> {
  if (sock) return;

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWADefault({
    version,
    auth: state,
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        qrDataUrl = await QRCode.toDataURL(qr, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
        console.log('📱 New QR code generated. Scan to connect.');
      } catch (err) {
        console.error('Failed to generate QR:', err);
      }
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      isConnected = false;
      qrDataUrl = null;

      if (reason !== DisconnectReason.loggedOut) {
        console.log('🔄 Reconnecting WhatsApp...');
        sock = null;
        setTimeout(() => startWhatsApp(), 3000);
      } else {
        console.log('❌ WhatsApp logged out. Need to re-scan QR.');
        sock = null;
      }
    } else if (connection === 'open') {
      isConnected = true;
      qrDataUrl = null;
      console.log('✅ WhatsApp connected! Ready to send threats. 💀');
    }
  });
}

function makeWADefault(config: any): WASocket {
  return makeWASocket(config);
}

export function getQRCode(): string | null {
  return qrDataUrl;
}

export function isWhatsAppConnected(): boolean {
  return isConnected;
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!sock || !isConnected) {
    throw new Error('WhatsApp not connected. Scan QR code first.');
  }

  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (!formattedPhone.startsWith('6')) {
    formattedPhone = `60${formattedPhone}`;
  }
  const jid = `${formattedPhone}@s.whatsapp.net`;

  try {
    await sock.sendMessage(jid, { text: message });
    console.log(`📨 Threat sent to ${phone} successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send to ${phone}:`, error);
    throw error;
  }
}

export async function sendBulkMessages(
  recipients: Array<{ phone: string; message: string }>
): Promise<Array<{ phone: string; success: boolean; error?: string }>> {
  const results: Array<{ phone: string; success: boolean; error?: string }> = [];

  for (const recipient of recipients) {
    try {
      await sendWhatsAppMessage(recipient.phone, recipient.message);
      results.push({ phone: recipient.phone, success: true });
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error: any) {
      results.push({ phone: recipient.phone, success: false, error: error.message });
    }
  }

  return results;
}
