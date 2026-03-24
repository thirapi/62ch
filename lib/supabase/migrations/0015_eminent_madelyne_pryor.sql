ALTER TYPE "public"."user_role" ADD VALUE 'janitor' BEFORE 'user';--> statement-breakpoint
CREATE TABLE "board_janitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"board_id" integer NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unq_board_janitors_user_board" UNIQUE("user_id","board_id")
);
--> statement-breakpoint
ALTER TABLE "board_janitors" ADD CONSTRAINT "board_janitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_janitors" ADD CONSTRAINT "board_janitors_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_board_janitors_user_id" ON "board_janitors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_board_janitors_board_id" ON "board_janitors" USING btree ("board_id");