import { sql } from 'drizzle-orm';
import { check, integer, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const confirmations = pgTable('guest_confirmations', {
  id: serial().primaryKey(),
  submissionId: uuid('submission_id').notNull().unique(),
  name: text('name').notNull(),
  attendance: text('attendance').notNull(),
  guestCount: integer('guest_count').notNull(),
  message: text('message').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('valid_attendance', sql`${table.attendance} IN ('Hadir', 'Mungkin hadir', 'Maaf, tidak bisa hadir')`),
  check('valid_guest_count', sql`${table.guestCount} BETWEEN 0 AND 5`),
  check('valid_name', sql`char_length(trim(${table.name})) BETWEEN 1 AND 60`),
  check('valid_message', sql`char_length(${table.message}) <= 300`),
]);
