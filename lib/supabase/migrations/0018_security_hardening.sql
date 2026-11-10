CREATE TABLE "captcha_challenges" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"answer" varchar(16) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "content_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "content_id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE IF EXISTS "reports_content_id_seq";--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "reporter_ip" varchar(45);--> statement-breakpoint
CREATE INDEX "idx_captcha_challenges_expires_at" ON "captcha_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_reports_reporter_ip" ON "reports" USING btree ("reporter_ip","reported_at");--> statement-breakpoint
CREATE INDEX "idx_reports_content" ON "reports" USING btree ("content_type","content_id");