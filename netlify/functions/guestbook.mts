import type { Config } from '@netlify/functions';
import { getDb, listGuestbook } from '../../db/index.js';
import { guestbook } from '../../db/schema.js';

export default async function handler(req: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (req.method === 'GET') {
    const before = new URL(req.url).searchParams.get('before');
    if (before !== null && (!/^[1-9]\d{0,9}$/.test(before) || Number(before) > 2147483647)) {
      return Response.json({ error: 'Halaman tidak valid.' }, { status: 400, headers });
    }
    try {
      const rows = await listGuestbook(before ? Number(before) : undefined);
      const messages = rows.slice(0, 20);
      return Response.json({ messages, next: rows.length > 20 ? messages.at(-1)!.id : null }, { headers });
    } catch {
      return Response.json({ error: 'Ucapan belum bisa dimuat.' }, { status: 503, headers });
    }
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { ...headers, Allow: 'GET, POST' } });
  }
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) {
    return Response.json({ error: 'Permintaan tidak diizinkan.' }, { status: 403, headers });
  }
  if (!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) {
    return Response.json({ error: 'Format ucapan tidak sesuai.' }, { status: 415, headers });
  }
  const body = await req.text();
  if (new TextEncoder().encode(body).length > 8192) {
    return Response.json({ error: 'Ucapan terlalu panjang.' }, { status: 413, headers });
  }
  const data = new URLSearchParams(body);
  if (data.get('bot-field')) return Response.json({ ok: true }, { headers });
  const name = (data.get('nama') || '').trim();
  const message = (data.get('pesan') || '').trim();
  const submissionId = data.get('submission_id') || '';
  if (!name || name.length > 60 || !message || message.length > 300 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
    return Response.json({ error: 'Isi nama dan ucapan dengan benar.' }, { status: 400, headers });
  }
  try {
    await getDb().insert(guestbook).values({ name, message, submissionId })
      .onConflictDoNothing({ target: guestbook.submissionId });
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ error: 'Ucapan belum tersimpan. Silakan coba lagi.' }, { status: 503, headers });
  }
}

export const config: Config = { path: '/api/guestbook' };
