CREATE TABLE IF NOT EXISTS "inventory_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "inventory_categories_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"unit" varchar DEFAULT 'un',
	"has_validity" boolean DEFAULT false,
	"validity_months" integer,
	"min_stock" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "inventory_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "inventory_items_category_id_inventory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"location" varchar DEFAULT 'Estoque Principal',
	"last_update_by" varchar,
	"last_update_at" timestamp DEFAULT now(),
	CONSTRAINT "inventory_stock_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "inventory_stock_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "inventory_stock_last_update_by_users_id_fk" FOREIGN KEY ("last_update_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"reason" varchar NOT NULL,
	"reference_id" integer,
	"notes" text,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "inventory_movements_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "inventory_movements_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "inventory_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employee_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" varchar NOT NULL,
	"item_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"delivery_date" timestamp DEFAULT now() NOT NULL,
	"expiry_date" timestamp,
	"delivery_signature" text,
	"delivered_by" varchar NOT NULL,
	"return_date" timestamp,
	"return_signature" text,
	"return_reason" text,
	"returned_by" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"delivery_document_id" integer,
	"return_document_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employee_items_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "employee_items_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "employee_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "employee_items_delivered_by_users_id_fk" FOREIGN KEY ("delivered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "employee_items_returned_by_users_id_fk" FOREIGN KEY ("returned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "employee_items_delivery_document_id_documents_id_fk" FOREIGN KEY ("delivery_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "employee_items_return_document_id_documents_id_fk" FOREIGN KEY ("return_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action
);
