CREATE TYPE "public"."purchase_status" AS ENUM('created', 'paid', 'failed');--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pack_id" text NOT NULL,
	"amount_in_paise" integer NOT NULL,
	"turns" integer NOT NULL,
	"razorpay_order_id" text NOT NULL,
	"razorpay_payment_id" text,
	"status" "purchase_status" DEFAULT 'created' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "turns_balance" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "purchases_user_id_idx" ON "purchases" USING btree ("user_id");