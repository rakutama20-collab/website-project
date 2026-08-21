CREATE TABLE "contact_field_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"field_id" integer,
	"field_key" varchar(64) NOT NULL,
	"label_snapshot" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_key" varchar(64) NOT NULL,
	"label" varchar(255) NOT NULL,
	"type" varchar(30) DEFAULT 'text' NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contact_fields_field_key_unique" UNIQUE("field_key")
);
