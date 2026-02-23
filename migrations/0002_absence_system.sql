CREATE TABLE IF NOT EXISTS "absences" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" varchar NOT NULL,
	"company_id" integer NOT NULL,
	"department_id" integer,
	"type" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_days" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reason" text,
	"rejection_reason" text,
	"document_url" varchar,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "absences_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "absences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "absences_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "absences_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vacation_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" varchar NOT NULL,
	"company_id" integer NOT NULL,
	"total_days_earned" integer DEFAULT 0 NOT NULL,
	"total_days_used" integer DEFAULT 0 NOT NULL,
	"current_balance" integer DEFAULT 0 NOT NULL,
	"last_calculated_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vacation_balances_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "vacation_balances_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "vacation_balances_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action
);
