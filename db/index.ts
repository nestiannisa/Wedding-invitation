import { desc, lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/netlify-db';
import * as schema from './schema.js';

export function getDb() {
  return drizzle({ schema });
}

export function listGuestbook(before?: number) {
  const table = schema.guestbook;
  return getDb().select({ id: table.id, nama: table.name, pesan: table.message,
    created_at: table.createdAt }).from(table)
    .where(before ? lt(table.id, before) : undefined)
    .orderBy(desc(table.id)).limit(21);
}
