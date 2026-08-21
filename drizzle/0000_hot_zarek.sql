CREATE TABLE "access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tracking_id" varchar(64) NOT NULL,
	"path" varchar(500) NOT NULL,
	"user_agent" text,
	"referer" text,
	"duration" integer,
	"max_scroll_depth" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_logs_tracking_id_unique" UNIQUE("tracking_id")
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"role" varchar(100),
	"avatar_url" text,
	"bio" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"company" varchar(255),
	"email" varchar(255) NOT NULL,
	"subject" varchar(255),
	"message" text NOT NULL,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"internal_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"tags" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_title" varchar(255) DEFAULT 'Besmile CMS Portfolio' NOT NULL,
	"favicon_url" text,
	"admin_email" varchar(255),
	"smtp_app_password" text,
	"auto_reply_enabled" boolean DEFAULT false NOT NULL,
	"auto_reply_subject" varchar(255) DEFAULT 'お問い合わせありがとうございます' NOT NULL,
	"auto_reply_body" text DEFAULT '{{name}} 様

お問い合わせありがとうございます。
内容を確認のうえ、担当者よりご連絡いたします。' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"creator_id" integer,
	"description" text,
	"project_url" varchar(500),
	"category" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
