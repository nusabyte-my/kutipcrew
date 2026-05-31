import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadRoutes = new Hono();

uploadRoutes.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    const billId = formData.get('bill_id') as string | null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Only PNG, JPEG, and WebP images allowed' }, 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large. Max 5MB.' }, 400);
    }

    const ext = file.name.split('.').pop() || 'png';
    const filename = `${nanoid(12)}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));

    const url = `/api/uploads/files/${filename}`;

    console.log(`📷 QR image uploaded: ${filename} (${(file.size / 1024).toFixed(1)}KB)`);

    return c.json({ url, filename }, 201);
  } catch (error: any) {
    console.error('Upload error:', error);
    return c.json({ error: error.message || 'Upload failed' }, 500);
  }
});

uploadRoutes.get('/files/:filename', (c) => {
  const filename = c.req.param('filename');
  const sanitized = path.basename(filename);
  const filepath = path.join(UPLOAD_DIR, sanitized);

  if (!fs.existsSync(filepath)) {
    return c.json({ error: 'File not found' }, 404);
  }

  const ext = sanitized.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  };

  const contentType = mimeTypes[ext || ''] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filepath);

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  });
});
