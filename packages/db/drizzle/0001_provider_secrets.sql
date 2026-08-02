CREATE TYPE "public"."provider" AS ENUM('openai', 'anthropic', 'google');--> statement-breakpoint
CREATE TABLE "provider_secrets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"provider" "provider" NOT NULL,
	"ciphertext" text NOT NULL,
	"iv" text NOT NULL,
	"key_hint" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "provider_secrets" ADD CONSTRAINT "provider_secrets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "provider_secrets_project_provider_uidx" ON "provider_secrets" USING btree ("project_id","provider");--> statement-breakpoint
CREATE INDEX "provider_secrets_project_idx" ON "provider_secrets" USING btree ("project_id");
