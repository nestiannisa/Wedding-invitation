import type { Config } from '@netlify/functions';
import { getDb } from '../../db/index.js';
import { confirmations } from '../../db/schema.js';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) {
    return Response.json({ error: 'Permintaan tidak diizinkan.' }, { status: 403 });
  }
  if (!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) {
    return Response.json({ error: 'Format konfirmasi tidak sesuai.' }, { status: 415 });
  }
  const body = await req.text();
  if (new TextEncoder().encode(body).length > 8192) {
    return Response.json({ error: 'Konfirmasi terlalu panjang.' }, { status: 413 });
  }
  const data = new URLSearchParams(body);
  if (data.get('bot-field')) {
    return Response.json({ ok: true });
  }
  const name = (data.get('nama') || '').trim();
  const attendance = data.get('kehadiran') || '';
  const message = (data.get('pesan') || '').trim();
  const count = data.get('jumlah') || '';
  const submissionId = data.get('submission_id') || '';
  if (!name || name.length > 60 || message.length > 300 ||
      !['Hadir', 'Mungkin hadir', 'Maaf, tidak bisa hadir'].includes(attendance) ||
      !/^[1-5]$/.test(count) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
    return Response.json({ error: 'Periksa nama, kehadiran, dan jumlah tamu (1–5 orang).' }, { status: 400 });
  }
  try {
    await getDb().insert(confirmations).values({
      submissionId, name, attendance, message,
      guestCount: attendance === 'Maaf, tidak bisa hadir' ? 0 : Number(count),
    }).onConflictDoNothing({ target: confirmations.submissionId });
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    console.error('RSVP database write failed');
    return Response.json({ error: 'Konfirmasi belum tersimpan. Silakan coba lagi.' }, { status: 503 });
  }
}

export const config: Config = { path: '/api/rsvp' };
