CREATE TABLE "guest_confirmations" (
	"id" serial PRIMARY KEY,
	"submission_id" uuid NOT NULL UNIQUE,
	"name" text NOT NULL,
	"attendance" text NOT NULL,
	"guest_count" integer NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "valid_attendance" CHECK ("attendance" IN ('Hadir', 'Mungkin hadir', 'Maaf, tidak bisa hadir')),
	CONSTRAINT "valid_guest_count" CHECK ("guest_count" BETWEEN 0 AND 5),
	CONSTRAINT "valid_name" CHECK (char_length(trim("name")) BETWEEN 1 AND 60),
	CONSTRAINT "valid_message" CHECK (char_length("message") <= 300)
);
