CREATE TABLE "application_requirement_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"requirement_id" integer NOT NULL,
	"proficiency_level" varchar NOT NULL,
	"points_earned" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_opening_id" integer NOT NULL,
	"candidate_id" integer NOT NULL,
	"status" varchar DEFAULT 'applied',
	"current_stage_id" integer,
	"score" integer DEFAULT 0,
	"is_qualified" boolean DEFAULT true,
	"distance_km" real,
	"cover_letter" text,
	"access_token" varchar,
	"applied_at" timestamp DEFAULT now(),
	"screening_notes" text,
	"rejection_reason" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar NOT NULL,
	"performed_by" varchar NOT NULL,
	"target_user_id" varchar,
	"target_resource" varchar,
	"company_id" integer,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"success" boolean NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "authorized_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"device_code" varchar(50) NOT NULL,
	"device_name" varchar(100) NOT NULL,
	"location" varchar(100) NOT NULL,
	"latitude" real,
	"longitude" real,
	"radius" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "authorized_devices_device_code_unique" UNIQUE("device_code")
);
--> statement-breakpoint
CREATE TABLE "break_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"time_entry_id" integer NOT NULL,
	"break_start" timestamp,
	"break_end" timestamp,
	"duration" numeric(4, 2),
	"type" varchar DEFAULT 'break',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"cpf" varchar,
	"birth_date" date,
	"address" text,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"latitude" real,
	"longitude" real,
	"resume_url" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"skills" text[],
	"experience" text,
	"education" text,
	"source_channel" varchar,
	"notes" text,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"certificate_number" varchar NOT NULL,
	"title" varchar NOT NULL,
	"issued_date" date NOT NULL,
	"expiry_date" date,
	"file_url" text,
	"is_verified" boolean DEFAULT false,
	"verified_by" varchar,
	"verified_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"cnpj" varchar,
	"address" text,
	"phone" varchar,
	"email" varchar,
	"logo_url" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "course_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_course_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"answer" varchar NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"question" text NOT NULL,
	"question_type" varchar DEFAULT 'multiple_choice',
	"options" jsonb NOT NULL,
	"correct_answer" varchar NOT NULL,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar,
	"duration" integer,
	"is_required" boolean DEFAULT false,
	"video_url" text,
	"external_url" text,
	"certificate_template" text,
	"passing_score" integer DEFAULT 70,
	"validity_period" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "department_shift_breaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"shift_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"duration_minutes" integer NOT NULL,
	"is_paid" boolean DEFAULT false,
	"auto_deduct" boolean DEFAULT false,
	"scheduled_start" varchar,
	"scheduled_end" varchar,
	"min_work_minutes" integer DEFAULT 360,
	"tolerance_before_minutes" integer DEFAULT 0,
	"tolerance_after_minutes" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "department_shifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar NOT NULL,
	"break_start" varchar,
	"break_end" varchar,
	"days_of_week" integer[],
	"tolerance_before_minutes" integer DEFAULT 5,
	"tolerance_after_minutes" integer DEFAULT 5,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"sector_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "disc_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer,
	"candidate_id" integer,
	"job_opening_id" integer NOT NULL,
	"access_token" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"d_score" integer DEFAULT 0,
	"i_score" integer DEFAULT 0,
	"s_score" integer DEFAULT 0,
	"c_score" integer DEFAULT 0,
	"primary_profile" varchar,
	"sent_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "disc_assessments_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "disc_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_text" text NOT NULL,
	"profile_type" varchar NOT NULL,
	"order" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "disc_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_value" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"file_name" varchar NOT NULL,
	"original_name" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar NOT NULL,
	"file_path" text NOT NULL,
	"category" varchar DEFAULT 'general',
	"uploaded_by" varchar NOT NULL,
	"assigned_to" varchar,
	"version" integer DEFAULT 1,
	"parent_document_id" integer,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"status" varchar DEFAULT 'not_started',
	"progress" integer DEFAULT 0,
	"score" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"certificate_url" text,
	"validated_by" varchar,
	"validated_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "face_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"face_data" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "face_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"date" date NOT NULL,
	"type" varchar DEFAULT 'national',
	"is_recurring" boolean DEFAULT false,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interview_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"questions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"template_id" integer,
	"interviewer_ids" varchar[],
	"scheduled_at" timestamp NOT NULL,
	"location" varchar,
	"meeting_url" text,
	"status" varchar DEFAULT 'scheduled',
	"feedback" text,
	"rating" integer,
	"evaluation" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_openings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"department_id" integer,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"responsibilities" text,
	"benefits" text,
	"location" varchar,
	"employment_type" varchar NOT NULL,
	"salary_min" numeric(10, 2),
	"salary_max" numeric(10, 2),
	"salary_range" varchar,
	"work_schedule" varchar,
	"vacancies" integer DEFAULT 1,
	"status" varchar DEFAULT 'draft',
	"requires_disc" boolean DEFAULT false,
	"disc_timing" varchar,
	"ideal_disc_profile" jsonb,
	"published_at" timestamp,
	"closed_at" timestamp,
	"expires_at" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_opening_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"requirement_type" varchar NOT NULL,
	"weight" integer DEFAULT 1,
	"proficiency_levels" jsonb NOT NULL,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_training_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"department_id" integer,
	"job_role" varchar,
	"course_id" integer NOT NULL,
	"is_required" boolean DEFAULT false,
	"days_to_complete" integer DEFAULT 30,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"company_name" varchar,
	"message" text,
	"status" varchar DEFAULT 'new' NOT NULL,
	"source_channel" varchar DEFAULT 'website',
	"utm_source" varchar,
	"utm_medium" varchar,
	"utm_campaign" varchar,
	"assigned_to" varchar,
	"company_id" integer,
	"follow_up_notes" text,
	"last_contacted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "legal_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"nsr_start" integer,
	"nsr_end" integer,
	"total_records" integer DEFAULT 0,
	"file_path" text,
	"sha256_hash" varchar(64),
	"crc_aggregate" varchar,
	"rep_identifier" varchar DEFAULT 'REP-P-001',
	"generated_by" varchar,
	"generated_at" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'generated',
	"digital_signature_meta" jsonb,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "legal_nsr_sequences" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"current_nsr" integer DEFAULT 0 NOT NULL,
	"rep_identifier" varchar DEFAULT 'REP-P-001' NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "legal_nsr_sequences_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"file_name" varchar NOT NULL,
	"original_name" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"color" varchar DEFAULT '#3B82F6',
	"company_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"is_delivered" boolean DEFAULT false,
	"delivered_at" timestamp,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"sender_id" varchar NOT NULL,
	"category_id" integer,
	"subject" varchar NOT NULL,
	"content" text NOT NULL,
	"is_mass_message" boolean DEFAULT false,
	"priority" varchar DEFAULT 'normal',
	"target_type" varchar,
	"target_id" integer,
	"target_value" varchar,
	"related_document_id" integer,
	"sender_deleted" boolean DEFAULT false,
	"sender_deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"company_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text,
	"related_id" integer,
	"related_type" varchar,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp,
	"priority" varchar DEFAULT 'normal',
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"onboarding_link_id" integer NOT NULL,
	"document_type" varchar NOT NULL,
	"file_name" varchar NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" varchar,
	"status" varchar DEFAULT 'pending_review',
	"review_notes" text,
	"uploaded_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" varchar
);
--> statement-breakpoint
CREATE TABLE "onboarding_form_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"onboarding_link_id" integer NOT NULL,
	"personal_data" jsonb,
	"contact_data" jsonb,
	"bank_data" jsonb,
	"dependents" jsonb,
	"emergency_contact" jsonb,
	"contract_data" jsonb,
	"is_complete" boolean DEFAULT false,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "onboarding_form_data_onboarding_link_id_unique" UNIQUE("onboarding_link_id")
);
--> statement-breakpoint
CREATE TABLE "onboarding_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"token" varchar NOT NULL,
	"candidate_name" varchar NOT NULL,
	"candidate_email" varchar NOT NULL,
	"candidate_phone" varchar,
	"position" varchar NOT NULL,
	"department" varchar,
	"start_date" date,
	"status" varchar DEFAULT 'pending',
	"expires_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "onboarding_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "overtime_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"shift_id" integer,
	"name" varchar NOT NULL,
	"overtime_type" varchar NOT NULL,
	"apply_to_weekdays" boolean DEFAULT true,
	"apply_to_weekends" boolean DEFAULT false,
	"apply_to_holidays" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "overtime_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"overtime_rule_id" integer NOT NULL,
	"min_hours" numeric(4, 2) NOT NULL,
	"max_hours" numeric(4, 2),
	"percentage" integer NOT NULL,
	"description" varchar,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rotation_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"action" varchar NOT NULL,
	"affected_users" integer DEFAULT 0,
	"date_range" varchar,
	"old_assignment_count" integer DEFAULT 0,
	"new_assignment_count" integer DEFAULT 0,
	"details" jsonb,
	"performed_by" varchar NOT NULL,
	"performed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rotation_exceptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer,
	"user_id" varchar,
	"exception_date" date NOT NULL,
	"original_shift_id" integer,
	"override_shift_id" integer,
	"reason" varchar NOT NULL,
	"notes" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rotation_instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"cycle_number" integer NOT NULL,
	"effective_start" date NOT NULL,
	"effective_end" date NOT NULL,
	"status" varchar DEFAULT 'active',
	"generated_at" timestamp DEFAULT now(),
	"generated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "rotation_segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"sequence_order" integer NOT NULL,
	"shift_id" integer,
	"name" varchar NOT NULL,
	"work_duration_hours" numeric(4, 2),
	"rest_duration_hours" numeric(4, 2),
	"days_of_week_mask" integer[],
	"consecutive_days" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rotation_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"department_id" integer,
	"name" varchar NOT NULL,
	"description" text,
	"cadence_type" varchar NOT NULL,
	"cycle_length" integer NOT NULL,
	"starts_on" varchar DEFAULT 'monday',
	"is_active" boolean DEFAULT true,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rotation_user_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"template_id" integer NOT NULL,
	"anchor_date" date NOT NULL,
	"starting_segment_order" integer DEFAULT 1,
	"active_instance_id" integer,
	"is_active" boolean DEFAULT true,
	"assigned_by" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"deactivated_at" timestamp,
	"deactivated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"radius" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "selection_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_opening_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"type" varchar NOT NULL,
	"is_required" boolean DEFAULT true,
	"duration_days" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supervisor_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"supervisor_id" varchar NOT NULL,
	"sector_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_bank" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"company_id" integer NOT NULL,
	"balance_hours" numeric(8, 2) DEFAULT '0',
	"total_credited" numeric(8, 2) DEFAULT '0',
	"total_debited" numeric(8, 2) DEFAULT '0',
	"expiration_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "time_bank_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "time_bank_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"time_bank_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"transaction_type" varchar NOT NULL,
	"hours" numeric(6, 2) NOT NULL,
	"balance_after" numeric(8, 2) NOT NULL,
	"time_entry_id" integer,
	"reason" varchar NOT NULL,
	"description" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"department_id" integer NOT NULL,
	"device_id" integer,
	"clock_in_time" timestamp,
	"clock_out_time" timestamp,
	"clock_in_latitude" real,
	"clock_in_longitude" real,
	"clock_out_latitude" real,
	"clock_out_longitude" real,
	"total_hours" numeric(6, 2),
	"regular_hours" numeric(6, 2) DEFAULT '0',
	"overtime_hours" numeric(6, 2) DEFAULT '0',
	"expected_hours" numeric(6, 2),
	"late_minutes" integer,
	"shortfall_minutes" integer,
	"irregularity_reasons" text[],
	"status" varchar DEFAULT 'active',
	"face_recognition_verified" boolean DEFAULT false,
	"overtime_rule_id" integer,
	"overtime_type" varchar,
	"overtime_breakdown" jsonb,
	"time_bank_hours" numeric(6, 2) DEFAULT '0',
	"clock_in_photo_url" varchar,
	"clock_out_photo_url" varchar,
	"clock_in_ip_address" varchar,
	"clock_out_ip_address" varchar,
	"clock_in_within_geofence" boolean,
	"clock_out_within_geofence" boolean,
	"clock_in_shift_compliant" boolean,
	"clock_out_shift_compliant" boolean,
	"clock_in_validation_message" text,
	"clock_out_validation_message" text,
	"entry_type" varchar DEFAULT 'automatic',
	"inserted_by" varchar,
	"approved_by" varchar,
	"approval_status" varchar DEFAULT 'approved',
	"justification" text,
	"support_document_url" varchar,
	"date" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_entry_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"time_entry_id" integer NOT NULL,
	"field_name" varchar NOT NULL,
	"old_value" text,
	"new_value" text,
	"justification" text NOT NULL,
	"attachment_url" text,
	"edited_by" varchar NOT NULL,
	"ip_address" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar DEFAULT 'open',
	"closed_by" varchar,
	"closed_at" timestamp,
	"reopened_by" varchar,
	"reopened_at" timestamp,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_shift_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"shift_id" integer NOT NULL,
	"start_date" date,
	"end_date" date,
	"assignment_type" varchar DEFAULT 'permanent',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"cpf" varchar(14),
	"rg" varchar(20),
	"rg_issuing_organ" varchar(10),
	"ctps" varchar(20),
	"pis_pasep" varchar(15),
	"titulo_eleitor" varchar(15),
	"birth_date" date,
	"marital_status" varchar,
	"gender" varchar,
	"nationality" varchar DEFAULT 'Brasileira',
	"naturalness" varchar,
	"cep" varchar(9),
	"address" text,
	"address_number" varchar(10),
	"address_complement" varchar,
	"neighborhood" varchar,
	"city" varchar,
	"state" varchar(2),
	"country" varchar DEFAULT 'Brasil',
	"personal_phone" varchar(15),
	"commercial_phone" varchar(15),
	"emergency_contact_name" varchar,
	"emergency_contact_phone" varchar(15),
	"emergency_contact_relationship" varchar,
	"internal_id" varchar(50),
	"role" varchar DEFAULT 'employee',
	"company_id" integer,
	"department_id" integer,
	"position" varchar,
	"admission_date" date,
	"contract_type" varchar,
	"work_schedule" varchar,
	"salary" numeric(10, 2),
	"benefits" text,
	"bank_code" varchar(3),
	"bank_name" varchar,
	"agency_number" varchar(10),
	"account_number" varchar(20),
	"account_type" varchar,
	"pix_key" varchar,
	"education_level" varchar,
	"institution" varchar,
	"course" varchar,
	"graduation_year" integer,
	"dependents" jsonb,
	"password_hash" varchar,
	"must_change_password" boolean DEFAULT false,
	"password_reset_token" varchar,
	"password_reset_expires" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "application_requirement_responses" ADD CONSTRAINT "application_requirement_responses_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_requirement_responses" ADD CONSTRAINT "application_requirement_responses_requirement_id_job_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."job_requirements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_opening_id_job_openings_id_fk" FOREIGN KEY ("job_opening_id") REFERENCES "public"."job_openings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authorized_devices" ADD CONSTRAINT "authorized_devices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_answers" ADD CONSTRAINT "course_answers_employee_course_id_employee_courses_id_fk" FOREIGN KEY ("employee_course_id") REFERENCES "public"."employee_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_answers" ADD CONSTRAINT "course_answers_question_id_course_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."course_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_questions" ADD CONSTRAINT "course_questions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_shift_breaks" ADD CONSTRAINT "department_shift_breaks_shift_id_department_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."department_shifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_shifts" ADD CONSTRAINT "department_shifts_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_assessments" ADD CONSTRAINT "disc_assessments_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_assessments" ADD CONSTRAINT "disc_assessments_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_assessments" ADD CONSTRAINT "disc_assessments_job_opening_id_job_openings_id_fk" FOREIGN KEY ("job_opening_id") REFERENCES "public"."job_openings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_assessments" ADD CONSTRAINT "disc_assessments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_responses" ADD CONSTRAINT "disc_responses_assessment_id_disc_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."disc_assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disc_responses" ADD CONSTRAINT "disc_responses_question_id_disc_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."disc_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_document_id_documents_id_fk" FOREIGN KEY ("parent_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_courses" ADD CONSTRAINT "employee_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_courses" ADD CONSTRAINT "employee_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_courses" ADD CONSTRAINT "employee_courses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_courses" ADD CONSTRAINT "employee_courses_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "face_profiles" ADD CONSTRAINT "face_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_templates" ADD CONSTRAINT "interview_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_templates" ADD CONSTRAINT "interview_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_template_id_interview_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."interview_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_requirements" ADD CONSTRAINT "job_requirements_job_opening_id_job_openings_id_fk" FOREIGN KEY ("job_opening_id") REFERENCES "public"."job_openings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_training_tracks" ADD CONSTRAINT "job_training_tracks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_training_tracks" ADD CONSTRAINT "job_training_tracks_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_training_tracks" ADD CONSTRAINT "job_training_tracks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_files" ADD CONSTRAINT "legal_files_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_files" ADD CONSTRAINT "legal_files_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_nsr_sequences" ADD CONSTRAINT "legal_nsr_sequences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_categories" ADD CONSTRAINT "message_categories_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_category_id_message_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."message_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_documents" ADD CONSTRAINT "onboarding_documents_onboarding_link_id_onboarding_links_id_fk" FOREIGN KEY ("onboarding_link_id") REFERENCES "public"."onboarding_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_documents" ADD CONSTRAINT "onboarding_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_form_data" ADD CONSTRAINT "onboarding_form_data_onboarding_link_id_onboarding_links_id_fk" FOREIGN KEY ("onboarding_link_id") REFERENCES "public"."onboarding_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_links" ADD CONSTRAINT "onboarding_links_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_links" ADD CONSTRAINT "onboarding_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_rules" ADD CONSTRAINT "overtime_rules_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_rules" ADD CONSTRAINT "overtime_rules_shift_id_department_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."department_shifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_tiers" ADD CONSTRAINT "overtime_tiers_overtime_rule_id_overtime_rules_id_fk" FOREIGN KEY ("overtime_rule_id") REFERENCES "public"."overtime_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_audit" ADD CONSTRAINT "rotation_audit_template_id_rotation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."rotation_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_audit" ADD CONSTRAINT "rotation_audit_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_exceptions" ADD CONSTRAINT "rotation_exceptions_template_id_rotation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."rotation_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_exceptions" ADD CONSTRAINT "rotation_exceptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_exceptions" ADD CONSTRAINT "rotation_exceptions_original_shift_id_department_shifts_id_fk" FOREIGN KEY ("original_shift_id") REFERENCES "public"."department_shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_exceptions" ADD CONSTRAINT "rotation_exceptions_override_shift_id_department_shifts_id_fk" FOREIGN KEY ("override_shift_id") REFERENCES "public"."department_shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_exceptions" ADD CONSTRAINT "rotation_exceptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_instances" ADD CONSTRAINT "rotation_instances_template_id_rotation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."rotation_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_instances" ADD CONSTRAINT "rotation_instances_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_segments" ADD CONSTRAINT "rotation_segments_template_id_rotation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."rotation_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_segments" ADD CONSTRAINT "rotation_segments_shift_id_department_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."department_shifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_templates" ADD CONSTRAINT "rotation_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_templates" ADD CONSTRAINT "rotation_templates_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_templates" ADD CONSTRAINT "rotation_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_user_assignments" ADD CONSTRAINT "rotation_user_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_user_assignments" ADD CONSTRAINT "rotation_user_assignments_template_id_rotation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."rotation_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_user_assignments" ADD CONSTRAINT "rotation_user_assignments_active_instance_id_rotation_instances_id_fk" FOREIGN KEY ("active_instance_id") REFERENCES "public"."rotation_instances"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_user_assignments" ADD CONSTRAINT "rotation_user_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_user_assignments" ADD CONSTRAINT "rotation_user_assignments_deactivated_by_users_id_fk" FOREIGN KEY ("deactivated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_stages" ADD CONSTRAINT "selection_stages_job_opening_id_job_openings_id_fk" FOREIGN KEY ("job_opening_id") REFERENCES "public"."job_openings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_bank" ADD CONSTRAINT "time_bank_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_bank" ADD CONSTRAINT "time_bank_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_bank_transactions" ADD CONSTRAINT "time_bank_transactions_time_bank_id_time_bank_id_fk" FOREIGN KEY ("time_bank_id") REFERENCES "public"."time_bank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_bank_transactions" ADD CONSTRAINT "time_bank_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_bank_transactions" ADD CONSTRAINT "time_bank_transactions_time_entry_id_time_entries_id_fk" FOREIGN KEY ("time_entry_id") REFERENCES "public"."time_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry_audit" ADD CONSTRAINT "time_entry_audit_time_entry_id_time_entries_id_fk" FOREIGN KEY ("time_entry_id") REFERENCES "public"."time_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry_audit" ADD CONSTRAINT "time_entry_audit_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_periods" ADD CONSTRAINT "time_periods_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_periods" ADD CONSTRAINT "time_periods_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_periods" ADD CONSTRAINT "time_periods_reopened_by_users_id_fk" FOREIGN KEY ("reopened_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_shift_assignments" ADD CONSTRAINT "user_shift_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_shift_assignments" ADD CONSTRAINT "user_shift_assignments_shift_id_department_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."department_shifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_requirement_response" ON "application_requirement_responses" USING btree ("application_id","requirement_id");--> statement-breakpoint
CREATE INDEX "app_requirement_responses_application_idx" ON "application_requirement_responses" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_application" ON "applications" USING btree ("job_opening_id","candidate_id");--> statement-breakpoint
CREATE INDEX "access_token_idx" ON "applications" USING btree ("access_token");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_candidate_email" ON "candidates" USING btree ("company_id","email");--> statement-breakpoint
CREATE INDEX "disc_access_token_idx" ON "disc_assessments" USING btree ("access_token");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_disc_response" ON "disc_responses" USING btree ("assessment_id","question_id");--> statement-breakpoint
CREATE INDEX "disc_responses_assessment_idx" ON "disc_responses" USING btree ("assessment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_document_version" ON "documents" USING btree ("company_id","title","version");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_course_active" ON "employee_courses" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "job_requirements_job_opening_idx" ON "job_requirements" USING btree ("job_opening_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_message_recipient" ON "message_recipients" USING btree ("message_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_template_cycle" ON "rotation_instances" USING btree ("template_id","cycle_number");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_template_sequence" ON "rotation_segments" USING btree ("template_id","sequence_order");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_template_active" ON "rotation_user_assignments" USING btree ("user_id","template_id","is_active");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_supervisor_sector" ON "supervisor_assignments" USING btree ("supervisor_id","sector_id");