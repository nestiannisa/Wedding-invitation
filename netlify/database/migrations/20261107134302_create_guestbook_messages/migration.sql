CREATE TABLE "guestbook_messages" (
	"id" serial PRIMARY KEY,
	"submission_id" uuid NOT NULL UNIQUE,
	"name" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guestbook_valid_name" CHECK (char_length(trim("name")) BETWEEN 1 AND 60),
	CONSTRAINT "guestbook_valid_message" CHECK (char_length(trim("message")) BETWEEN 1 AND 300)
);
