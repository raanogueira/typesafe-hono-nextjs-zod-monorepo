CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"date" date NOT NULL,
	"symbol" text NOT NULL,
	"transaction_type" text NOT NULL,
	"quantity" numeric NOT NULL,
	"price" numeric NOT NULL,
	"currency" text NOT NULL,
	"fee" numeric DEFAULT '0',
	"broker" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"source" text DEFAULT 'imported' NOT NULL
);
