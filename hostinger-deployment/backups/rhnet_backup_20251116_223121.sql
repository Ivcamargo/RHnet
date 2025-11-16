--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.9

-- Started on 2025-11-16 22:31:22 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_shift_assignments DROP CONSTRAINT IF EXISTS user_shift_assignments_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_shift_assignments DROP CONSTRAINT IF EXISTS user_shift_assignments_shift_id_department_shifts_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_periods DROP CONSTRAINT IF EXISTS time_periods_reopened_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_periods DROP CONSTRAINT IF EXISTS time_periods_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_periods DROP CONSTRAINT IF EXISTS time_periods_closed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_entry_audit DROP CONSTRAINT IF EXISTS time_entry_audit_time_entry_id_time_entries_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_entry_audit DROP CONSTRAINT IF EXISTS time_entry_audit_edited_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.time_bank DROP CONSTRAINT IF EXISTS time_bank_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_bank_transactions DROP CONSTRAINT IF EXISTS time_bank_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_bank_transactions DROP CONSTRAINT IF EXISTS time_bank_transactions_time_entry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_bank_transactions DROP CONSTRAINT IF EXISTS time_bank_transactions_time_bank_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_bank DROP CONSTRAINT IF EXISTS time_bank_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisor_assignments DROP CONSTRAINT IF EXISTS supervisor_assignments_supervisor_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.supervisor_assignments DROP CONSTRAINT IF EXISTS supervisor_assignments_sector_id_sectors_id_fk;
ALTER TABLE IF EXISTS ONLY public.selection_stages DROP CONSTRAINT IF EXISTS selection_stages_job_opening_id_job_openings_id_fk;
ALTER TABLE IF EXISTS ONLY public.sectors DROP CONSTRAINT IF EXISTS sectors_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_user_assignments DROP CONSTRAINT IF EXISTS rotation_user_assignments_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_user_assignments DROP CONSTRAINT IF EXISTS rotation_user_assignments_template_id_rotation_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_user_assignments DROP CONSTRAINT IF EXISTS rotation_user_assignments_deactivated_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_user_assignments DROP CONSTRAINT IF EXISTS rotation_user_assignments_assigned_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_user_assignments DROP CONSTRAINT IF EXISTS rotation_user_assignments_active_instance_id_rotation_instances;
ALTER TABLE IF EXISTS ONLY public.rotation_templates DROP CONSTRAINT IF EXISTS rotation_templates_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_templates DROP CONSTRAINT IF EXISTS rotation_templates_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_templates DROP CONSTRAINT IF EXISTS rotation_templates_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_segments DROP CONSTRAINT IF EXISTS rotation_segments_template_id_rotation_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_segments DROP CONSTRAINT IF EXISTS rotation_segments_shift_id_department_shifts_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_instances DROP CONSTRAINT IF EXISTS rotation_instances_template_id_rotation_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_instances DROP CONSTRAINT IF EXISTS rotation_instances_generated_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_exceptions DROP CONSTRAINT IF EXISTS rotation_exceptions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_exceptions DROP CONSTRAINT IF EXISTS rotation_exceptions_template_id_rotation_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_exceptions DROP CONSTRAINT IF EXISTS rotation_exceptions_override_shift_id_department_shifts_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_exceptions DROP CONSTRAINT IF EXISTS rotation_exceptions_original_shift_id_department_shifts_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_exceptions DROP CONSTRAINT IF EXISTS rotation_exceptions_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_audit DROP CONSTRAINT IF EXISTS rotation_audit_template_id_rotation_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.rotation_audit DROP CONSTRAINT IF EXISTS rotation_audit_performed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.overtime_tiers DROP CONSTRAINT IF EXISTS overtime_tiers_overtime_rule_id_fkey;
ALTER TABLE IF EXISTS ONLY public.overtime_rules DROP CONSTRAINT IF EXISTS overtime_rules_shift_id_fkey;
ALTER TABLE IF EXISTS ONLY public.overtime_rules DROP CONSTRAINT IF EXISTS overtime_rules_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.onboarding_links DROP CONSTRAINT IF EXISTS onboarding_links_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.onboarding_links DROP CONSTRAINT IF EXISTS onboarding_links_application_id_applications_id_fk;
ALTER TABLE IF EXISTS ONLY public.onboarding_form_data DROP CONSTRAINT IF EXISTS onboarding_form_data_onboarding_link_id_onboarding_links_id_fk;
ALTER TABLE IF EXISTS ONLY public.onboarding_documents DROP CONSTRAINT IF EXISTS onboarding_documents_reviewed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.onboarding_documents DROP CONSTRAINT IF EXISTS onboarding_documents_onboarding_link_id_onboarding_links_id_fk;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_category_id_message_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.message_recipients DROP CONSTRAINT IF EXISTS message_recipients_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.message_recipients DROP CONSTRAINT IF EXISTS message_recipients_message_id_messages_id_fk;
ALTER TABLE IF EXISTS ONLY public.message_categories DROP CONSTRAINT IF EXISTS message_categories_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_uploaded_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_message_id_messages_id_fk;
ALTER TABLE IF EXISTS ONLY public.leads DROP CONSTRAINT IF EXISTS leads_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.job_requirements DROP CONSTRAINT IF EXISTS job_requirements_job_opening_fk;
ALTER TABLE IF EXISTS ONLY public.job_openings DROP CONSTRAINT IF EXISTS job_openings_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.job_openings DROP CONSTRAINT IF EXISTS job_openings_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.job_openings DROP CONSTRAINT IF EXISTS job_openings_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.interviews DROP CONSTRAINT IF EXISTS interviews_template_id_interview_templates_id_fk;
ALTER TABLE IF EXISTS ONLY public.interviews DROP CONSTRAINT IF EXISTS interviews_application_id_applications_id_fk;
ALTER TABLE IF EXISTS ONLY public.interview_templates DROP CONSTRAINT IF EXISTS interview_templates_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.interview_templates DROP CONSTRAINT IF EXISTS interview_templates_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.holidays DROP CONSTRAINT IF EXISTS holidays_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.employee_courses DROP CONSTRAINT IF EXISTS employee_courses_validated_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.employee_courses DROP CONSTRAINT IF EXISTS employee_courses_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.employee_courses DROP CONSTRAINT IF EXISTS employee_courses_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.employee_courses DROP CONSTRAINT IF EXISTS employee_courses_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_parent_document_id_documents_id_fk;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_assigned_to_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.disc_responses DROP CONSTRAINT IF EXISTS disc_responses_question_id_fkey;
ALTER TABLE IF EXISTS ONLY public.disc_responses DROP CONSTRAINT IF EXISTS disc_responses_assessment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.disc_assessments DROP CONSTRAINT IF EXISTS disc_assessments_job_opening_id_fkey;
ALTER TABLE IF EXISTS ONLY public.disc_assessments DROP CONSTRAINT IF EXISTS disc_assessments_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.disc_assessments DROP CONSTRAINT IF EXISTS disc_assessments_candidate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.disc_assessments DROP CONSTRAINT IF EXISTS disc_assessments_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_sector_id_sectors_id_fk;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.department_shifts DROP CONSTRAINT IF EXISTS department_shifts_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.department_shift_breaks DROP CONSTRAINT IF EXISTS department_shift_breaks_shift_id_department_shifts_id_fk;
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS courses_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.course_questions DROP CONSTRAINT IF EXISTS course_questions_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.course_answers DROP CONSTRAINT IF EXISTS course_answers_question_id_course_questions_id_fk;
ALTER TABLE IF EXISTS ONLY public.course_answers DROP CONSTRAINT IF EXISTS course_answers_employee_course_id_employee_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS certificates_verified_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS certificates_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS certificates_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS certificates_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.candidates DROP CONSTRAINT IF EXISTS candidates_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.authorized_devices DROP CONSTRAINT IF EXISTS authorized_devices_sector_id_sectors_id_fk;
ALTER TABLE IF EXISTS ONLY public.authorized_devices DROP CONSTRAINT IF EXISTS authorized_devices_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_target_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_performed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_company_id_companies_id_fk;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_job_opening_id_job_openings_id_fk;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_candidate_id_candidates_id_fk;
ALTER TABLE IF EXISTS ONLY public.application_requirement_responses DROP CONSTRAINT IF EXISTS app_req_responses_requirement_fk;
ALTER TABLE IF EXISTS ONLY public.application_requirement_responses DROP CONSTRAINT IF EXISTS app_req_responses_application_fk;
DROP INDEX IF EXISTS public.unique_user_template_active;
DROP INDEX IF EXISTS public.unique_user_course_active;
DROP INDEX IF EXISTS public.unique_template_sequence;
DROP INDEX IF EXISTS public.unique_template_cycle;
DROP INDEX IF EXISTS public.unique_supervisor_sector;
DROP INDEX IF EXISTS public.unique_message_recipient;
DROP INDEX IF EXISTS public.unique_document_version;
DROP INDEX IF EXISTS public.unique_candidate_email;
DROP INDEX IF EXISTS public.unique_application;
DROP INDEX IF EXISTS public.job_requirements_job_opening_idx;
DROP INDEX IF EXISTS public.idx_session_expire;
DROP INDEX IF EXISTS public.disc_responses_assessment_idx;
DROP INDEX IF EXISTS public.disc_access_token_idx;
DROP INDEX IF EXISTS public.app_requirement_responses_application_idx;
DROP INDEX IF EXISTS public.access_token_idx;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_shift_assignments DROP CONSTRAINT IF EXISTS user_shift_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.application_requirement_responses DROP CONSTRAINT IF EXISTS unique_requirement_response;
ALTER TABLE IF EXISTS ONLY public.disc_responses DROP CONSTRAINT IF EXISTS unique_disc_response;
ALTER TABLE IF EXISTS ONLY public.time_periods DROP CONSTRAINT IF EXISTS time_periods_pkey;
ALTER TABLE IF EXISTS ONLY public.time_entry_audit DROP CONSTRAINT IF EXISTS time_entry_audit_pkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.time_bank DROP CONSTRAINT IF EXISTS time_bank_user_id_key;
ALTER TABLE IF EXISTS ONLY public.time_bank_transactions DROP CONSTRAINT IF EXISTS time_bank_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.time_bank DROP CONSTRAINT IF EXISTS time_bank_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisor_assignments DROP CONSTRAINT IF EXISTS supervisor_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY public.selection_stages DROP CONSTRAINT IF EXISTS selection_stages_pkey;
ALTER TABLE IF EXISTS ONLY public.sectors DROP CONSTRAINT IF EXISTS sectors_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_user_assignments DROP CONSTRAINT IF EXISTS rotation_user_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_templates DROP CONSTRAINT IF EXISTS rotation_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_segments DROP CONSTRAINT IF EXISTS rotation_segments_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_instances DROP CONSTRAINT IF EXISTS rotation_instances_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_exceptions DROP CONSTRAINT IF EXISTS rotation_exceptions_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_audit DROP CONSTRAINT IF EXISTS rotation_audit_pkey;
ALTER TABLE IF EXISTS ONLY public.overtime_tiers DROP CONSTRAINT IF EXISTS overtime_tiers_pkey;
ALTER TABLE IF EXISTS ONLY public.overtime_rules DROP CONSTRAINT IF EXISTS overtime_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.onboarding_links DROP CONSTRAINT IF EXISTS onboarding_links_token_unique;
ALTER TABLE IF EXISTS ONLY public.onboarding_links DROP CONSTRAINT IF EXISTS onboarding_links_pkey;
ALTER TABLE IF EXISTS ONLY public.onboarding_form_data DROP CONSTRAINT IF EXISTS onboarding_form_data_pkey;
ALTER TABLE IF EXISTS ONLY public.onboarding_form_data DROP CONSTRAINT IF EXISTS onboarding_form_data_onboarding_link_id_unique;
ALTER TABLE IF EXISTS ONLY public.onboarding_documents DROP CONSTRAINT IF EXISTS onboarding_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.message_recipients DROP CONSTRAINT IF EXISTS message_recipients_pkey;
ALTER TABLE IF EXISTS ONLY public.message_categories DROP CONSTRAINT IF EXISTS message_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_nsr_sequences DROP CONSTRAINT IF EXISTS legal_nsr_sequences_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_nsr_sequences DROP CONSTRAINT IF EXISTS legal_nsr_sequences_company_id_key;
ALTER TABLE IF EXISTS ONLY public.legal_files DROP CONSTRAINT IF EXISTS legal_files_pkey;
ALTER TABLE IF EXISTS ONLY public.leads DROP CONSTRAINT IF EXISTS leads_pkey;
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_pkey;
ALTER TABLE IF EXISTS ONLY public.job_requirements DROP CONSTRAINT IF EXISTS job_requirements_pkey;
ALTER TABLE IF EXISTS ONLY public.job_openings DROP CONSTRAINT IF EXISTS job_openings_pkey;
ALTER TABLE IF EXISTS ONLY public.interviews DROP CONSTRAINT IF EXISTS interviews_pkey;
ALTER TABLE IF EXISTS ONLY public.interview_templates DROP CONSTRAINT IF EXISTS interview_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.holidays DROP CONSTRAINT IF EXISTS holidays_pkey;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_courses DROP CONSTRAINT IF EXISTS employee_courses_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.disc_responses DROP CONSTRAINT IF EXISTS disc_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.disc_questions DROP CONSTRAINT IF EXISTS disc_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.disc_assessments DROP CONSTRAINT IF EXISTS disc_assessments_pkey;
ALTER TABLE IF EXISTS ONLY public.disc_assessments DROP CONSTRAINT IF EXISTS disc_assessments_access_token_key;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.department_shifts DROP CONSTRAINT IF EXISTS department_shifts_pkey;
ALTER TABLE IF EXISTS ONLY public.department_shift_breaks DROP CONSTRAINT IF EXISTS department_shift_breaks_pkey;
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS courses_pkey;
ALTER TABLE IF EXISTS ONLY public.course_questions DROP CONSTRAINT IF EXISTS course_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.course_answers DROP CONSTRAINT IF EXISTS course_answers_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_cnpj_unique;
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS certificates_pkey;
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS certificates_certificate_number_unique;
ALTER TABLE IF EXISTS ONLY public.candidates DROP CONSTRAINT IF EXISTS candidates_pkey;
ALTER TABLE IF EXISTS ONLY public.break_entries DROP CONSTRAINT IF EXISTS break_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.authorized_devices DROP CONSTRAINT IF EXISTS authorized_devices_pkey;
ALTER TABLE IF EXISTS ONLY public.authorized_devices DROP CONSTRAINT IF EXISTS authorized_devices_device_code_unique;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_pkey;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_pkey;
ALTER TABLE IF EXISTS ONLY public.application_requirement_responses DROP CONSTRAINT IF EXISTS application_requirement_responses_pkey;
ALTER TABLE IF EXISTS public.user_shift_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_periods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_entry_audit ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_bank_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_bank ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisor_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.selection_stages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sectors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_user_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_segments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_instances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_exceptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_audit ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.overtime_tiers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.overtime_rules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.onboarding_links ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.onboarding_form_data ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.onboarding_documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_recipients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_attachments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_nsr_sequences ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leads ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_training_tracks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_requirements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_openings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.interviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.interview_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.holidays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.face_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_courses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.disc_responses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.disc_questions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.disc_assessments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.department_shifts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.department_shift_breaks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.courses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.course_questions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.course_answers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.companies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.certificates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.candidates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.break_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.authorized_devices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_log ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.applications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.application_requirement_responses ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_shift_assignments_id_seq;
DROP TABLE IF EXISTS public.user_shift_assignments;
DROP SEQUENCE IF EXISTS public.time_periods_id_seq;
DROP TABLE IF EXISTS public.time_periods;
DROP SEQUENCE IF EXISTS public.time_entry_audit_id_seq;
DROP TABLE IF EXISTS public.time_entry_audit;
DROP SEQUENCE IF EXISTS public.time_entries_id_seq;
DROP TABLE IF EXISTS public.time_entries;
DROP SEQUENCE IF EXISTS public.time_bank_transactions_id_seq;
DROP TABLE IF EXISTS public.time_bank_transactions;
DROP SEQUENCE IF EXISTS public.time_bank_id_seq;
DROP TABLE IF EXISTS public.time_bank;
DROP SEQUENCE IF EXISTS public.supervisor_assignments_id_seq;
DROP TABLE IF EXISTS public.supervisor_assignments;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.session;
DROP SEQUENCE IF EXISTS public.selection_stages_id_seq;
DROP TABLE IF EXISTS public.selection_stages;
DROP SEQUENCE IF EXISTS public.sectors_id_seq;
DROP TABLE IF EXISTS public.sectors;
DROP SEQUENCE IF EXISTS public.rotation_user_assignments_id_seq;
DROP TABLE IF EXISTS public.rotation_user_assignments;
DROP SEQUENCE IF EXISTS public.rotation_templates_id_seq;
DROP TABLE IF EXISTS public.rotation_templates;
DROP SEQUENCE IF EXISTS public.rotation_segments_id_seq;
DROP TABLE IF EXISTS public.rotation_segments;
DROP SEQUENCE IF EXISTS public.rotation_instances_id_seq;
DROP TABLE IF EXISTS public.rotation_instances;
DROP SEQUENCE IF EXISTS public.rotation_exceptions_id_seq;
DROP TABLE IF EXISTS public.rotation_exceptions;
DROP SEQUENCE IF EXISTS public.rotation_audit_id_seq;
DROP TABLE IF EXISTS public.rotation_audit;
DROP SEQUENCE IF EXISTS public.overtime_tiers_id_seq;
DROP TABLE IF EXISTS public.overtime_tiers;
DROP SEQUENCE IF EXISTS public.overtime_rules_id_seq;
DROP TABLE IF EXISTS public.overtime_rules;
DROP SEQUENCE IF EXISTS public.onboarding_links_id_seq;
DROP TABLE IF EXISTS public.onboarding_links;
DROP SEQUENCE IF EXISTS public.onboarding_form_data_id_seq;
DROP TABLE IF EXISTS public.onboarding_form_data;
DROP SEQUENCE IF EXISTS public.onboarding_documents_id_seq;
DROP TABLE IF EXISTS public.onboarding_documents;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.message_recipients_id_seq;
DROP TABLE IF EXISTS public.message_recipients;
DROP SEQUENCE IF EXISTS public.message_categories_id_seq;
DROP TABLE IF EXISTS public.message_categories;
DROP SEQUENCE IF EXISTS public.message_attachments_id_seq;
DROP TABLE IF EXISTS public.message_attachments;
DROP SEQUENCE IF EXISTS public.legal_nsr_sequences_id_seq;
DROP TABLE IF EXISTS public.legal_nsr_sequences;
DROP SEQUENCE IF EXISTS public.legal_files_id_seq;
DROP TABLE IF EXISTS public.legal_files;
DROP SEQUENCE IF EXISTS public.leads_id_seq;
DROP TABLE IF EXISTS public.leads;
DROP SEQUENCE IF EXISTS public.job_training_tracks_id_seq;
DROP TABLE IF EXISTS public.job_training_tracks;
DROP SEQUENCE IF EXISTS public.job_requirements_id_seq;
DROP TABLE IF EXISTS public.job_requirements;
DROP SEQUENCE IF EXISTS public.job_openings_id_seq;
DROP TABLE IF EXISTS public.job_openings;
DROP SEQUENCE IF EXISTS public.interviews_id_seq;
DROP TABLE IF EXISTS public.interviews;
DROP SEQUENCE IF EXISTS public.interview_templates_id_seq;
DROP TABLE IF EXISTS public.interview_templates;
DROP SEQUENCE IF EXISTS public.holidays_id_seq;
DROP TABLE IF EXISTS public.holidays;
DROP SEQUENCE IF EXISTS public.face_profiles_id_seq;
DROP TABLE IF EXISTS public.face_profiles;
DROP SEQUENCE IF EXISTS public.employee_courses_id_seq;
DROP TABLE IF EXISTS public.employee_courses;
DROP SEQUENCE IF EXISTS public.documents_id_seq;
DROP TABLE IF EXISTS public.documents;
DROP SEQUENCE IF EXISTS public.disc_responses_id_seq;
DROP TABLE IF EXISTS public.disc_responses;
DROP SEQUENCE IF EXISTS public.disc_questions_id_seq;
DROP TABLE IF EXISTS public.disc_questions;
DROP SEQUENCE IF EXISTS public.disc_assessments_id_seq;
DROP TABLE IF EXISTS public.disc_assessments;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.department_shifts_id_seq;
DROP TABLE IF EXISTS public.department_shifts;
DROP SEQUENCE IF EXISTS public.department_shift_breaks_id_seq;
DROP TABLE IF EXISTS public.department_shift_breaks;
DROP SEQUENCE IF EXISTS public.courses_id_seq;
DROP TABLE IF EXISTS public.courses;
DROP SEQUENCE IF EXISTS public.course_questions_id_seq;
DROP TABLE IF EXISTS public.course_questions;
DROP SEQUENCE IF EXISTS public.course_answers_id_seq;
DROP TABLE IF EXISTS public.course_answers;
DROP SEQUENCE IF EXISTS public.companies_id_seq;
DROP TABLE IF EXISTS public.companies;
DROP SEQUENCE IF EXISTS public.certificates_id_seq;
DROP TABLE IF EXISTS public.certificates;
DROP SEQUENCE IF EXISTS public.candidates_id_seq;
DROP TABLE IF EXISTS public.candidates;
DROP SEQUENCE IF EXISTS public.break_entries_id_seq;
DROP TABLE IF EXISTS public.break_entries;
DROP SEQUENCE IF EXISTS public.authorized_devices_id_seq;
DROP TABLE IF EXISTS public.authorized_devices;
DROP SEQUENCE IF EXISTS public.audit_log_id_seq;
DROP TABLE IF EXISTS public.audit_log;
DROP SEQUENCE IF EXISTS public.applications_id_seq;
DROP TABLE IF EXISTS public.applications;
DROP SEQUENCE IF EXISTS public.application_requirement_responses_id_seq;
DROP TABLE IF EXISTS public.application_requirement_responses;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- TOC entry 2 (class 3079 OID 434176)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4264 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 317 (class 1259 OID 319511)
-- Name: application_requirement_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_requirement_responses (
    id integer NOT NULL,
    application_id integer NOT NULL,
    requirement_id integer NOT NULL,
    proficiency_level character varying NOT NULL,
    points_earned integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 316 (class 1259 OID 319510)
-- Name: application_requirement_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_requirement_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4265 (class 0 OID 0)
-- Dependencies: 316
-- Name: application_requirement_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_requirement_responses_id_seq OWNED BY public.application_requirement_responses.id;


--
-- TOC entry 281 (class 1259 OID 155649)
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    job_opening_id integer NOT NULL,
    candidate_id integer NOT NULL,
    status character varying DEFAULT 'applied'::character varying,
    current_stage_id integer,
    score integer DEFAULT 0,
    distance_km real,
    cover_letter text,
    applied_at timestamp without time zone DEFAULT now(),
    screening_notes text,
    rejection_reason text,
    updated_at timestamp without time zone DEFAULT now(),
    is_qualified boolean DEFAULT true,
    access_token character varying
);


--
-- TOC entry 4266 (class 0 OID 0)
-- Dependencies: 281
-- Name: COLUMN applications.score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.applications.score IS 'Pontuação ponderada (Σ(Pi × Wi))';


--
-- TOC entry 280 (class 1259 OID 155648)
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4267 (class 0 OID 0)
-- Dependencies: 280
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- TOC entry 251 (class 1259 OID 40961)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    action character varying NOT NULL,
    performed_by character varying NOT NULL,
    target_user_id character varying,
    target_resource character varying,
    company_id integer,
    details jsonb,
    ip_address character varying,
    user_agent text,
    success boolean NOT NULL,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 250 (class 1259 OID 40960)
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4268 (class 0 OID 0)
-- Dependencies: 250
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- TOC entry 301 (class 1259 OID 229377)
-- Name: authorized_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authorized_devices (
    id integer NOT NULL,
    device_code character varying NOT NULL,
    device_name character varying NOT NULL,
    company_id integer NOT NULL,
    sector_id integer,
    description text,
    latitude real,
    longitude real,
    geofence_radius integer DEFAULT 100,
    is_active boolean DEFAULT true,
    last_used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    location character varying(100),
    radius integer DEFAULT 100
);


--
-- TOC entry 300 (class 1259 OID 229376)
-- Name: authorized_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.authorized_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4269 (class 0 OID 0)
-- Dependencies: 300
-- Name: authorized_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.authorized_devices_id_seq OWNED BY public.authorized_devices.id;


--
-- TOC entry 217 (class 1259 OID 16478)
-- Name: break_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.break_entries (
    id integer NOT NULL,
    time_entry_id integer NOT NULL,
    break_start timestamp without time zone,
    break_end timestamp without time zone,
    duration numeric(4,2),
    type character varying DEFAULT 'break'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 216 (class 1259 OID 16477)
-- Name: break_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.break_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4270 (class 0 OID 0)
-- Dependencies: 216
-- Name: break_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.break_entries_id_seq OWNED BY public.break_entries.id;


--
-- TOC entry 283 (class 1259 OID 155662)
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    cpf character varying,
    birth_date date,
    address text,
    city character varying,
    state character varying,
    zip_code character varying,
    latitude real,
    longitude real,
    resume_url text,
    linkedin_url text,
    portfolio_url text,
    skills text[],
    experience text,
    education text,
    source_channel character varying,
    notes text,
    status character varying DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 282 (class 1259 OID 155661)
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4271 (class 0 OID 0)
-- Dependencies: 282
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- TOC entry 219 (class 1259 OID 16489)
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    course_id integer NOT NULL,
    company_id integer NOT NULL,
    certificate_number character varying NOT NULL,
    title character varying NOT NULL,
    issued_date date NOT NULL,
    expiry_date date,
    file_url text,
    is_verified boolean DEFAULT false,
    verified_by character varying,
    verified_at timestamp without time zone,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 218 (class 1259 OID 16488)
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4272 (class 0 OID 0)
-- Dependencies: 218
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- TOC entry 221 (class 1259 OID 16502)
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying NOT NULL,
    cnpj character varying,
    address text,
    phone character varying,
    email character varying,
    logo_url character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 220 (class 1259 OID 16501)
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4273 (class 0 OID 0)
-- Dependencies: 220
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- TOC entry 277 (class 1259 OID 147457)
-- Name: course_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_answers (
    id integer NOT NULL,
    employee_course_id integer NOT NULL,
    question_id integer NOT NULL,
    answer character varying NOT NULL,
    is_correct boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 276 (class 1259 OID 147456)
-- Name: course_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4274 (class 0 OID 0)
-- Dependencies: 276
-- Name: course_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_answers_id_seq OWNED BY public.course_answers.id;


--
-- TOC entry 279 (class 1259 OID 147467)
-- Name: course_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_questions (
    id integer NOT NULL,
    course_id integer NOT NULL,
    question text NOT NULL,
    question_type character varying DEFAULT 'multiple_choice'::character varying,
    options jsonb NOT NULL,
    correct_answer character varying NOT NULL,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 278 (class 1259 OID 147466)
-- Name: course_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4275 (class 0 OID 0)
-- Dependencies: 278
-- Name: course_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_questions_id_seq OWNED BY public.course_questions.id;


--
-- TOC entry 223 (class 1259 OID 16516)
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    category character varying,
    duration integer,
    is_required boolean DEFAULT false,
    external_url text,
    certificate_template text,
    passing_score integer DEFAULT 70,
    validity_period integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    video_url text
);


--
-- TOC entry 222 (class 1259 OID 16515)
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4276 (class 0 OID 0)
-- Dependencies: 222
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- TOC entry 261 (class 1259 OID 98305)
-- Name: department_shift_breaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department_shift_breaks (
    id integer NOT NULL,
    shift_id integer NOT NULL,
    name character varying NOT NULL,
    duration_minutes integer NOT NULL,
    is_paid boolean DEFAULT false,
    auto_deduct boolean DEFAULT false,
    scheduled_start character varying,
    scheduled_end character varying,
    min_work_minutes integer DEFAULT 360,
    tolerance_before_minutes integer DEFAULT 0,
    tolerance_after_minutes integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 260 (class 1259 OID 98304)
-- Name: department_shift_breaks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_shift_breaks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4277 (class 0 OID 0)
-- Dependencies: 260
-- Name: department_shift_breaks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_shift_breaks_id_seq OWNED BY public.department_shift_breaks.id;


--
-- TOC entry 253 (class 1259 OID 49153)
-- Name: department_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department_shifts (
    id integer NOT NULL,
    department_id integer NOT NULL,
    name character varying NOT NULL,
    start_time character varying NOT NULL,
    end_time character varying NOT NULL,
    days_of_week integer[],
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    break_start character varying,
    break_end character varying,
    tolerance_before_minutes integer DEFAULT 5,
    tolerance_after_minutes integer DEFAULT 5
);


--
-- TOC entry 252 (class 1259 OID 49152)
-- Name: department_shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4278 (class 0 OID 0)
-- Dependencies: 252
-- Name: department_shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_shifts_id_seq OWNED BY public.department_shifts.id;


--
-- TOC entry 225 (class 1259 OID 16529)
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    sector_id integer NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16528)
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4279 (class 0 OID 0)
-- Dependencies: 224
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- TOC entry 323 (class 1259 OID 344076)
-- Name: disc_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disc_assessments (
    id integer NOT NULL,
    application_id integer,
    candidate_id integer,
    job_opening_id integer NOT NULL,
    access_token character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying,
    d_score integer DEFAULT 0,
    i_score integer DEFAULT 0,
    s_score integer DEFAULT 0,
    c_score integer DEFAULT 0,
    primary_profile character varying,
    sent_at timestamp without time zone DEFAULT now(),
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 322 (class 1259 OID 344075)
-- Name: disc_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disc_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4280 (class 0 OID 0)
-- Dependencies: 322
-- Name: disc_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disc_assessments_id_seq OWNED BY public.disc_assessments.id;


--
-- TOC entry 321 (class 1259 OID 344065)
-- Name: disc_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disc_questions (
    id integer NOT NULL,
    question_text text NOT NULL,
    profile_type character varying NOT NULL,
    "order" integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 320 (class 1259 OID 344064)
-- Name: disc_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disc_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4281 (class 0 OID 0)
-- Dependencies: 320
-- Name: disc_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disc_questions_id_seq OWNED BY public.disc_questions.id;


--
-- TOC entry 325 (class 1259 OID 344115)
-- Name: disc_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disc_responses (
    id integer NOT NULL,
    assessment_id integer NOT NULL,
    question_id integer NOT NULL,
    selected_value integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 324 (class 1259 OID 344114)
-- Name: disc_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disc_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4282 (class 0 OID 0)
-- Dependencies: 324
-- Name: disc_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disc_responses_id_seq OWNED BY public.disc_responses.id;


--
-- TOC entry 227 (class 1259 OID 16542)
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    file_name character varying NOT NULL,
    original_name character varying NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying NOT NULL,
    file_path text NOT NULL,
    category character varying DEFAULT 'general'::character varying,
    uploaded_by character varying NOT NULL,
    assigned_to character varying,
    version integer DEFAULT 1,
    parent_document_id integer,
    is_active boolean DEFAULT true,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 226 (class 1259 OID 16541)
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4283 (class 0 OID 0)
-- Dependencies: 226
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- TOC entry 229 (class 1259 OID 16556)
-- Name: employee_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_courses (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    course_id integer NOT NULL,
    company_id integer NOT NULL,
    status character varying DEFAULT 'not_started'::character varying,
    progress integer DEFAULT 0,
    score integer,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    expires_at timestamp without time zone,
    certificate_url text,
    validated_by character varying,
    validated_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 228 (class 1259 OID 16555)
-- Name: employee_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4284 (class 0 OID 0)
-- Dependencies: 228
-- Name: employee_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_courses_id_seq OWNED BY public.employee_courses.id;


--
-- TOC entry 231 (class 1259 OID 16569)
-- Name: face_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.face_profiles (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    face_data jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 230 (class 1259 OID 16568)
-- Name: face_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.face_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4285 (class 0 OID 0)
-- Dependencies: 230
-- Name: face_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.face_profiles_id_seq OWNED BY public.face_profiles.id;


--
-- TOC entry 233 (class 1259 OID 16583)
-- Name: holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.holidays (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying NOT NULL,
    date date NOT NULL,
    type character varying DEFAULT 'national'::character varying,
    is_recurring boolean DEFAULT false,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 232 (class 1259 OID 16582)
-- Name: holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.holidays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4286 (class 0 OID 0)
-- Dependencies: 232
-- Name: holidays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.holidays_id_seq OWNED BY public.holidays.id;


--
-- TOC entry 285 (class 1259 OID 155674)
-- Name: interview_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interview_templates (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    type character varying NOT NULL,
    questions jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 284 (class 1259 OID 155673)
-- Name: interview_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interview_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4287 (class 0 OID 0)
-- Dependencies: 284
-- Name: interview_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interview_templates_id_seq OWNED BY public.interview_templates.id;


--
-- TOC entry 287 (class 1259 OID 155686)
-- Name: interviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    application_id integer NOT NULL,
    template_id integer,
    interviewer_ids character varying[],
    scheduled_at timestamp without time zone NOT NULL,
    location character varying,
    meeting_url text,
    status character varying DEFAULT 'scheduled'::character varying,
    feedback text,
    rating integer,
    evaluation jsonb,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 286 (class 1259 OID 155685)
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4288 (class 0 OID 0)
-- Dependencies: 286
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- TOC entry 289 (class 1259 OID 155697)
-- Name: job_openings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_openings (
    id integer NOT NULL,
    company_id integer NOT NULL,
    department_id integer,
    title character varying NOT NULL,
    description text NOT NULL,
    requirements text,
    responsibilities text,
    benefits text,
    location character varying,
    employment_type character varying NOT NULL,
    salary_range character varying,
    work_schedule character varying,
    vacancies integer DEFAULT 1,
    status character varying DEFAULT 'draft'::character varying,
    published_at timestamp without time zone,
    closed_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    salary_min numeric(10,2),
    salary_max numeric(10,2),
    requires_disc boolean DEFAULT false,
    disc_timing character varying,
    ideal_disc_profile jsonb
);


--
-- TOC entry 288 (class 1259 OID 155696)
-- Name: job_openings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_openings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4289 (class 0 OID 0)
-- Dependencies: 288
-- Name: job_openings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_openings_id_seq OWNED BY public.job_openings.id;


--
-- TOC entry 315 (class 1259 OID 319490)
-- Name: job_requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_requirements (
    id integer NOT NULL,
    job_opening_id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    category character varying NOT NULL,
    requirement_type character varying NOT NULL,
    weight integer DEFAULT 1,
    proficiency_levels jsonb NOT NULL,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT job_requirements_category_check CHECK (((category)::text = ANY ((ARRAY['hard_skill'::character varying, 'soft_skill'::character varying, 'administrative'::character varying])::text[]))),
    CONSTRAINT job_requirements_requirement_type_check CHECK (((requirement_type)::text = ANY ((ARRAY['mandatory'::character varying, 'desirable'::character varying])::text[]))),
    CONSTRAINT job_requirements_weight_check CHECK (((weight >= 1) AND (weight <= 5)))
);


--
-- TOC entry 314 (class 1259 OID 319489)
-- Name: job_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_requirements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4290 (class 0 OID 0)
-- Dependencies: 314
-- Name: job_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_requirements_id_seq OWNED BY public.job_requirements.id;


--
-- TOC entry 235 (class 1259 OID 16597)
-- Name: job_training_tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_training_tracks (
    id integer NOT NULL,
    company_id integer NOT NULL,
    department_id integer,
    job_role character varying,
    course_id integer NOT NULL,
    is_required boolean DEFAULT false,
    days_to_complete integer DEFAULT 30,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 234 (class 1259 OID 16596)
-- Name: job_training_tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_training_tracks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4291 (class 0 OID 0)
-- Dependencies: 234
-- Name: job_training_tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_training_tracks_id_seq OWNED BY public.job_training_tracks.id;


--
-- TOC entry 319 (class 1259 OID 335873)
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    company_name character varying,
    message text,
    status character varying DEFAULT 'new'::character varying NOT NULL,
    source_channel character varying DEFAULT 'website'::character varying,
    utm_source character varying,
    utm_medium character varying,
    utm_campaign character varying,
    assigned_to character varying,
    company_id integer,
    follow_up_notes text,
    last_contacted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 318 (class 1259 OID 335872)
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4292 (class 0 OID 0)
-- Dependencies: 318
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- TOC entry 311 (class 1259 OID 311297)
-- Name: legal_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_files (
    id integer NOT NULL,
    company_id integer NOT NULL,
    type character varying NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    nsr_start integer,
    nsr_end integer,
    total_records integer DEFAULT 0,
    file_path text,
    sha256_hash character varying(64),
    crc_aggregate character varying,
    rep_identifier character varying DEFAULT 'REP-P-001'::character varying,
    generated_by character varying,
    generated_at timestamp without time zone DEFAULT now(),
    status character varying DEFAULT 'generated'::character varying,
    digital_signature_meta jsonb,
    description text
);


--
-- TOC entry 310 (class 1259 OID 311296)
-- Name: legal_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4293 (class 0 OID 0)
-- Dependencies: 310
-- Name: legal_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_files_id_seq OWNED BY public.legal_files.id;


--
-- TOC entry 313 (class 1259 OID 311310)
-- Name: legal_nsr_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_nsr_sequences (
    id integer NOT NULL,
    company_id integer NOT NULL,
    current_nsr integer DEFAULT 0 NOT NULL,
    rep_identifier character varying DEFAULT 'REP-P-001'::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 312 (class 1259 OID 311309)
-- Name: legal_nsr_sequences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_nsr_sequences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4294 (class 0 OID 0)
-- Dependencies: 312
-- Name: legal_nsr_sequences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_nsr_sequences_id_seq OWNED BY public.legal_nsr_sequences.id;


--
-- TOC entry 237 (class 1259 OID 16610)
-- Name: message_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_attachments (
    id integer NOT NULL,
    message_id integer NOT NULL,
    file_name character varying NOT NULL,
    original_name character varying NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying NOT NULL,
    file_path text NOT NULL,
    uploaded_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 236 (class 1259 OID 16609)
-- Name: message_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4295 (class 0 OID 0)
-- Dependencies: 236
-- Name: message_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_attachments_id_seq OWNED BY public.message_attachments.id;


--
-- TOC entry 239 (class 1259 OID 16620)
-- Name: message_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_categories (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    color character varying DEFAULT '#3B82F6'::character varying,
    company_id integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 238 (class 1259 OID 16619)
-- Name: message_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4296 (class 0 OID 0)
-- Dependencies: 238
-- Name: message_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_categories_id_seq OWNED BY public.message_categories.id;


--
-- TOC entry 241 (class 1259 OID 16632)
-- Name: message_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_recipients (
    id integer NOT NULL,
    message_id integer NOT NULL,
    user_id character varying NOT NULL,
    is_delivered boolean DEFAULT false,
    delivered_at timestamp without time zone,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 240 (class 1259 OID 16631)
-- Name: message_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4297 (class 0 OID 0)
-- Dependencies: 240
-- Name: message_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_recipients_id_seq OWNED BY public.message_recipients.id;


--
-- TOC entry 243 (class 1259 OID 16645)
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    company_id integer NOT NULL,
    sender_id character varying NOT NULL,
    category_id integer,
    subject character varying NOT NULL,
    content text NOT NULL,
    is_mass_message boolean DEFAULT false,
    priority character varying DEFAULT 'normal'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    sender_deleted boolean DEFAULT false,
    sender_deleted_at timestamp without time zone,
    target_type character varying,
    target_id integer,
    target_value character varying,
    related_document_id integer
);


--
-- TOC entry 242 (class 1259 OID 16644)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4298 (class 0 OID 0)
-- Dependencies: 242
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 245 (class 1259 OID 16658)
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    company_id integer NOT NULL,
    type character varying NOT NULL,
    title character varying NOT NULL,
    content text,
    related_id integer,
    related_type character varying,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    email_sent boolean DEFAULT false,
    email_sent_at timestamp without time zone,
    priority character varying DEFAULT 'normal'::character varying,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 244 (class 1259 OID 16657)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4299 (class 0 OID 0)
-- Dependencies: 244
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 291 (class 1259 OID 155710)
-- Name: onboarding_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_documents (
    id integer NOT NULL,
    onboarding_link_id integer NOT NULL,
    document_type character varying NOT NULL,
    file_name character varying NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type character varying,
    status character varying DEFAULT 'pending_review'::character varying,
    review_notes text,
    uploaded_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone,
    reviewed_by character varying
);


--
-- TOC entry 290 (class 1259 OID 155709)
-- Name: onboarding_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onboarding_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4300 (class 0 OID 0)
-- Dependencies: 290
-- Name: onboarding_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_documents_id_seq OWNED BY public.onboarding_documents.id;


--
-- TOC entry 293 (class 1259 OID 155721)
-- Name: onboarding_form_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_form_data (
    id integer NOT NULL,
    onboarding_link_id integer NOT NULL,
    personal_data jsonb,
    contact_data jsonb,
    bank_data jsonb,
    dependents jsonb,
    emergency_contact jsonb,
    contract_data jsonb,
    is_complete boolean DEFAULT false,
    submitted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 292 (class 1259 OID 155720)
-- Name: onboarding_form_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onboarding_form_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4301 (class 0 OID 0)
-- Dependencies: 292
-- Name: onboarding_form_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_form_data_id_seq OWNED BY public.onboarding_form_data.id;


--
-- TOC entry 295 (class 1259 OID 155735)
-- Name: onboarding_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_links (
    id integer NOT NULL,
    application_id integer NOT NULL,
    token character varying NOT NULL,
    candidate_name character varying NOT NULL,
    candidate_email character varying NOT NULL,
    candidate_phone character varying,
    "position" character varying NOT NULL,
    department character varying,
    start_date date,
    status character varying DEFAULT 'pending'::character varying,
    expires_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 294 (class 1259 OID 155734)
-- Name: onboarding_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onboarding_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4302 (class 0 OID 0)
-- Dependencies: 294
-- Name: onboarding_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_links_id_seq OWNED BY public.onboarding_links.id;


--
-- TOC entry 303 (class 1259 OID 270337)
-- Name: overtime_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.overtime_rules (
    id integer NOT NULL,
    department_id integer NOT NULL,
    shift_id integer,
    name character varying NOT NULL,
    overtime_type character varying NOT NULL,
    apply_to_weekdays boolean DEFAULT true,
    apply_to_weekends boolean DEFAULT false,
    apply_to_holidays boolean DEFAULT false,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 302 (class 1259 OID 270336)
-- Name: overtime_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.overtime_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4303 (class 0 OID 0)
-- Dependencies: 302
-- Name: overtime_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.overtime_rules_id_seq OWNED BY public.overtime_rules.id;


--
-- TOC entry 305 (class 1259 OID 270363)
-- Name: overtime_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.overtime_tiers (
    id integer NOT NULL,
    overtime_rule_id integer NOT NULL,
    min_hours numeric(4,2) NOT NULL,
    max_hours numeric(4,2),
    percentage integer NOT NULL,
    description character varying,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 304 (class 1259 OID 270362)
-- Name: overtime_tiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.overtime_tiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4304 (class 0 OID 0)
-- Dependencies: 304
-- Name: overtime_tiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.overtime_tiers_id_seq OWNED BY public.overtime_tiers.id;


--
-- TOC entry 265 (class 1259 OID 122881)
-- Name: rotation_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rotation_audit (
    id integer NOT NULL,
    template_id integer NOT NULL,
    action character varying NOT NULL,
    affected_users integer DEFAULT 0,
    date_range character varying,
    old_assignment_count integer DEFAULT 0,
    new_assignment_count integer DEFAULT 0,
    details jsonb,
    performed_by character varying NOT NULL,
    performed_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 264 (class 1259 OID 122880)
-- Name: rotation_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rotation_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4305 (class 0 OID 0)
-- Dependencies: 264
-- Name: rotation_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_audit_id_seq OWNED BY public.rotation_audit.id;


--
-- TOC entry 267 (class 1259 OID 122894)
-- Name: rotation_exceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rotation_exceptions (
    id integer NOT NULL,
    template_id integer,
    user_id character varying,
    exception_date date NOT NULL,
    original_shift_id integer,
    override_shift_id integer,
    reason character varying NOT NULL,
    notes text,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 266 (class 1259 OID 122893)
-- Name: rotation_exceptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rotation_exceptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4306 (class 0 OID 0)
-- Dependencies: 266
-- Name: rotation_exceptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_exceptions_id_seq OWNED BY public.rotation_exceptions.id;


--
-- TOC entry 269 (class 1259 OID 122904)
-- Name: rotation_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rotation_instances (
    id integer NOT NULL,
    template_id integer NOT NULL,
    cycle_number integer NOT NULL,
    effective_start date NOT NULL,
    effective_end date NOT NULL,
    status character varying DEFAULT 'active'::character varying,
    generated_at timestamp without time zone DEFAULT now(),
    generated_by character varying
);


--
-- TOC entry 268 (class 1259 OID 122903)
-- Name: rotation_instances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rotation_instances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4307 (class 0 OID 0)
-- Dependencies: 268
-- Name: rotation_instances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_instances_id_seq OWNED BY public.rotation_instances.id;


--
-- TOC entry 271 (class 1259 OID 122915)
-- Name: rotation_segments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rotation_segments (
    id integer NOT NULL,
    template_id integer NOT NULL,
    sequence_order integer NOT NULL,
    shift_id integer,
    name character varying NOT NULL,
    work_duration_hours numeric(4,2),
    rest_duration_hours numeric(4,2),
    days_of_week_mask integer[],
    consecutive_days integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 270 (class 1259 OID 122914)
-- Name: rotation_segments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rotation_segments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4308 (class 0 OID 0)
-- Dependencies: 270
-- Name: rotation_segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_segments_id_seq OWNED BY public.rotation_segments.id;


--
-- TOC entry 273 (class 1259 OID 122928)
-- Name: rotation_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rotation_templates (
    id integer NOT NULL,
    company_id integer NOT NULL,
    department_id integer,
    name character varying NOT NULL,
    description text,
    cadence_type character varying NOT NULL,
    cycle_length integer NOT NULL,
    starts_on character varying DEFAULT 'monday'::character varying,
    is_active boolean DEFAULT true,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 272 (class 1259 OID 122927)
-- Name: rotation_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rotation_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4309 (class 0 OID 0)
-- Dependencies: 272
-- Name: rotation_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_templates_id_seq OWNED BY public.rotation_templates.id;


--
-- TOC entry 275 (class 1259 OID 122941)
-- Name: rotation_user_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rotation_user_assignments (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    template_id integer NOT NULL,
    anchor_date date NOT NULL,
    starting_segment_order integer DEFAULT 1,
    active_instance_id integer,
    is_active boolean DEFAULT true,
    assigned_by character varying NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    deactivated_at timestamp without time zone,
    deactivated_by character varying
);


--
-- TOC entry 274 (class 1259 OID 122940)
-- Name: rotation_user_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rotation_user_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4310 (class 0 OID 0)
-- Dependencies: 274
-- Name: rotation_user_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_user_assignments_id_seq OWNED BY public.rotation_user_assignments.id;


--
-- TOC entry 255 (class 1259 OID 49165)
-- Name: sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sectors (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    latitude real NOT NULL,
    longitude real NOT NULL,
    radius integer DEFAULT 100
);


--
-- TOC entry 254 (class 1259 OID 49164)
-- Name: sectors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sectors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4311 (class 0 OID 0)
-- Dependencies: 254
-- Name: sectors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sectors_id_seq OWNED BY public.sectors.id;


--
-- TOC entry 297 (class 1259 OID 155748)
-- Name: selection_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.selection_stages (
    id integer NOT NULL,
    job_opening_id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    "order" integer NOT NULL,
    type character varying NOT NULL,
    is_required boolean DEFAULT true,
    duration_days integer DEFAULT 3,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 296 (class 1259 OID 155747)
-- Name: selection_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.selection_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4312 (class 0 OID 0)
-- Dependencies: 296
-- Name: selection_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.selection_stages_id_seq OWNED BY public.selection_stages.id;


--
-- TOC entry 326 (class 1259 OID 450560)
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 16670)
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 49177)
-- Name: supervisor_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisor_assignments (
    id integer NOT NULL,
    supervisor_id character varying NOT NULL,
    sector_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 256 (class 1259 OID 49176)
-- Name: supervisor_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisor_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4313 (class 0 OID 0)
-- Dependencies: 256
-- Name: supervisor_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisor_assignments_id_seq OWNED BY public.supervisor_assignments.id;


--
-- TOC entry 307 (class 1259 OID 270379)
-- Name: time_bank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_bank (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    company_id integer NOT NULL,
    balance_hours numeric(8,2) DEFAULT 0,
    total_credited numeric(8,2) DEFAULT 0,
    total_debited numeric(8,2) DEFAULT 0,
    expiration_date date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 306 (class 1259 OID 270378)
-- Name: time_bank_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_bank_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4314 (class 0 OID 0)
-- Dependencies: 306
-- Name: time_bank_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_bank_id_seq OWNED BY public.time_bank.id;


--
-- TOC entry 309 (class 1259 OID 270405)
-- Name: time_bank_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_bank_transactions (
    id integer NOT NULL,
    time_bank_id integer NOT NULL,
    user_id character varying NOT NULL,
    transaction_type character varying NOT NULL,
    hours numeric(6,2) NOT NULL,
    balance_after numeric(8,2) NOT NULL,
    time_entry_id integer,
    reason character varying NOT NULL,
    description text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 308 (class 1259 OID 270404)
-- Name: time_bank_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_bank_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4315 (class 0 OID 0)
-- Dependencies: 308
-- Name: time_bank_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_bank_transactions_id_seq OWNED BY public.time_bank_transactions.id;


--
-- TOC entry 248 (class 1259 OID 16678)
-- Name: time_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_entries (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    department_id integer NOT NULL,
    clock_in_time timestamp without time zone,
    clock_out_time timestamp without time zone,
    clock_in_latitude real,
    clock_in_longitude real,
    clock_out_latitude real,
    clock_out_longitude real,
    total_hours numeric(6,2),
    status character varying DEFAULT 'active'::character varying,
    face_recognition_verified boolean DEFAULT false,
    date character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    clock_in_photo_url character varying,
    clock_out_photo_url character varying,
    entry_type character varying DEFAULT 'automatic'::character varying,
    inserted_by character varying,
    approved_by character varying,
    approval_status character varying DEFAULT 'approved'::character varying,
    justification text,
    support_document_url character varying,
    regular_hours numeric(6,2) DEFAULT '0'::numeric,
    overtime_hours numeric(6,2) DEFAULT '0'::numeric,
    clock_in_ip_address character varying,
    clock_out_ip_address character varying,
    clock_in_within_geofence boolean,
    clock_out_within_geofence boolean,
    clock_in_shift_compliant boolean,
    clock_out_shift_compliant boolean,
    clock_in_validation_message text,
    clock_out_validation_message text,
    expected_hours numeric(6,2),
    late_minutes integer,
    shortfall_minutes integer,
    irregularity_reasons text[],
    device_id integer,
    overtime_rule_id integer,
    overtime_type character varying,
    overtime_breakdown jsonb,
    time_bank_hours numeric(6,2) DEFAULT 0
);


--
-- TOC entry 247 (class 1259 OID 16677)
-- Name: time_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4316 (class 0 OID 0)
-- Dependencies: 247
-- Name: time_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_entries_id_seq OWNED BY public.time_entries.id;


--
-- TOC entry 299 (class 1259 OID 212993)
-- Name: time_entry_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_entry_audit (
    id integer NOT NULL,
    time_entry_id integer NOT NULL,
    field_name character varying NOT NULL,
    old_value text,
    new_value text,
    justification text NOT NULL,
    edited_by character varying NOT NULL,
    ip_address character varying,
    created_at timestamp without time zone DEFAULT now(),
    attachment_url text
);


--
-- TOC entry 298 (class 1259 OID 212992)
-- Name: time_entry_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_entry_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4317 (class 0 OID 0)
-- Dependencies: 298
-- Name: time_entry_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_entry_audit_id_seq OWNED BY public.time_entry_audit.id;


--
-- TOC entry 259 (class 1259 OID 81921)
-- Name: time_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_periods (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying DEFAULT 'open'::character varying,
    closed_by character varying,
    closed_at timestamp without time zone,
    reopened_by character varying,
    reopened_at timestamp without time zone,
    reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 258 (class 1259 OID 81920)
-- Name: time_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4318 (class 0 OID 0)
-- Dependencies: 258
-- Name: time_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_periods_id_seq OWNED BY public.time_periods.id;


--
-- TOC entry 263 (class 1259 OID 114689)
-- Name: user_shift_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_shift_assignments (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    shift_id integer NOT NULL,
    start_date date,
    end_date date,
    assignment_type character varying DEFAULT 'permanent'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 262 (class 1259 OID 114688)
-- Name: user_shift_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_shift_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4319 (class 0 OID 0)
-- Dependencies: 262
-- Name: user_shift_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_shift_assignments_id_seq OWNED BY public.user_shift_assignments.id;


--
-- TOC entry 249 (class 1259 OID 16690)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'employee'::character varying,
    company_id integer,
    department_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    cpf character varying(14),
    rg character varying(20),
    rg_issuing_organ character varying(10),
    ctps character varying(20),
    pis_pasep character varying(15),
    titulo_eleitor character varying(15),
    birth_date date,
    marital_status character varying,
    gender character varying,
    nationality character varying DEFAULT 'Brasileira'::character varying,
    naturalness character varying,
    cep character varying(9),
    address text,
    address_number character varying(10),
    address_complement character varying,
    neighborhood character varying,
    city character varying,
    state character varying(2),
    country character varying DEFAULT 'Brasil'::character varying,
    personal_phone character varying(15),
    commercial_phone character varying(15),
    emergency_contact_name character varying,
    emergency_contact_phone character varying(15),
    emergency_contact_relationship character varying,
    "position" character varying,
    admission_date date,
    contract_type character varying,
    work_schedule character varying,
    salary numeric(10,2),
    benefits text,
    bank_code character varying(3),
    bank_name character varying,
    agency_number character varying(10),
    account_number character varying(20),
    account_type character varying,
    pix_key character varying,
    education_level character varying,
    institution character varying,
    course character varying,
    graduation_year integer,
    dependents jsonb,
    password_hash character varying,
    must_change_password boolean DEFAULT false,
    password_reset_token character varying,
    password_reset_expires timestamp without time zone,
    internal_id character varying(50)
);


--
-- TOC entry 3719 (class 2604 OID 319514)
-- Name: application_requirement_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_requirement_responses ALTER COLUMN id SET DEFAULT nextval('public.application_requirement_responses_id_seq'::regclass);


--
-- TOC entry 3642 (class 2604 OID 155652)
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- TOC entry 3579 (class 2604 OID 40964)
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- TOC entry 3681 (class 2604 OID 229380)
-- Name: authorized_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices ALTER COLUMN id SET DEFAULT nextval('public.authorized_devices_id_seq'::regclass);


--
-- TOC entry 3494 (class 2604 OID 16481)
-- Name: break_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.break_entries ALTER COLUMN id SET DEFAULT nextval('public.break_entries_id_seq'::regclass);


--
-- TOC entry 3648 (class 2604 OID 155665)
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- TOC entry 3497 (class 2604 OID 16492)
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- TOC entry 3500 (class 2604 OID 16505)
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- TOC entry 3636 (class 2604 OID 147460)
-- Name: course_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers ALTER COLUMN id SET DEFAULT nextval('public.course_answers_id_seq'::regclass);


--
-- TOC entry 3638 (class 2604 OID 147470)
-- Name: course_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_questions ALTER COLUMN id SET DEFAULT nextval('public.course_questions_id_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 16519)
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- TOC entry 3598 (class 2604 OID 98308)
-- Name: department_shift_breaks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shift_breaks ALTER COLUMN id SET DEFAULT nextval('public.department_shift_breaks_id_seq'::regclass);


--
-- TOC entry 3581 (class 2604 OID 49156)
-- Name: department_shifts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shifts ALTER COLUMN id SET DEFAULT nextval('public.department_shifts_id_seq'::regclass);


--
-- TOC entry 3510 (class 2604 OID 16532)
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- TOC entry 3730 (class 2604 OID 344079)
-- Name: disc_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_assessments ALTER COLUMN id SET DEFAULT nextval('public.disc_assessments_id_seq'::regclass);


--
-- TOC entry 3727 (class 2604 OID 344068)
-- Name: disc_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_questions ALTER COLUMN id SET DEFAULT nextval('public.disc_questions_id_seq'::regclass);


--
-- TOC entry 3738 (class 2604 OID 344118)
-- Name: disc_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_responses ALTER COLUMN id SET DEFAULT nextval('public.disc_responses_id_seq'::regclass);


--
-- TOC entry 3514 (class 2604 OID 16545)
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- TOC entry 3520 (class 2604 OID 16559)
-- Name: employee_courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses ALTER COLUMN id SET DEFAULT nextval('public.employee_courses_id_seq'::regclass);


--
-- TOC entry 3525 (class 2604 OID 16572)
-- Name: face_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles ALTER COLUMN id SET DEFAULT nextval('public.face_profiles_id_seq'::regclass);


--
-- TOC entry 3529 (class 2604 OID 16586)
-- Name: holidays id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays ALTER COLUMN id SET DEFAULT nextval('public.holidays_id_seq'::regclass);


--
-- TOC entry 3652 (class 2604 OID 155677)
-- Name: interview_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates ALTER COLUMN id SET DEFAULT nextval('public.interview_templates_id_seq'::regclass);


--
-- TOC entry 3656 (class 2604 OID 155689)
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- TOC entry 3659 (class 2604 OID 155700)
-- Name: job_openings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings ALTER COLUMN id SET DEFAULT nextval('public.job_openings_id_seq'::regclass);


--
-- TOC entry 3715 (class 2604 OID 319493)
-- Name: job_requirements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requirements ALTER COLUMN id SET DEFAULT nextval('public.job_requirements_id_seq'::regclass);


--
-- TOC entry 3535 (class 2604 OID 16600)
-- Name: job_training_tracks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks ALTER COLUMN id SET DEFAULT nextval('public.job_training_tracks_id_seq'::regclass);


--
-- TOC entry 3722 (class 2604 OID 335876)
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- TOC entry 3706 (class 2604 OID 311300)
-- Name: legal_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_files ALTER COLUMN id SET DEFAULT nextval('public.legal_files_id_seq'::regclass);


--
-- TOC entry 3711 (class 2604 OID 311313)
-- Name: legal_nsr_sequences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_nsr_sequences ALTER COLUMN id SET DEFAULT nextval('public.legal_nsr_sequences_id_seq'::regclass);


--
-- TOC entry 3540 (class 2604 OID 16613)
-- Name: message_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments ALTER COLUMN id SET DEFAULT nextval('public.message_attachments_id_seq'::regclass);


--
-- TOC entry 3542 (class 2604 OID 16623)
-- Name: message_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_categories ALTER COLUMN id SET DEFAULT nextval('public.message_categories_id_seq'::regclass);


--
-- TOC entry 3546 (class 2604 OID 16635)
-- Name: message_recipients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients ALTER COLUMN id SET DEFAULT nextval('public.message_recipients_id_seq'::regclass);


--
-- TOC entry 3551 (class 2604 OID 16648)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 3557 (class 2604 OID 16661)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3665 (class 2604 OID 155713)
-- Name: onboarding_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents ALTER COLUMN id SET DEFAULT nextval('public.onboarding_documents_id_seq'::regclass);


--
-- TOC entry 3668 (class 2604 OID 155724)
-- Name: onboarding_form_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data ALTER COLUMN id SET DEFAULT nextval('public.onboarding_form_data_id_seq'::regclass);


--
-- TOC entry 3672 (class 2604 OID 155738)
-- Name: onboarding_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links ALTER COLUMN id SET DEFAULT nextval('public.onboarding_links_id_seq'::regclass);


--
-- TOC entry 3687 (class 2604 OID 270340)
-- Name: overtime_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_rules ALTER COLUMN id SET DEFAULT nextval('public.overtime_rules_id_seq'::regclass);


--
-- TOC entry 3695 (class 2604 OID 270366)
-- Name: overtime_tiers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_tiers ALTER COLUMN id SET DEFAULT nextval('public.overtime_tiers_id_seq'::regclass);


--
-- TOC entry 3612 (class 2604 OID 122884)
-- Name: rotation_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit ALTER COLUMN id SET DEFAULT nextval('public.rotation_audit_id_seq'::regclass);


--
-- TOC entry 3617 (class 2604 OID 122897)
-- Name: rotation_exceptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions ALTER COLUMN id SET DEFAULT nextval('public.rotation_exceptions_id_seq'::regclass);


--
-- TOC entry 3619 (class 2604 OID 122907)
-- Name: rotation_instances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances ALTER COLUMN id SET DEFAULT nextval('public.rotation_instances_id_seq'::regclass);


--
-- TOC entry 3622 (class 2604 OID 122918)
-- Name: rotation_segments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments ALTER COLUMN id SET DEFAULT nextval('public.rotation_segments_id_seq'::regclass);


--
-- TOC entry 3627 (class 2604 OID 122931)
-- Name: rotation_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates ALTER COLUMN id SET DEFAULT nextval('public.rotation_templates_id_seq'::regclass);


--
-- TOC entry 3632 (class 2604 OID 122944)
-- Name: rotation_user_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments ALTER COLUMN id SET DEFAULT nextval('public.rotation_user_assignments_id_seq'::regclass);


--
-- TOC entry 3587 (class 2604 OID 49168)
-- Name: sectors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors ALTER COLUMN id SET DEFAULT nextval('public.sectors_id_seq'::regclass);


--
-- TOC entry 3675 (class 2604 OID 155751)
-- Name: selection_stages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selection_stages ALTER COLUMN id SET DEFAULT nextval('public.selection_stages_id_seq'::regclass);


--
-- TOC entry 3592 (class 2604 OID 49180)
-- Name: supervisor_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments ALTER COLUMN id SET DEFAULT nextval('public.supervisor_assignments_id_seq'::regclass);


--
-- TOC entry 3698 (class 2604 OID 270382)
-- Name: time_bank id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank ALTER COLUMN id SET DEFAULT nextval('public.time_bank_id_seq'::regclass);


--
-- TOC entry 3704 (class 2604 OID 270408)
-- Name: time_bank_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank_transactions ALTER COLUMN id SET DEFAULT nextval('public.time_bank_transactions_id_seq'::regclass);


--
-- TOC entry 3562 (class 2604 OID 16681)
-- Name: time_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries ALTER COLUMN id SET DEFAULT nextval('public.time_entries_id_seq'::regclass);


--
-- TOC entry 3679 (class 2604 OID 212996)
-- Name: time_entry_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit ALTER COLUMN id SET DEFAULT nextval('public.time_entry_audit_id_seq'::regclass);


--
-- TOC entry 3594 (class 2604 OID 81924)
-- Name: time_periods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods ALTER COLUMN id SET DEFAULT nextval('public.time_periods_id_seq'::regclass);


--
-- TOC entry 3607 (class 2604 OID 114692)
-- Name: user_shift_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments ALTER COLUMN id SET DEFAULT nextval('public.user_shift_assignments_id_seq'::regclass);


--
-- TOC entry 4249 (class 0 OID 319511)
-- Dependencies: 317
-- Data for Name: application_requirement_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.application_requirement_responses (id, application_id, requirement_id, proficiency_level, points_earned, created_at) FROM stdin;
\.


--
-- TOC entry 4213 (class 0 OID 155649)
-- Dependencies: 281
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applications (id, job_opening_id, candidate_id, status, current_stage_id, score, distance_km, cover_letter, applied_at, screening_notes, rejection_reason, updated_at, is_qualified, access_token) FROM stdin;
1	4	1	screening	\N	0	\N	teste	2025-10-10 18:05:34.984	\N	\N	2025-10-23 16:20:42.979	t	\N
2	13	2	test	\N	0	\N	Tenho 5 anos de experiência	2025-10-23 02:11:10.908	\N	\N	2025-10-29 19:18:01.872	t	\N
3	15	3	pending	\N	0	\N	Tenho grande interesse nesta vaga e acredito que meu perfil está alinhado com os requisitos.	2025-11-14 17:17:05.513	\N	\N	2025-11-14 17:17:05.531186	t	\N
4	15	4	applied	\N	24	\N	Final test	2025-11-14 17:39:09.181048	\N	\N	2025-11-14 17:39:09.47	t	37bc978cb088f569640354c4ddb241dfa91599ef7388dceaaabd03fc6b04343a
5	15	5	applied	\N	24	\N	Candidatura de teste com requisitos.	2025-11-14 17:43:49.456048	\N	\N	2025-11-14 17:43:49.724	t	eda54c27023b12a80680993146dd8f96895f0806bdecfb29514f0701eb83f509
6	20	6	applied	\N	0	\N	rgrsrgrstg	2025-11-15 05:08:44.9639	\N	\N	2025-11-15 05:08:44.9639	t	9b4d2d4b1888eaee38432f58aaa38f37180f413cd7772e2fbd629b567e70d1db
\.


--
-- TOC entry 4183 (class 0 OID 40961)
-- Dependencies: 251
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (id, action, performed_by, target_user_id, target_resource, company_id, details, ip_address, user_agent, success, error_message, created_at) FROM stdin;
22	time_entry_clock_in	test_user_123	test_user_123	6	2	"{\\"date\\":\\"2025-09-21\\",\\"clockInTime\\":\\"2025-09-21T08:27:43.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-09-21 11:27:43.536
23	time_entry_clock_out	test_user_123	test_user_123	6	2	"{\\"date\\":\\"2025-09-21\\",\\"clockOutTime\\":\\"2025-09-21T08:28:11.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"totalHours\\":\\"0.01\\"}"	\N	\N	t	\N	2025-09-21 11:28:11.588
24	time_entry_clock_in	test_user_123	test_user_123	7	2	"{\\"date\\":\\"2025-09-21\\",\\"clockInTime\\":\\"2025-09-21T10:50:47.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-09-21 13:50:47.67
25	create	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"templateName\\":\\"Rotação 12x36\\"}"	\N	\N	t	\N	2025-09-25 01:55:24.850955
26	generate_rotation	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"templateName\\":\\"Rotação 12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":0,\\"affectedUsers\\":0}"	\N	\N	t	\N	2025-09-25 01:56:43.503984
27	generate_rotation	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"templateName\\":\\"Rotação 12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":0,\\"affectedUsers\\":0}"	\N	\N	t	\N	2025-09-25 01:56:44.39993
28	update	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"oldTemplate\\":{\\"id\\":1,\\"companyId\\":2,\\"departmentId\\":null,\\"name\\":\\"Rotação 12x36\\",\\"description\\":\\"Template para esquema 12x36\\",\\"cadenceType\\":\\"daily\\",\\"cycleLength\\":30,\\"startsOn\\":\\"monday\\",\\"isActive\\":true,\\"createdBy\\":\\"emp_1758233488891_n83g7zh3w\\",\\"createdAt\\":\\"2025-09-25T01:55:24.784Z\\",\\"updatedAt\\":\\"2025-09-25T01:55:24.784Z\\"},\\"newTemplate\\":{\\"id\\":1,\\"companyId\\":2,\\"departmentId\\":null,\\"name\\":\\"Rotação 12x36\\",\\"description\\":\\"Template para esquema 12x36\\",\\"cadenceType\\":\\"daily\\",\\"cycleLength\\":30,\\"startsOn\\":\\"monday\\",\\"isActive\\":true,\\"createdBy\\":\\"emp_1758233488891_n83g7zh3w\\",\\"createdAt\\":\\"2025-09-25T01:55:24.784Z\\",\\"updatedAt\\":\\"2025-09-25T01:57:01.971Z\\"}}"	\N	\N	t	\N	2025-09-25 01:57:02.035748
29	generate_rotation	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"templateName\\":\\"Rotação 12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":0,\\"affectedUsers\\":0}"	\N	\N	t	\N	2025-09-25 01:58:08.956111
30	create	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\"}"	\N	\N	t	\N	2025-09-25 02:13:40.469893
31	delete	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"templateName\\":\\"Rotação 12x36\\"}"	\N	\N	t	\N	2025-09-25 02:13:49.95413
32	create	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"segmentName\\":\\"Turno Teste - Ordem 0\\",\\"templateId\\":2}"	\N	\N	t	\N	2025-09-25 20:05:14.977969
33	create	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"segmentName\\":\\"Normal - Ordem 1\\",\\"templateId\\":2}"	\N	\N	t	\N	2025-09-25 20:55:02.510499
34	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":0,\\"affectedUsers\\":0}"	\N	\N	t	\N	2025-09-25 20:55:11.890235
35	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":0,\\"affectedUsers\\":0}"	\N	\N	t	\N	2025-09-25 21:00:17.494472
36	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":0,\\"affectedUsers\\":0}"	\N	\N	t	\N	2025-09-25 21:05:12.541842
37	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 21:17:13.93213
38	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 22:06:37.064483
39	update	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"oldTemplate\\":{\\"id\\":2,\\"companyId\\":2,\\"departmentId\\":null,\\"name\\":\\"12x36\\",\\"description\\":\\"\\",\\"cadenceType\\":\\"daily\\",\\"cycleLength\\":30,\\"startsOn\\":\\"monday\\",\\"isActive\\":true,\\"createdBy\\":\\"emp_1758233488891_n83g7zh3w\\",\\"createdAt\\":\\"2025-09-25T02:13:40.403Z\\",\\"updatedAt\\":\\"2025-09-25T02:13:40.403Z\\"},\\"newTemplate\\":{\\"id\\":2,\\"companyId\\":2,\\"departmentId\\":null,\\"name\\":\\"12x36\\",\\"description\\":\\"\\",\\"cadenceType\\":\\"daily\\",\\"cycleLength\\":30,\\"startsOn\\":\\"monday\\",\\"isActive\\":true,\\"createdBy\\":\\"emp_1758233488891_n83g7zh3w\\",\\"createdAt\\":\\"2025-09-25T02:13:40.403Z\\",\\"updatedAt\\":\\"2025-09-25T22:06:44.650Z\\"}}"	\N	\N	t	\N	2025-09-25 22:06:44.716087
40	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 22:07:24.13484
41	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 22:07:26.086547
42	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 22:07:27.371523
43	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 22:07:28.567466
44	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 22:07:31.180835
45	generate_rotation	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\",\\"dateRange\\":\\"2025-09-25 to 2025-10-25\\",\\"generatedAssignments\\":93,\\"affectedUsers\\":3}"	\N	\N	t	\N	2025-09-25 22:18:25.743818
46	delete	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"templateName\\":\\"12x36\\"}"	\N	\N	t	\N	2025-09-25 22:21:37.728728
47	create	emp_1758233488891_n83g7zh3w	\N	3	2	"{\\"templateName\\":\\"12x36\\"}"	\N	\N	t	\N	2025-09-25 22:45:31.402811
48	create	emp_1758233488891_n83g7zh3w	\N	3	2	"{\\"segmentName\\":\\"Normal - Ordem 0\\",\\"templateId\\":3}"	\N	\N	t	\N	2025-09-25 22:45:48.969168
49	create	emp_1758233488891_n83g7zh3w	\N	4	2	"{\\"segmentName\\":\\"Administração - Ordem 1\\",\\"templateId\\":3}"	\N	\N	t	\N	2025-09-25 22:46:09.868509
50	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	8	2	"{\\"date\\":\\"2025-09-25\\",\\"clockInTime\\":\\"2025-09-25T22:43:43.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-09-26 01:43:43.566409
51	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	8	2	"{\\"date\\":\\"2025-09-25\\",\\"clockOutTime\\":\\"2025-09-25T22:48:20.000Z\\",\\"latitude\\":-33.441599983080835,\\"longitude\\":-70.63712012002638,\\"totalHours\\":\\"0.08\\"}"	\N	\N	t	\N	2025-09-26 01:48:20.516336
52	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	9	2	"{\\"date\\":\\"2025-09-25\\",\\"clockInTime\\":\\"2025-09-25T22:54:16.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-09-26 01:54:17.087855
53	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	9	2	"{\\"date\\":\\"2025-09-25\\",\\"clockOutTime\\":\\"2025-09-25T22:55:20.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"totalHours\\":\\"0.02\\"}"	\N	\N	t	\N	2025-09-26 01:55:20.539691
54	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	10	2	"{\\"date\\":\\"2025-09-25\\",\\"clockInTime\\":\\"2025-09-25T23:05:58.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-09-26 02:05:58.313234
55	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	10	2	"{\\"date\\":\\"2025-09-25\\",\\"clockOutTime\\":\\"2025-09-25T23:13:27.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"totalHours\\":\\"0.12\\"}"	\N	\N	t	\N	2025-09-26 02:13:27.532226
56	delete	emp_1758233488891_n83g7zh3w	\N	3	2	"{\\"segmentName\\":\\"Normal - Ordem 0\\",\\"templateId\\":3}"	\N	\N	t	\N	2025-09-26 06:48:51.618932
57	delete	emp_1758233488891_n83g7zh3w	\N	4	2	"{\\"segmentName\\":\\"Administração - Ordem 1\\",\\"templateId\\":3}"	\N	\N	t	\N	2025-09-26 06:48:53.133236
58	create	emp_1758233488891_n83g7zh3w	\N	5	2	"{\\"segmentName\\":\\"12x36 Medicos - Ordem 0\\",\\"templateId\\":3}"	\N	\N	t	\N	2025-09-26 06:55:20.82375
59	create	emp_1758233488891_n83g7zh3w	\N	6	2	"{\\"segmentName\\":\\"Folga 12x36 - Ordem 1\\",\\"templateId\\":3}"	\N	\N	t	\N	2025-09-26 06:55:37.311446
60	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	11	2	"{\\"date\\":\\"2025-09-29\\",\\"clockInTime\\":\\"2025-09-29T11:41:12.000Z\\",\\"latitude\\":-23.48398428774862,\\"longitude\\":-46.888173539983114,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-09-29 14:41:12.376218
61	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	11	2	"{\\"date\\":\\"2025-10-02\\",\\"clockOutTime\\":\\"2025-10-02T09:02:35.000Z\\",\\"latitude\\":-23.48404933843721,\\"longitude\\":-46.88799443909966,\\"totalHours\\":\\"69.36\\"}"	\N	\N	t	\N	2025-10-02 12:02:35.952624
62	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	12	2	"{\\"date\\":\\"2025-10-13\\",\\"clockInTime\\":\\"2025-10-13T09:56:09.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-13 12:56:09.290478
63	time_entry_manual_create	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	13	2	"{\\"date\\":\\"2025-10-13\\",\\"clockInTime\\":\\"2025-10-13T11:59:00.000Z\\",\\"clockOutTime\\":\\"2025-10-13T12:59:00.000Z\\",\\"justification\\":\\"Teste automático: ajuste de registro manual para finalizar saída.\\",\\"approvalStatus\\":\\"pending\\"}"	\N	\N	t	\N	2025-10-13 13:00:21.253998
64	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	12	2	"{\\"date\\":\\"2025-10-13\\",\\"clockOutTime\\":\\"2025-10-13T10:21:31.000Z\\",\\"latitude\\":-23.5505,\\"longitude\\":-46.6333,\\"totalHours\\":\\"0.42\\"}"	\N	\N	t	\N	2025-10-13 13:21:32.437532
65	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	14	2	"{\\"date\\":\\"2025-10-13\\",\\"clockInTime\\":\\"2025-10-13T11:26:57.000Z\\",\\"latitude\\":-23.48405787751958,\\"longitude\\":-46.888230203100896,\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-13 14:26:57.665907
66	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	15	2	"{\\"date\\":\\"2025-10-23\\",\\"clockInTime\\":\\"2025-10-23T16:22:58.213Z\\",\\"latitude\\":-23.4840623202991,\\"longitude\\":-46.8880883511687,\\"ipAddress\\":\\"10.81.12.33\\",\\"withinGeofence\\":true,\\"shiftCompliant\\":true,\\"validationMessages\\":\\"✓ Localização OK (99m do setor)\\\\n✓ Turno OK (Normal: 08:00 - 17:00)\\",\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-23 16:22:58.548671
67	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	15	2	"{\\"date\\":\\"2025-10-23\\",\\"clockOutTime\\":\\"2025-10-23T16:24:04.422Z\\",\\"latitude\\":-23.48410428590057,\\"longitude\\":-46.88841430915009,\\"ipAddress\\":\\"10.81.5.82\\",\\"withinGeofence\\":true,\\"shiftCompliant\\":true,\\"validationMessages\\":\\"✓ Localização OK (70m do setor)\\\\n✓ Turno OK (Normal: 08:00 - 17:00)\\",\\"totalHours\\":\\"0.02\\"}"	\N	\N	t	\N	2025-10-23 16:24:04.817479
68	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	16	2	"{\\"date\\":\\"2025-10-23\\",\\"clockInTime\\":\\"2025-10-23T23:00:35.974Z\\",\\"latitude\\":-23.484177353092825,\\"longitude\\":-46.88835761541496,\\"ipAddress\\":\\"10.81.6.27\\",\\"withinGeofence\\":true,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"✓ Localização OK (79m do setor)\\\\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 23:00)\\",\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-23 23:00:36.328057
69	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	16	2	"{\\"date\\":\\"2025-10-23\\",\\"clockOutTime\\":\\"2025-10-23T23:03:30.120Z\\",\\"latitude\\":-23.484050113247072,\\"longitude\\":-46.88839680363272,\\"ipAddress\\":\\"10.81.11.93\\",\\"withinGeofence\\":true,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"✓ Localização OK (69m do setor)\\\\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 23:03)\\",\\"totalHours\\":\\"0.05\\"}"	\N	\N	t	\N	2025-10-23 23:03:30.549464
70	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	17	2	"{\\"date\\":\\"2025-10-23\\",\\"clockInTime\\":\\"2025-10-24T00:23:26.190Z\\",\\"latitude\\":-23.4840202533617,\\"longitude\\":-46.88839119811074,\\"ipAddress\\":\\"10.81.9.56\\",\\"withinGeofence\\":true,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"✓ Localização OK (68m do setor)\\\\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 00:23)\\",\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-24 00:23:26.639918
71	time_entry_admin_edit	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	15	2	"{\\"originalEntry\\":{\\"clockInTime\\":\\"2025-10-23T16:22:58.213Z\\",\\"clockOutTime\\":\\"2025-10-23T16:24:04.422Z\\",\\"totalHours\\":\\"0.02\\"},\\"updatedEntry\\":{\\"clockInTime\\":\\"2025-10-23T08:00:00.000Z\\",\\"clockOutTime\\":\\"2025-10-23T16:24:00.000Z\\",\\"totalHours\\":\\"8.4\\"},\\"justification\\":\\"Atestado Medico\\",\\"targetUserId\\":\\"emp_1758233488891_n83g7zh3w\\",\\"targetUserEmail\\":\\"teste@teste.com\\",\\"targetUserName\\":\\"Teste teste\\",\\"date\\":\\"2025-10-23\\"}"	\N	\N	t	\N	2025-10-24 11:54:22.359168
72	time_entry_admin_edit	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	15	2	"{\\"originalEntry\\":{\\"clockInTime\\":\\"2025-10-23T08:00:00.000Z\\",\\"clockOutTime\\":\\"2025-10-23T16:24:00.000Z\\",\\"totalHours\\":\\"8.40\\"},\\"updatedEntry\\":{\\"clockInTime\\":\\"2025-10-23T05:00:00.000Z\\",\\"clockOutTime\\":\\"2025-10-23T10:24:00.000Z\\",\\"totalHours\\":\\"5.4\\"},\\"justification\\":\\"ajuste horario \\",\\"targetUserId\\":\\"emp_1758233488891_n83g7zh3w\\",\\"targetUserEmail\\":\\"teste@teste.com\\",\\"targetUserName\\":\\"Teste teste\\",\\"date\\":\\"2025-10-23\\"}"	\N	\N	t	\N	2025-10-24 13:08:07.115383
73	time_entry_admin_edit	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	15	2	"{\\"originalEntry\\":{\\"clockInTime\\":\\"2025-10-23T05:00:00.000Z\\",\\"clockOutTime\\":\\"2025-10-23T10:24:00.000Z\\",\\"totalHours\\":\\"5.40\\"},\\"updatedEntry\\":{\\"clockInTime\\":\\"2025-10-23T11:00:00.000Z\\",\\"clockOutTime\\":\\"2025-10-23T20:03:00.000Z\\",\\"totalHours\\":\\"9.05\\"},\\"justification\\":\\"aceerto ponto\\",\\"targetUserId\\":\\"emp_1758233488891_n83g7zh3w\\",\\"targetUserEmail\\":\\"teste@teste.com\\",\\"targetUserName\\":\\"Teste teste\\",\\"date\\":\\"2025-10-23\\"}"	\N	\N	t	\N	2025-10-24 13:58:20.617638
74	time_period_close	emp_1758233488891_n83g7zh3w	\N	1	2	"{\\"reason\\":\\"encerramento mensal\\",\\"closedBy\\":\\"emp_1758233488891_n83g7zh3w\\",\\"closedAt\\":\\"2025-10-24T17:13:10.540Z\\"}"	\N	\N	t	\N	2025-10-24 17:13:10.558312
75	time_period_create	emp_1758233488891_n83g7zh3w	\N	2	2	"{\\"name\\":\\"Outubro 2025\\",\\"startDate\\":\\"2025-10-24\\",\\"endDate\\":\\"2025-11-24\\",\\"status\\":\\"open\\"}"	\N	\N	t	\N	2025-10-24 17:13:48.857552
76	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	19	2	"{\\"date\\":\\"2025-10-25\\",\\"clockInTime\\":\\"2025-10-25T14:57:28.606Z\\",\\"latitude\\":-23.4908435,\\"longitude\\":-46.8779926,\\"ipAddress\\":\\"10.81.5.82\\",\\"withinGeofence\\":false,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"⚠ Fora da área permitida (1369m de distância, máximo: 300m)\\\\n⚠ Hoje não é dia de trabalho neste turno (Normal)\\",\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-25 14:57:29.11333
77	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	20	2	"{\\"date\\":\\"2025-10-28\\",\\"clockInTime\\":\\"2025-10-28T18:30:52.128Z\\",\\"latitude\\":-23.6104041,\\"longitude\\":-46.9999565,\\"ipAddress\\":\\"10.81.6.185\\",\\"withinGeofence\\":false,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"⚠ Fora da área permitida (18054m de distância, máximo: 300m)\\\\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 18:30)\\",\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-28 18:30:52.700971
78	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	20	2	"{\\"date\\":\\"2025-10-29\\",\\"clockOutTime\\":\\"2025-10-29T12:22:40.862Z\\",\\"latitude\\":-23.4916648,\\"longitude\\":-46.8779926,\\"ipAddress\\":\\"10.81.9.14\\",\\"withinGeofence\\":false,\\"shiftCompliant\\":true,\\"validationMessages\\":\\"⚠ Fora da área permitida (1423m de distância, máximo: 300m)\\\\n✓ Turno OK (Normal: 08:00 - 17:00)\\",\\"totalHours\\":\\"17.86\\"}"	\N	\N	t	\N	2025-10-29 12:22:41.271985
79	time_entry_admin_edit	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	20	2	"{\\"originalEntry\\":{\\"clockInTime\\":\\"2025-10-28T18:30:52.128Z\\",\\"clockOutTime\\":\\"2025-10-29T12:22:40.862Z\\",\\"totalHours\\":\\"17.86\\"},\\"updatedEntry\\":{\\"clockInTime\\":\\"2025-10-28T11:30:00.000Z\\",\\"clockOutTime\\":\\"2025-10-29T12:22:00.000Z\\",\\"totalHours\\":\\"24.87\\"},\\"justification\\":\\"acerto de ponto\\\\n\\",\\"targetUserId\\":\\"emp_1758233488891_n83g7zh3w\\",\\"targetUserEmail\\":\\"teste@teste.com\\",\\"targetUserName\\":\\"Teste teste\\",\\"date\\":\\"2025-10-28\\"}"	\N	\N	t	\N	2025-10-29 12:24:44.912568
80	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	21	2	"{\\"date\\":\\"2025-10-29\\",\\"clockInTime\\":\\"2025-10-29T13:30:28.977Z\\",\\"latitude\\":-23.4916648,\\"longitude\\":-46.8779926,\\"ipAddress\\":\\"10.81.12.156\\",\\"withinGeofence\\":false,\\"shiftCompliant\\":true,\\"validationMessages\\":\\"⚠ Fora da área permitida (1423m de distância, máximo: 300m)\\\\n✓ Turno OK (Normal: 08:00 - 17:00)\\",\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-10-29 13:30:29.424689
81	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	21	2	"{\\"date\\":\\"2025-10-29\\",\\"clockOutTime\\":\\"2025-10-29T19:21:22.338Z\\",\\"latitude\\":-23.4916648,\\"longitude\\":-46.8779926,\\"ipAddress\\":\\"10.81.5.171\\",\\"withinGeofence\\":false,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"⚠ Fora da área permitida (1423m de distância, máximo: 300m)\\\\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 19:21)\\",\\"totalHours\\":\\"5.85\\"}"	\N	\N	t	\N	2025-10-29 19:21:22.666193
82	time_entry_admin_edit	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	21	2	"{\\"originalEntry\\":{\\"clockInTime\\":\\"2025-10-29T13:30:28.977Z\\",\\"clockOutTime\\":\\"2025-10-29T19:21:22.338Z\\",\\"totalHours\\":\\"5.85\\"},\\"updatedEntry\\":{\\"clockInTime\\":\\"2025-10-29T11:00:00.000Z\\",\\"clockOutTime\\":\\"2025-10-29T19:21:00.000Z\\",\\"totalHours\\":\\"8.35\\"},\\"justification\\":\\"Comprovante de doação de sangue\\",\\"targetUserId\\":\\"emp_1758233488891_n83g7zh3w\\",\\"targetUserEmail\\":\\"teste@teste.com\\",\\"targetUserName\\":\\"Teste teste\\",\\"date\\":\\"2025-10-29\\"}"	\N	\N	t	\N	2025-10-29 19:24:27.181469
83	time_entry_clock_in	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	22	2	"{\\"date\\":\\"2025-11-13\\",\\"clockInTime\\":\\"2025-11-13T18:23:44.751Z\\",\\"latitude\\":-23.48399538814211,\\"longitude\\":-46.8882860216572,\\"ipAddress\\":\\"10.81.10.92\\",\\"withinGeofence\\":true,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"✓ Localização OK (78m do setor)\\\\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 18:23)\\",\\"faceRecognitionVerified\\":true}"	\N	\N	t	\N	2025-11-13 18:23:45.184899
84	time_entry_admin_edit	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	22	2	"{\\"originalEntry\\":{\\"clockInTime\\":\\"2025-11-13T18:23:44.751Z\\",\\"clockOutTime\\":null,\\"totalHours\\":null},\\"updatedEntry\\":{\\"clockInTime\\":\\"2025-11-13T11:00:00.000Z\\",\\"clockOutTime\\":null,\\"totalHours\\":null},\\"justification\\":\\"esqueceu de bater\\",\\"targetUserId\\":\\"emp_1758233488891_n83g7zh3w\\",\\"targetUserEmail\\":\\"teste@teste.com\\",\\"targetUserName\\":\\"Teste teste\\",\\"date\\":\\"2025-11-13\\"}"	\N	\N	t	\N	2025-11-13 18:25:50.656486
85	time_entry_clock_out	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	22	2	"{\\"date\\":\\"2025-11-13\\",\\"clockOutTime\\":\\"2025-11-13T21:59:04.586Z\\",\\"latitude\\":-23.483955018217394,\\"longitude\\":-46.88823132861818,\\"ipAddress\\":\\"10.81.4.60\\",\\"withinGeofence\\":true,\\"shiftCompliant\\":false,\\"validationMessages\\":\\"✓ Localização OK (83m do setor)\\\\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 21:59)\\",\\"totalHours\\":\\"10.98\\"}"	\N	\N	t	\N	2025-11-13 21:59:04.945023
\.


--
-- TOC entry 4233 (class 0 OID 229377)
-- Dependencies: 301
-- Data for Name: authorized_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.authorized_devices (id, device_code, device_name, company_id, sector_id, description, latitude, longitude, geofence_radius, is_active, last_used_at, created_at, updated_at, location, radius) FROM stdin;
2	TERM-5364	TJSP Barueri	2	\N	\N	-23.483833	-46.88903	100	t	2025-10-29 19:34:19.15	2025-10-24 19:49:50.68915	2025-10-25 11:33:59.612	Forum	170
1	TERM-6409	Terminal Teste E2E	2	\N	\N	-23.771029	-46.7318	100	t	\N	2025-10-24 19:45:30.471	2025-10-24 20:53:02.485	Recepção Teste	100
3	TERM-0201	Terminal Auth Test	2	\N	\N	-23.55686	-46.66141	100	t	2025-10-24 21:53:15.414	2025-10-24 21:03:30.664695	2025-10-24 21:03:30.664695	Auth Test Location	100
\.


--
-- TOC entry 4149 (class 0 OID 16478)
-- Dependencies: 217
-- Data for Name: break_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.break_entries (id, time_entry_id, break_start, break_end, duration, type, created_at) FROM stdin;
1	7	2025-09-21 13:51:08.229	2025-09-21 13:51:33.372	0.01	break	2025-09-21 13:51:08.247046
2	7	2025-09-21 13:51:56.983	2025-09-21 13:52:22.559	0.01	lunch	2025-09-21 13:51:57.000967
3	8	2025-09-26 01:47:11.058	2025-09-26 01:47:15.985	0.00	break	2025-09-26 01:47:11.076363
4	8	2025-09-26 01:47:18.074	2025-09-26 01:47:24.858	0.00	lunch	2025-09-26 01:47:18.090451
5	15	2025-10-23 16:23:34.959	2025-10-23 16:23:42.998	0.00	break	2025-10-23 16:23:34.97595
\.


--
-- TOC entry 4215 (class 0 OID 155662)
-- Dependencies: 283
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.candidates (id, company_id, name, email, phone, cpf, birth_date, address, city, state, zip_code, latitude, longitude, resume_url, linkedin_url, portfolio_url, skills, experience, education, source_channel, notes, status, created_at, updated_at) FROM stdin;
1	2	Jose joao silva	silvajose@gmail.com	55321321212	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-10-10 18:05:34.926227	2025-10-10 18:05:34.926227
2	2	João Silva Candidato	joao.candidato@email.com	(11) 98765-4321	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-10-23 02:11:10.873152	2025-10-23 02:11:10.873152
3	2	Maria Silva Test EJCX1Y	maria.silva.EJCX1Y@test.com	(11) 98765-4321	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-11-14 17:17:05.476243	2025-11-14 17:17:05.476243
4	2	Test User Final	final@test.com	11999999999	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-11-14 17:39:09.066431	2025-11-14 17:39:09.066431
5	2	Pedro Oliveira kWRV5a	pedro._ND4gr@test.com	(21) 98888-7777	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-11-14 17:43:49.337253	2025-11-14 17:43:49.337253
6	2	Dev	ivan@infosis.com.br	1199130850	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-11-15 05:08:44.86478	2025-11-15 05:08:44.86478
\.


--
-- TOC entry 4151 (class 0 OID 16489)
-- Dependencies: 219
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.certificates (id, user_id, course_id, company_id, certificate_number, title, issued_date, expiry_date, file_url, is_verified, verified_by, verified_at, metadata, created_at) FROM stdin;
1	43729966	3	1	CERT-1761218916942-43729966	Curso de Teste lScRFI	2025-10-23	\N	\N	f	\N	\N	{"score": 100, "completedAt": "2025-10-23T11:28:36.942Z", "passingScore": 70, "correctAnswers": 3, "totalQuestions": 3}	2025-10-23 11:28:36.960922
2	43729966	3	1	CERT-1761218955830-43729966	Curso de Teste lScRFI	2025-10-23	\N	\N	f	\N	\N	{"score": 100, "completedAt": "2025-10-23T11:29:15.830Z", "passingScore": 70, "correctAnswers": 3, "totalQuestions": 3}	2025-10-23 11:29:15.847436
3	emp_1758233488891_n83g7zh3w	2	2	CERT-1761236501426-emp_1758	segurança	2025-10-23	\N	\N	f	\N	\N	{"score": 100, "completedAt": "2025-10-23T16:21:41.426Z", "passingScore": 70, "correctAnswers": 2, "totalQuestions": 2}	2025-10-23 16:21:41.444126
4	emp_1758233488891_n83g7zh3w	7	2	CERT-1763058107363-emp_1758	segurança portaria	2025-11-13	\N	\N	f	\N	\N	{"score": 100, "completedAt": "2025-11-13T18:21:47.363Z", "passingScore": 70, "correctAnswers": 1, "totalQuestions": 1}	2025-11-13 18:21:47.382271
\.


--
-- TOC entry 4153 (class 0 OID 16502)
-- Dependencies: 221
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, cnpj, address, phone, email, logo_url, is_active, created_at, updated_at) FROM stdin;
1	Jota pé	00000000000000	Endereço não definido			\N	t	2025-09-13 14:36:29.290636	2025-09-15 14:52:15.781
2	Informa Comercial Sistemas	0056643900186		11981151349	ivan@infosis.com.br	\N	t	2025-09-13 18:44:26.519003	2025-09-18 18:55:59.855
\.


--
-- TOC entry 4209 (class 0 OID 147457)
-- Dependencies: 277
-- Data for Name: course_answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_answers (id, employee_course_id, question_id, answer, is_correct, created_at) FROM stdin;
2	4	2	4	t	2025-10-23 10:44:32.935818
3	4	4	Brasília	t	2025-10-23 10:44:32.997784
4	4	5	Deixar no ármario	f	2025-10-23 10:44:33.044902
5	4	2	4	t	2025-10-23 10:44:44.792507
6	4	4	Brasília	t	2025-10-23 10:44:44.846658
7	4	5	Deixar no ármario	f	2025-10-23 10:44:44.893231
8	4	2	4	t	2025-10-23 11:13:26.523694
9	4	4	Brasília	t	2025-10-23 11:13:26.582932
10	4	5	Deixar no ármario	f	2025-10-23 11:13:26.627804
11	4	2	4	t	2025-10-23 11:28:36.720246
12	4	4	Brasília	t	2025-10-23 11:28:36.774956
13	4	5	protegendo meus olhos	t	2025-10-23 11:28:36.82142
14	4	2	4	t	2025-10-23 11:29:15.617237
15	4	4	Brasília	t	2025-10-23 11:29:15.666382
16	4	5	protegendo meus olhos	t	2025-10-23 11:29:15.712951
17	2	6	Azul	t	2025-10-23 16:21:41.258032
18	2	8	Brasília	t	2025-10-23 16:21:41.308756
19	6	11	errado	t	2025-11-13 18:21:47.236343
\.


--
-- TOC entry 4211 (class 0 OID 147467)
-- Dependencies: 279
-- Data for Name: course_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_questions (id, course_id, question, question_type, options, correct_answer, "order", created_at) FROM stdin;
2	3	Quanto é 2+2?	multiple_choice	["3", "4", "5", "6"]	4	0	2025-10-08 18:39:26.09721
4	3	Qual é a capital do Brasil?	multiple_choice	["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"]	Brasília	0	2025-10-08 19:32:06.408218
5	3	Como usar o óculos de EPI	multiple_choice	["na bolsa", "colocar na cabeça ", "protegendo meus olhos", "Deixar no ármario"]	protegendo meus olhos	0	2025-10-08 19:39:39.700435
6	2	Qual é a cor do céu?	multiple_choice	["Azul", "Verde", "Vermelho", "Amarelo"]	Azul	0	2025-10-08 19:44:43.550064
8	2	Qual é a capital do Brasil?	multiple_choice	["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"]	Brasília	0	2025-10-08 20:08:08.954034
9	6	Teste	multiple_choice	["teste1", "teste2", "teste3"]	teste2	0	2025-10-23 12:21:44.305828
10	6	o que	multiple_choice	["oque1", "o que 2"]	o que 2	0	2025-10-23 12:22:07.13609
11	7	atender falando alto	multiple_choice	["correto", "errado"]	errado	0	2025-10-29 19:16:20.410069
\.


--
-- TOC entry 4155 (class 0 OID 16516)
-- Dependencies: 223
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, company_id, title, description, category, duration, is_required, external_url, certificate_template, passing_score, validity_period, is_active, created_at, updated_at, video_url) FROM stdin;
1	2	teste	teste	\N	15	f	\N	\N	\N	\N	t	2025-10-08 16:13:57.757676	2025-10-08 16:13:57.757676	\N
2	2	segurança	teste	\N	20	f	\N	\N	70	\N	t	2025-10-08 16:21:38.739223	2025-10-08 16:21:38.739223	https://www.youtube.com/watch?v=EGQ4nm4Fpvs
3	1	Curso de Teste lScRFI	Descrição do curso de teste	\N	60	f	\N	\N	70	\N	t	2025-10-08 18:34:35.282188	2025-10-08 18:34:35.282188	https://www.youtube.com/watch?v=dQw4w9WgXcQ
4	2	teste2	teste 2	\N	50	f	\N	\N	70	\N	t	2025-10-08 20:48:24.725078	2025-10-08 20:48:24.725078	
5	1	Teste	teste	\N	15	t	\N	\N	75	\N	t	2025-10-23 11:27:15.636947	2025-10-23 11:27:15.636947	https://www.youtube.com/watch?v=EGQ4nm4Fpvs
6	1	TESTE	Teste	\N	20	t	\N	\N	70	\N	t	2025-10-23 12:21:19.818806	2025-10-23 12:21:19.818806	
7	2	segurança portaria	ddagfdsgddsfggd	\N	60	f	\N	\N	70	\N	t	2025-10-29 19:15:34.38451	2025-10-29 19:15:34.38451	
\.


--
-- TOC entry 4193 (class 0 OID 98305)
-- Dependencies: 261
-- Data for Name: department_shift_breaks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_shift_breaks (id, shift_id, name, duration_minutes, is_paid, auto_deduct, scheduled_start, scheduled_end, min_work_minutes, tolerance_before_minutes, tolerance_after_minutes, is_active, created_at, updated_at) FROM stdin;
1	5	Almoço	60	f	t	\N	\N	360	0	0	t	2025-10-29 14:26:57.117795	2025-10-29 14:26:57.117795
2	10	Almoço	60	f	t	12:00	13:00	360	0	0	t	2025-10-29 15:27:36.757287	2025-10-29 15:27:36.757287
\.


--
-- TOC entry 4185 (class 0 OID 49153)
-- Dependencies: 253
-- Data for Name: department_shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_shifts (id, department_id, name, start_time, end_time, days_of_week, is_active, created_at, updated_at, break_start, break_end, tolerance_before_minutes, tolerance_after_minutes) FROM stdin;
10	2	Administração	08:00	17:30	{1,2,3,4,5}	t	2025-09-24 21:04:30.652544	2025-09-24 21:28:08.945	12:30	13:30	5	5
13	3	12x36 Medicos	07:00	19:00	{1,2,3,4,5}	t	2025-09-26 06:47:14.705688	2025-09-26 06:47:14.705688			5	5
14	3	Folga 12x36	00:00	00:00	{1,2,3,4,5}	t	2025-09-26 06:47:53.061295	2025-09-26 06:47:53.061295			5	5
5	2	Normal	08:00	17:00	{1,2,3,4,5}	t	2025-09-21 11:50:13.381013	2025-09-24 21:27:41.445	12:00	13:00	5	10
11	2	Turno Teste	09:00	18:00	{1,2,3,4,5}	t	2025-09-24 22:00:49.556067	2025-09-24 22:00:49.556067	12:00	13:00	15	10
\.


--
-- TOC entry 4157 (class 0 OID 16529)
-- Dependencies: 225
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, company_id, name, description, is_active, created_at, updated_at, sector_id) FROM stdin;
2	2	Financeiro	Fiinanceiro	t	2025-09-18 19:50:54.836286	2025-09-18 19:50:54.836286	2
3	2	Medicos	Medicos	t	2025-09-26 06:46:38.956083	2025-09-26 06:46:38.956083	4
4	2	Departamento Teste	Departamento para testes de validação	t	2025-10-24 19:38:13.108731	2025-10-24 19:38:13.108731	11
\.


--
-- TOC entry 4255 (class 0 OID 344076)
-- Dependencies: 323
-- Data for Name: disc_assessments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disc_assessments (id, application_id, candidate_id, job_opening_id, access_token, status, d_score, i_score, s_score, c_score, primary_profile, sent_at, started_at, completed_at, expires_at, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 4253 (class 0 OID 344065)
-- Dependencies: 321
-- Data for Name: disc_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disc_questions (id, question_text, profile_type, "order", is_active, created_at) FROM stdin;
2	Eu prefiro tomar decisões rápidas e assumir riscos calculados	D	1	t	2025-11-14 19:36:54.437467
3	Gosto de competições e de vencer desafios	D	2	t	2025-11-14 19:36:54.437467
4	Sou direto ao ponto e objetivo em minhas comunicações	D	3	t	2025-11-14 19:36:54.437467
5	Prefiro liderar projetos e tomar as decisões finais	D	4	t	2025-11-14 19:36:54.437467
6	Fico impaciente com processos lentos e burocráticos	D	5	t	2025-11-14 19:36:54.437467
7	Gosto de estabelecer metas ambiciosas e superá-las	D	6	t	2025-11-14 19:36:54.437467
8	Valorizo resultados acima de relacionamentos no trabalho	D	7	t	2025-11-14 19:36:54.437467
9	Gosto de trabalhar em equipe e interagir com pessoas	I	8	t	2025-11-14 19:36:54.437467
10	Sou entusiasmado e otimista na maioria das situações	I	9	t	2025-11-14 19:36:54.437467
11	Prefiro ambientes de trabalho dinâmicos e sociais	I	10	t	2025-11-14 19:36:54.437467
12	Sou bom em convencer e influenciar outras pessoas	I	11	t	2025-11-14 19:36:54.437467
13	Gosto de ser o centro das atenções em reuniões	I	12	t	2025-11-14 19:36:54.437467
14	Valorizo reconhecimento e feedback positivo	I	13	t	2025-11-14 19:36:54.437467
15	Prefiro comunicação verbal e presencial a e-mails	I	14	t	2025-11-14 19:36:54.437467
16	Prefiro rotinas estáveis e previsíveis no trabalho	S	15	t	2025-11-14 19:36:54.437467
17	Sou paciente e ouço atentamente os outros	S	16	t	2025-11-14 19:36:54.437467
18	Valorizo harmonia e evito conflitos sempre que possível	S	17	t	2025-11-14 19:36:54.437467
19	Gosto de trabalhar em ritmo constante e sem pressa	S	18	t	2025-11-14 19:36:54.437467
20	Sou leal e mantenho relacionamentos duradouros	S	19	t	2025-11-14 19:36:54.437467
21	Prefiro apoiar a equipe a liderar iniciativas	S	20	t	2025-11-14 19:36:54.437467
22	Me incomodo com mudanças súbitas e imprevisíveis	S	21	t	2025-11-14 19:36:54.437467
23	Valorizo precisão e atenção aos detalhes no trabalho	C	22	t	2025-11-14 19:36:54.437467
24	Prefiro seguir procedimentos e padrões estabelecidos	C	23	t	2025-11-14 19:36:54.437467
25	Analiso cuidadosamente antes de tomar decisões	C	24	t	2025-11-14 19:36:54.437467
26	Gosto de trabalhar com dados, números e informações técnicas	C	25	t	2025-11-14 19:36:54.437467
27	Prefiro trabalhar sozinho e com autonomia	C	26	t	2025-11-14 19:36:54.437467
28	Valorizo qualidade e correção acima de velocidade	C	27	t	2025-11-14 19:36:54.437467
29	Sigo regras e normas mesmo quando não concordo totalmente	C	28	t	2025-11-14 19:36:54.437467
\.


--
-- TOC entry 4257 (class 0 OID 344115)
-- Dependencies: 325
-- Data for Name: disc_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disc_responses (id, assessment_id, question_id, selected_value, created_at) FROM stdin;
\.


--
-- TOC entry 4159 (class 0 OID 16542)
-- Dependencies: 227
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, company_id, title, description, file_name, original_name, file_size, mime_type, file_path, category, uploaded_by, assigned_to, version, parent_document_id, is_active, expires_at, created_at, updated_at) FROM stdin;
1	2	rhnetp.jpg	Arquivo enviado: rhnetp.jpg	file-1759958892825-915648762.jpg	rhnetp.jpg	52113	image/jpeg	/home/runner/workspace/uploads/documents/file-1759958892825-915648762.jpg	general	emp_1758233488891_n83g7zh3w	test_user_123	1	\N	t	\N	2025-10-08 21:28:13.007018	2025-10-09 00:59:21.188
9	2	Termo de Responsabilidade.pdf	Arquivo enviado: Termo de Responsabilidade.pdf	file-1760020071806-856880503.pdf	Termo de Responsabilidade.pdf	70733	application/pdf	/home/runner/workspace/uploads/documents/file-1760020071806-856880503.pdf	general	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	1	\N	f	\N	2025-10-09 14:27:51.866659	2025-10-09 14:27:51.866659
4	2	buril.pdf	Arquivo enviado: buril.pdf	file-1760018601373-927535402.pdf	buril.pdf	192330	application/pdf	/home/runner/workspace/uploads/documents/file-1760018601373-927535402.pdf	general	emp_1758233488891_n83g7zh3w	emp_1758233488891_n83g7zh3w	1	\N	f	\N	2025-10-09 14:03:21.805684	2025-10-09 14:03:45.372
3	2	test-document.pdf	Arquivo enviado: test-document.pdf	file-1759972072955-568331472.pdf	test-document.pdf	39	application/pdf	/home/runner/workspace/uploads/documents/file-1759972072955-568331472.pdf	general	emp_1758233488891_n83g7zh3w	\N	1	\N	f	\N	2025-10-09 01:07:53.022927	2025-10-09 01:07:53.022927
2	2	rhnet.png	Arquivo enviado: rhnet.png	file-1759971568560-184161288.png	rhnet.png	702353	image/png	/home/runner/workspace/uploads/documents/file-1759971568560-184161288.png	general	emp_1758233488891_n83g7zh3w	\N	1	\N	f	\N	2025-10-09 00:59:29.198972	2025-10-09 00:59:29.198972
11	2	test-doc.pdf	Test document	test123.pdf	test-doc.pdf	1024	application/pdf	/uploads/test123.pdf	general	test_admin_8kGg9X5V	\N	1	\N	t	\N	2025-10-09 15:10:13.201034	2025-10-09 15:10:13.201034
12	2	test-doc (1).pdf	Duplicate test	file-1760022654063-344575834.pdf	test-doc.pdf	17	application/pdf	/home/runner/workspace/uploads/documents/file-1760022654063-344575834.pdf	general	emp_1758233488891_n83g7zh3w	\N	1	\N	t	\N	2025-10-09 15:10:54.180893	2025-10-09 15:10:54.180893
\.


--
-- TOC entry 4161 (class 0 OID 16556)
-- Dependencies: 229
-- Data for Name: employee_courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_courses (id, user_id, course_id, company_id, status, progress, score, started_at, completed_at, expires_at, certificate_url, validated_by, validated_at, notes, created_at, updated_at) FROM stdin;
3	emp_1758233488891_n83g7zh3w	4	2	not_started	0	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-23 01:08:59.41642	2025-10-23 01:10:04.39
5	43729966	5	1	completed	100	\N	2025-10-23 11:27:27.134	2025-10-23 11:27:31.026	\N	\N	\N	\N	\N	2025-10-23 11:27:27.152502	2025-10-23 11:27:31.026
4	43729966	3	1	completed	100	100	\N	2025-10-23 11:29:15.74	\N	\N	\N	\N	\N	2025-10-23 10:35:44.467583	2025-10-23 11:29:15.74
2	emp_1758233488891_n83g7zh3w	2	2	completed	100	100	2025-10-08 16:22:00.927	2025-10-23 16:21:41.337	\N	\N	\N	\N	\N	2025-10-08 16:22:00.946296	2025-10-23 16:21:41.337
1	emp_1758233488891_n83g7zh3w	1	2	not_started	0	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-08 16:14:02.16203	2025-10-24 14:50:00.663
6	emp_1758233488891_n83g7zh3w	7	2	completed	100	100	2025-11-13 18:21:36.923	2025-11-13 18:21:47.269	\N	\N	\N	\N	\N	2025-11-13 18:21:36.942747	2025-11-13 18:21:47.269
\.


--
-- TOC entry 4163 (class 0 OID 16569)
-- Dependencies: 231
-- Data for Name: face_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.face_profiles (id, user_id, face_data, is_active, created_at, updated_at) FROM stdin;
1	emp_1758233488891_n83g7zh3w	{"features": "mock_face_embedding_data", "timestamp": "2025-11-13T21:59:02.850Z", "confidence": 0.95}	t	2025-10-24 00:23:25.697939	2025-11-13 21:59:03.782
\.


--
-- TOC entry 4165 (class 0 OID 16583)
-- Dependencies: 233
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.holidays (id, company_id, name, date, type, is_recurring, description, is_active, created_at, updated_at) FROM stdin;
1	1	Dia do trabalho	2025-05-01	national	t		t	2025-10-23 01:00:32.865933	2025-10-23 01:00:32.865933
\.


--
-- TOC entry 4217 (class 0 OID 155674)
-- Dependencies: 285
-- Data for Name: interview_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interview_templates (id, company_id, name, description, type, questions, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4219 (class 0 OID 155686)
-- Dependencies: 287
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interviews (id, application_id, template_id, interviewer_ids, scheduled_at, location, meeting_url, status, feedback, rating, evaluation, completed_at, created_at) FROM stdin;
\.


--
-- TOC entry 4221 (class 0 OID 155697)
-- Dependencies: 289
-- Data for Name: job_openings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_openings (id, company_id, department_id, title, description, requirements, responsibilities, benefits, location, employment_type, salary_range, work_schedule, vacancies, status, published_at, closed_at, expires_at, created_by, created_at, updated_at, salary_min, salary_max, requires_disc, disc_timing, ideal_disc_profile) FROM stdin;
1	2	\N	Analista de RH RDIu07	Responsável por recrutamento e seleção	Experiência em RH, conhecimento em legislação trabalhista	\N	\N	São Paulo - SP	full_time	\N	\N	1	published	2025-10-10 14:59:42.399	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 14:57:58.099534	2025-10-10 14:59:42.399	\N	\N	f	\N	\N
2	2	\N	Desenvolvedor Full Stack W6vgz7	Desenvolvimento de aplicações web modernas	React, Node.js, PostgreSQL	\N	\N	Remote	full_time	\N	\N	1	published	2025-10-10 15:05:43.457	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 15:04:11.804293	2025-10-10 15:05:43.457	\N	\N	f	\N	\N
3	2	\N	Designer UX/UI JWygwp	Criação de interfaces e experiências de usuário	Figma, Design System, Prototipação	\N	\N	Híbrido - SP	full_time	\N	\N	1	published	2025-10-10 15:11:28.719	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 15:10:26.535901	2025-10-10 15:11:28.719	\N	\N	f	\N	\N
4	2	\N	Gerente de Projetos RFiEMY	Gestão de projetos de software	PMP, Agile, Scrum	\N	\N	São Paulo - SP	full_time	\N	\N	1	published	2025-10-10 15:18:44.627	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 15:17:45.912364	2025-10-10 15:18:44.627	\N	\N	f	\N	\N
5	2	\N	Analista de Sistemas Zht08I	Teste de criação de vaga	Conhecimento em React	\N	\N		internship	\N	\N	1	published	2025-10-10 21:57:21.002	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 21:42:30.171227	2025-10-10 21:59:05.061	\N	\N	f	\N	\N
8	2	\N	QA Engineer VZDZJH	Testing and quality assurance	Experience with automated testing	\N	\N		full_time	\N	\N	1	published	2025-10-10 22:05:57.355	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 22:02:54.003836	2025-10-10 22:05:57.355	\N	\N	f	\N	\N
9	2	\N	Tech Lead hGuyET	Technical leadership role	10+ years experience	\N	\N		full_time	\N	\N	1	published	\N	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 22:11:08.79112	2025-10-10 22:15:14.123	\N	\N	f	\N	\N
6	2	\N	Analista de Sistemas e_mrS_	Teste de criação de vaga	Conhecimento em React	\N	\N	São Paulo - SP	contract	\N	\N	1	published	2025-10-23 15:54:31.508	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 21:48:47.323218	2025-10-23 15:54:31.508	\N	\N	f	\N	\N
7	2	\N	Desenvolvedor Backend bIJwmQ	Desenvolvimento de APIs REST	Experiência com Node.js e PostgreSQL	\N	\N		contract	\N	\N	1	published	2025-10-23 15:54:37.054	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 21:55:21.435395	2025-10-23 15:54:37.054	\N	\N	f	\N	\N
16	1	\N	Desenvolvedor Full Stack	Desenvolver aplicações web modernas usando React e Node.js		\N	\N		full_time	\N	\N	1	draft	\N	\N	\N	test_admin_requirements	2025-11-14 14:49:19.943376	2025-11-14 14:49:19.943376	\N	\N	f	\N	\N
17	1	\N	Full Stack Developer	Build web applications		\N	\N		full_time	\N	\N	1	draft	\N	\N	\N	test_admin_requirements	2025-11-14 14:56:11.482982	2025-11-14 14:57:54.262	\N	\N	f	\N	\N
18	1	\N	QA Engineer Test	Quality assurance testing		\N	\N		full_time	\N	\N	1	draft	\N	\N	\N	test_admin_requirements	2025-11-14 15:03:04.234077	2025-11-14 15:07:09.108	\N	\N	f	\N	\N
20	2	\N	Dev Full Stack VL5yLV	Desenvolvedor com experiência em React e Node.js	Experiência em React, Node.js e bancos relacionais.	\N	\N	São Paulo - SP	full_time	\N	\N	1	published	2025-11-15 05:07:26.253	\N	\N	88a36c6c-fd42-4a54-9c55-e9f9f16ad10b	2025-11-15 04:46:46.880748	2025-11-15 05:12:29.816	6000.00	\N	f	\N	\N
11	2	\N	Desenvolvedor Full Stack (Teste)	Vaga para desenvolvedor experiente (teste automatizado)	Conhecimento em React e Node.js	\N	\N	São Paulo - SP	CLT	R$ 8.000 - R$ 12.000	\N	1	published	2025-11-14 16:50:05.090702	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-23 02:03:30.376415	2025-10-23 02:03:30.376415	\N	\N	f	\N	\N
13	2	\N	Desenvolvedor Full Stack	Vaga para desenvolvedor experiente	Conhecimento em React e Node.js	\N	\N	São Paulo - SP	CLT	R$ 8.000 - R$ 12.000	\N	1	published	2025-11-14 16:50:05.090702	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-23 02:08:47.272521	2025-10-23 02:08:47.272521	\N	\N	f	\N	\N
15	2	\N	Test Job 11 2025	Test Description	Test Requirements	\N	\N	Barueri SP	contract	R$ 5.000	\N	1	published	2025-11-14 16:46:55.100644	\N	\N	0wktYthnDhYK	2025-10-23 02:14:41.899167	2025-11-15 04:43:54.819	\N	\N	t	on_application	{"C": 75, "D": 50, "I": 50, "S": 75}
\.


--
-- TOC entry 4247 (class 0 OID 319490)
-- Dependencies: 315
-- Data for Name: job_requirements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_requirements (id, job_opening_id, title, description, category, requirement_type, weight, proficiency_levels, "order", created_at) FROM stdin;
1	17	Node.js	Backend runtime experience	hard_skill	desirable	3	[{"level": "Básico", "points": 1}, {"level": "Intermediário", "points": 3}, {"level": "Avançado", "points": 5}]	1	2025-11-14 14:56:11.724193
2	17	React		hard_skill	mandatory	3	[{"level": "Básico", "points": 1}, {"level": "Intermediário", "points": 3}, {"level": "Avançado", "points": 5}]	0	2025-11-14 14:56:13.861251
6	18	Selenium	Automation testing with Selenium	hard_skill	desirable	3	[{"level": "Básico", "points": 1}, {"level": "Intermediário", "points": 3}, {"level": "Avançado", "points": 5}]	0	2025-11-14 15:07:09.325183
7	18	Automation		hard_skill	desirable	3	[{"level": "Básico", "points": 1}, {"level": "Intermediário", "points": 3}, {"level": "Avançado", "points": 5}]	1	2025-11-14 15:07:09.325183
24	15	ter 5 anos de experiencia	experiencia em tal e tal	hard_skill	mandatory	3	[{"level": "Básico", "points": 1}, {"level": "Intermediário", "points": 3}, {"level": "Avançado", "points": 5}]	0	2025-11-15 04:43:55.225285
25	15	Implementar Sistema		hard_skill	desirable	3	[{"level": "Básico", "points": 1}, {"level": "Intermediário", "points": 3}, {"level": "Avançado", "points": 5}]	1	2025-11-15 04:43:55.225285
\.


--
-- TOC entry 4167 (class 0 OID 16597)
-- Dependencies: 235
-- Data for Name: job_training_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_training_tracks (id, company_id, department_id, job_role, course_id, is_required, days_to_complete, "order", created_at) FROM stdin;
\.


--
-- TOC entry 4251 (class 0 OID 335873)
-- Dependencies: 319
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, name, email, phone, company_name, message, status, source_channel, utm_source, utm_medium, utm_campaign, assigned_to, company_id, follow_up_notes, last_contacted_at, created_at, updated_at) FROM stdin;
2	Maria Santos Test	lead-bV8t9D_z@test.com	(21) 99876-5432	Tech Solutions LTDA	Quero saber mais sobre preços e funcionalidades	new	website	\N	\N	\N	\N	\N	\N	\N	2025-11-14 15:35:07.065975	2025-11-14 15:35:07.065975
3	Test User	test-toast-lPjjpO@test.com	(11) 98765-4321	Test Company	Teste automático para verificação de toast.	new	website	\N	\N	\N	\N	\N	\N	\N	2025-11-14 15:37:28.956455	2025-11-14 15:37:28.956455
6	Ivan Camargo	ivan@infosis.com.br	11981151349	Informa Comercial Sistemas	queremos implementar para 200 funcionários	new	website	\N	\N	\N	\N	\N	\N	\N	2025-11-14 16:22:23.171406	2025-11-14 16:22:23.171406
5	Toast Test User	success-l2GXYmt2@test.com			Teste de toast e envio de contato.	meeting_scheduled	website	\N	\N	\N	\N	\N	\N	\N	2025-11-14 15:43:45.173059	2025-11-14 18:51:05.64
4	Final Test User	final-test-VXcMvc@test.com			Teste automatizado - favor desconsiderar.	contacted	website	\N	\N	\N	\N	\N	\N	2025-11-14 18:51:35.459	2025-11-14 15:40:29.060556	2025-11-14 18:51:35.459
1	João Silva Test	test-ybMoMA@example.com	(11) 98765-4321	Empresa Teste LTDA	Gostaria de conhecer mais sobre o RHNet	lost	website	\N	\N	\N	\N	\N	\N	\N	2025-11-14 15:30:58.411586	2025-11-14 18:51:46.776
\.


--
-- TOC entry 4243 (class 0 OID 311297)
-- Dependencies: 311
-- Data for Name: legal_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_files (id, company_id, type, period_start, period_end, nsr_start, nsr_end, total_records, file_path, sha256_hash, crc_aggregate, rep_identifier, generated_by, generated_at, status, digital_signature_meta, description) FROM stdin;
\.


--
-- TOC entry 4245 (class 0 OID 311310)
-- Dependencies: 313
-- Data for Name: legal_nsr_sequences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_nsr_sequences (id, company_id, current_nsr, rep_identifier, updated_at) FROM stdin;
\.


--
-- TOC entry 4169 (class 0 OID 16610)
-- Dependencies: 237
-- Data for Name: message_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_attachments (id, message_id, file_name, original_name, file_size, mime_type, file_path, uploaded_by, created_at) FROM stdin;
\.


--
-- TOC entry 4171 (class 0 OID 16620)
-- Dependencies: 239
-- Data for Name: message_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_categories (id, name, description, color, company_id, is_active, created_at) FROM stdin;
1	Mensagens	\N	#EA580C	2	t	2025-10-08 13:03:16.83167
\.


--
-- TOC entry 4173 (class 0 OID 16632)
-- Dependencies: 241
-- Data for Name: message_recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_recipients (id, message_id, user_id, is_delivered, delivered_at, is_read, read_at, is_deleted, deleted_at, created_at) FROM stdin;
\.


--
-- TOC entry 4175 (class 0 OID 16645)
-- Dependencies: 243
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, company_id, sender_id, category_id, subject, content, is_mass_message, priority, created_at, updated_at, sender_deleted, sender_deleted_at, target_type, target_id, target_value, related_document_id) FROM stdin;
1	2	emp_1758233488891_n83g7zh3w	1	Curso	tds devem fazer	f	normal	2025-10-08 13:03:36.762928	2025-10-08 13:03:36.762928	f	\N	\N	\N	\N	\N
3	2	emp_1758233488891_n83g7zh3w	1	teste	teste 2	t	high	2025-10-08 13:29:23.374822	2025-10-08 13:29:23.374822	t	2025-10-08 15:18:37.66	\N	\N	\N	\N
2	2	emp_1758233488891_n83g7zh3w	1	teste	teste 2	t	high	2025-10-08 13:29:16.491151	2025-10-08 13:29:16.491151	t	2025-10-08 15:18:59.496	\N	\N	\N	\N
\.


--
-- TOC entry 4177 (class 0 OID 16658)
-- Dependencies: 245
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, company_id, type, title, content, related_id, related_type, is_read, read_at, email_sent, email_sent_at, priority, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 4223 (class 0 OID 155710)
-- Dependencies: 291
-- Data for Name: onboarding_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_documents (id, onboarding_link_id, document_type, file_name, file_url, file_size, mime_type, status, review_notes, uploaded_at, reviewed_at, reviewed_by) FROM stdin;
\.


--
-- TOC entry 4225 (class 0 OID 155721)
-- Dependencies: 293
-- Data for Name: onboarding_form_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_form_data (id, onboarding_link_id, personal_data, contact_data, bank_data, dependents, emergency_contact, contract_data, is_complete, submitted_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4227 (class 0 OID 155735)
-- Dependencies: 295
-- Data for Name: onboarding_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_links (id, application_id, token, candidate_name, candidate_email, candidate_phone, "position", department, start_date, status, expires_at, completed_at, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 4235 (class 0 OID 270337)
-- Dependencies: 303
-- Data for Name: overtime_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.overtime_rules (id, department_id, shift_id, name, overtime_type, apply_to_weekdays, apply_to_weekends, apply_to_holidays, is_active, priority, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4237 (class 0 OID 270363)
-- Dependencies: 305
-- Data for Name: overtime_tiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.overtime_tiers (id, overtime_rule_id, min_hours, max_hours, percentage, description, order_index, created_at) FROM stdin;
\.


--
-- TOC entry 4197 (class 0 OID 122881)
-- Dependencies: 265
-- Data for Name: rotation_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_audit (id, template_id, action, affected_users, date_range, old_assignment_count, new_assignment_count, details, performed_by, performed_at) FROM stdin;
\.


--
-- TOC entry 4199 (class 0 OID 122894)
-- Dependencies: 267
-- Data for Name: rotation_exceptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_exceptions (id, template_id, user_id, exception_date, original_shift_id, override_shift_id, reason, notes, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 4201 (class 0 OID 122904)
-- Dependencies: 269
-- Data for Name: rotation_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_instances (id, template_id, cycle_number, effective_start, effective_end, status, generated_at, generated_by) FROM stdin;
\.


--
-- TOC entry 4203 (class 0 OID 122915)
-- Dependencies: 271
-- Data for Name: rotation_segments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_segments (id, template_id, sequence_order, shift_id, name, work_duration_hours, rest_duration_hours, days_of_week_mask, consecutive_days, is_active, created_at, updated_at) FROM stdin;
5	3	0	13	12x36 Medicos - Ordem 0	\N	\N	\N	1	t	2025-09-26 06:55:20.752748	2025-09-26 06:55:20.752748
6	3	1	14	Folga 12x36 - Ordem 1	\N	\N	\N	1	t	2025-09-26 06:55:37.259652	2025-09-26 06:55:37.259652
\.


--
-- TOC entry 4205 (class 0 OID 122928)
-- Dependencies: 273
-- Data for Name: rotation_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_templates (id, company_id, department_id, name, description, cadence_type, cycle_length, starts_on, is_active, created_by, created_at, updated_at) FROM stdin;
3	2	\N	12x36		custom	3	monday	t	emp_1758233488891_n83g7zh3w	2025-09-25 22:45:31.323593	2025-09-25 22:45:31.323593
\.


--
-- TOC entry 4207 (class 0 OID 122941)
-- Dependencies: 275
-- Data for Name: rotation_user_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_user_assignments (id, user_id, template_id, anchor_date, starting_segment_order, active_instance_id, is_active, assigned_by, assigned_at, deactivated_at, deactivated_by) FROM stdin;
\.


--
-- TOC entry 4187 (class 0 OID 49165)
-- Dependencies: 255
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sectors (id, company_id, name, description, is_active, created_at, updated_at, latitude, longitude, radius) FROM stdin;
7	2	Setor Final K7otLd	Teste completo com refetch	t	2025-10-22 21:22:28.627425	2025-10-22 21:22:28.627425	-23.565016	-46.65177	250
8	2	Debug Test kfXm		t	2025-10-22 21:30:25.471415	2025-10-22 21:30:25.471415	0	0	100
2	2	Administração	ADM	t	2025-09-18 19:45:36.210981	2025-10-22 21:36:06.84	-23.483833	-46.88903	300
9	2	SW Fixed NdnCoR	Teste com Service Worker corrigido	t	2025-10-22 21:36:18.498313	2025-10-22 21:36:18.498313	-23.565016	-46.65177	100
10	2	Teste Coords AWj8		t	2025-10-22 21:42:27.818519	2025-10-22 21:42:27.818519	-23.565016	-46.65177	200
3	2	Escola Municipal JJ	JJ	t	2025-09-21 05:30:38.692107	2025-10-22 21:47:22.097	-23.483833	-46.88903	200
4	2	Medicos		t	2025-09-26 06:43:59.421871	2025-10-22 21:49:00.533	-23.48808	-46.89222	300
11	2	Setor Teste Geofence	Setor para testes de validação dupla	t	2025-10-24 19:38:04.007208	2025-10-24 19:38:04.007208	-23.5505	-46.6333	100
5	2	Setor Teste CEP HNSixQ		t	2025-10-22 21:01:35.687665	2025-10-28 18:34:38.205	-23.565016	-46.65177	340
6	2	Teste Layout 2cqs	Testando layout landscape	t	2025-10-22 21:16:40.495918	2025-10-29 12:29:42.527	-23.565016	-46.65177	350
\.


--
-- TOC entry 4229 (class 0 OID 155748)
-- Dependencies: 297
-- Data for Name: selection_stages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.selection_stages (id, job_opening_id, name, description, "order", type, is_required, duration_days, created_at) FROM stdin;
\.


--
-- TOC entry 4258 (class 0 OID 450560)
-- Dependencies: 326
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
QSO4AIfLeCYELfm0XC_CHRXPF1FwEpwF	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-23T21:58:38.838Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"emp_1758233488891_n83g7zh3w"}	2025-11-23 22:24:35
\.


--
-- TOC entry 4178 (class 0 OID 16670)
-- Dependencies: 246
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 4189 (class 0 OID 49177)
-- Dependencies: 257
-- Data for Name: supervisor_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisor_assignments (id, supervisor_id, sector_id, created_at) FROM stdin;
1	test_employee_001	2	2025-09-21 05:29:04.170131
2	test_employee_001	3	2025-09-21 05:30:56.23225
\.


--
-- TOC entry 4239 (class 0 OID 270379)
-- Dependencies: 307
-- Data for Name: time_bank; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_bank (id, user_id, company_id, balance_hours, total_credited, total_debited, expiration_date, created_at, updated_at) FROM stdin;
1	emp_1758233488891_n83g7zh3w	2	0.00	0.00	0.00	\N	2025-10-26 20:33:11.717771	2025-10-26 20:33:11.758
\.


--
-- TOC entry 4241 (class 0 OID 270405)
-- Dependencies: 309
-- Data for Name: time_bank_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_bank_transactions (id, time_bank_id, user_id, transaction_type, hours, balance_after, time_entry_id, reason, description, created_by, created_at) FROM stdin;
1	1	emp_1758233488891_n83g7zh3w	credit	0.00	0.00	\N	initial	Initial balance	emp_1758233488891_n83g7zh3w	2025-10-26 20:33:11.824268
\.


--
-- TOC entry 4180 (class 0 OID 16678)
-- Dependencies: 248
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_entries (id, user_id, department_id, clock_in_time, clock_out_time, clock_in_latitude, clock_in_longitude, clock_out_latitude, clock_out_longitude, total_hours, status, face_recognition_verified, date, created_at, updated_at, clock_in_photo_url, clock_out_photo_url, entry_type, inserted_by, approved_by, approval_status, justification, support_document_url, regular_hours, overtime_hours, clock_in_ip_address, clock_out_ip_address, clock_in_within_geofence, clock_out_within_geofence, clock_in_shift_compliant, clock_out_shift_compliant, clock_in_validation_message, clock_out_validation_message, expected_hours, late_minutes, shortfall_minutes, irregularity_reasons, device_id, overtime_rule_id, overtime_type, overtime_breakdown, time_bank_hours) FROM stdin;
16	emp_1758233488891_n83g7zh3w	2	2025-10-23 23:00:35.974	2025-10-23 23:03:30.12	-23.484177	-46.88836	-23.48405	-46.888397	0.05	completed	t	2025-10-23	2025-10-23 23:00:36.277642	2025-10-23 23:03:30.485	\N	\N	automatic	\N	\N	approved	\N	\N	0.05	0.00	10.81.6.27	10.81.11.93	t	t	f	f	✓ Localização OK (79m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 23:00)	✓ Localização OK (69m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 23:03)	\N	\N	\N	\N	\N	\N	\N	\N	0.00
21	emp_1758233488891_n83g7zh3w	2	2025-10-29 11:00:00	2025-10-29 19:21:00	-23.491665	-46.87799	-23.491665	-46.87799	8.35	completed	t	2025-10-29	2025-10-29 13:30:29.326356	2025-10-29 19:24:27.018	data:image/jpeg;base64,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	\N	automatic	\N	\N	approved	[EDITADO ADMIN]: Comprovante de doação de sangue	\N	7.35	0.00	10.81.12.156	10.81.5.171	f	f	t	f	⚠ Fora da área permitida (1423m de distância, máximo: 300m)\n✓ Turno OK (Normal: 08:00 - 17:00)	⚠ Fora da área permitida (1423m de distância, máximo: 300m)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 19:21)	\N	\N	\N	\N	\N	\N	\N	\N	0.00
15	emp_1758233488891_n83g7zh3w	2	2025-10-23 11:00:00	2025-10-23 20:03:00	-23.484062	-46.88809	-23.484104	-46.888412	9.05	completed	t	2025-10-23	2025-10-23 16:22:58.501964	2025-10-24 13:58:20.438	\N	\N	automatic	\N	\N	approved	[EDITADO ADMIN]: Atestado Medico\n[EDITADO ADMIN]: ajuste horario\n[EDITADO ADMIN]: aceerto ponto	\N	9.00	0.05	10.81.12.33	10.81.5.82	t	t	t	t	✓ Localização OK (99m do setor)\n✓ Turno OK (Normal: 08:00 - 17:00)	✓ Localização OK (70m do setor)\n✓ Turno OK (Normal: 08:00 - 17:00)	\N	\N	\N	\N	\N	\N	\N	\N	0.00
22	emp_1758233488891_n83g7zh3w	2	2025-11-13 11:00:00	2025-11-13 21:59:04.586	-23.483995	-46.888287	-23.483955	-46.888233	10.98	completed	t	2025-11-13	2025-11-13 18:23:45.122216	2025-11-13 21:59:04.876	data:image/jpeg;base64,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	\N	automatic	\N	\N	approved	[EDITADO ADMIN]: esqueceu de bater	\N	8.50	1.48	10.81.10.92	10.81.4.60	t	t	f	f	✓ Localização OK (78m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 18:23)	✓ Localização OK (83m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 21:59)	\N	\N	\N	\N	\N	\N	\N	\N	0.00
17	emp_1758233488891_n83g7zh3w	2	2025-10-24 00:23:26.19	2025-10-24 23:13:36.105	-23.48402	-46.88839	-23.484137	-46.888256	22.84	completed	t	2025-10-23	2025-10-24 00:23:26.545936	2025-10-24 23:13:36.105	data:image/jpeg;base64,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	\N	automatic	\N	\N	approved	\N	\N	0.00	0.00	10.81.9.56	\N	t	\N	f	\N	✓ Localização OK (68m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 00:23)	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00
18	emp_1758233488891_n83g7zh3w	2	2025-10-25 01:49:10.364	2025-10-25 02:04:52.586	-23.48404	-46.888317	-23.483854	-46.888786	0.26	completed	f	2025-10-25	2025-10-25 01:49:10.382531	2025-10-25 02:04:52.586	\N	data:image/jpeg;base64,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	automatic	\N	\N	approved	\N	\N	0.00	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	\N	\N	\N	0.00
19	emp_1758233488891_n83g7zh3w	2	2025-10-25 14:57:28.606	2025-10-25 15:03:02.562	-23.490843	-46.87799	-23.483856	-46.88879	0.09	completed	t	2025-10-25	2025-10-25 14:57:29.013643	2025-10-25 15:03:02.562	data:image/jpeg;base64,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	data:image/jpeg;base64,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	automatic	\N	\N	approved	\N	\N	0.00	0.00	10.81.5.82	\N	f	\N	f	\N	⚠ Fora da área permitida (1369m de distância, máximo: 300m)\n⚠ Hoje não é dia de trabalho neste turno (Normal)	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00
20	emp_1758233488891_n83g7zh3w	2	2025-10-28 11:30:00	2025-10-29 12:22:00	-23.610405	-46.999958	-23.491665	-46.87799	24.87	completed	t	2025-10-28	2025-10-28 18:30:52.590842	2025-10-29 12:24:44.738	data:image/jpeg;base64,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	\N	automatic	\N	\N	approved	[EDITADO ADMIN]: acerto de ponto	\N	9.00	15.87	10.81.6.185	10.81.9.14	f	f	f	t	⚠ Fora da área permitida (18054m de distância, máximo: 300m)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 18:30)	⚠ Fora da área permitida (1423m de distância, máximo: 300m)\n✓ Turno OK (Normal: 08:00 - 17:00)	\N	\N	\N	\N	\N	\N	\N	\N	0.00
\.


--
-- TOC entry 4231 (class 0 OID 212993)
-- Dependencies: 299
-- Data for Name: time_entry_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_entry_audit (id, time_entry_id, field_name, old_value, new_value, justification, edited_by, ip_address, created_at, attachment_url) FROM stdin;
1	15	clockInTime	2025-10-23T08:00:00.000Z	2025-10-23T05:00:00.000Z	ajuste horario 	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:08:07.014127	\N
2	15	clockOutTime	2025-10-23T16:24:00.000Z	2025-10-23T10:24:00.000Z	ajuste horario 	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:08:07.069488	\N
3	15	clockInTime	2025-10-23T05:00:00.000Z	2025-10-23T11:00:00.000Z	aceerto ponto	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:58:20.509703	/uploads/audit-attachments/comprovante-1761314299072-381212130.pdf
4	15	clockOutTime	2025-10-23T10:24:00.000Z	2025-10-23T20:03:00.000Z	aceerto ponto	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:58:20.569742	/uploads/audit-attachments/comprovante-1761314299072-381212130.pdf
5	20	clockInTime	2025-10-28T18:30:52.128Z	2025-10-28T11:30:00.000Z	acerto de ponto\n	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-29 12:24:44.81071	\N
6	20	clockOutTime	2025-10-29T12:22:40.862Z	2025-10-29T12:22:00.000Z	acerto de ponto\n	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-29 12:24:44.867709	\N
7	21	clockInTime	2025-10-29T13:30:28.977Z	2025-10-29T11:00:00.000Z	Comprovante de doação de sangue	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-29 19:24:27.088212	\N
8	21	clockOutTime	2025-10-29T19:21:22.338Z	2025-10-29T19:21:00.000Z	Comprovante de doação de sangue	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-29 19:24:27.140074	\N
9	22	clockInTime	2025-11-13T18:23:44.751Z	2025-11-13T11:00:00.000Z	esqueceu de bater	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-11-13 18:25:50.59478	\N
\.


--
-- TOC entry 4191 (class 0 OID 81921)
-- Dependencies: 259
-- Data for Name: time_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_periods (id, company_id, name, start_date, end_date, status, closed_by, closed_at, reopened_by, reopened_at, reason, created_at, updated_at) FROM stdin;
1	2	Setembro	2025-09-20	2025-10-20	closed	emp_1758233488891_n83g7zh3w	2025-10-24 17:13:10.49	emp_1758233488891_n83g7zh3w	2025-09-20 23:43:20.781	encerramento mensal	2025-09-20 23:42:46.857455	2025-10-24 17:13:10.49
2	2	Outubro 2025	2025-10-24	2025-11-24	open	\N	\N	\N	\N	\N	2025-10-24 17:13:48.809061	2025-10-24 17:13:48.809061
\.


--
-- TOC entry 4195 (class 0 OID 114689)
-- Dependencies: 263
-- Data for Name: user_shift_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_shift_assignments (id, user_id, shift_id, start_date, end_date, assignment_type, is_active, created_at, updated_at) FROM stdin;
656	test_employee_001	11	2025-09-25	2025-09-25	temporary	t	2025-09-25 22:18:21.549389	2025-09-25 22:18:21.549389
2	test_employee_001	5	2025-09-24	\N	permanent	t	2025-09-25 01:06:19.36653	2025-09-25 01:06:19.36653
3	emp_1758233488891_n83g7zh3w	5	2025-09-24	\N	permanent	t	2025-09-25 01:06:37.788306	2025-09-25 01:06:37.788306
657	test_user_123	5	2025-09-25	2025-09-25	temporary	t	2025-09-25 22:18:21.609724	2025-09-25 22:18:21.609724
658	emp_1758233488891_n83g7zh3w	11	2025-09-25	2025-09-25	temporary	t	2025-09-25 22:18:21.65521	2025-09-25 22:18:21.65521
659	test_employee_001	5	2025-09-26	2025-09-26	temporary	t	2025-09-25 22:18:21.700022	2025-09-25 22:18:21.700022
660	test_user_123	11	2025-09-26	2025-09-26	temporary	t	2025-09-25 22:18:21.744718	2025-09-25 22:18:21.744718
661	emp_1758233488891_n83g7zh3w	5	2025-09-26	2025-09-26	temporary	t	2025-09-25 22:18:21.789579	2025-09-25 22:18:21.789579
662	test_employee_001	11	2025-09-27	2025-09-27	temporary	t	2025-09-25 22:18:21.834259	2025-09-25 22:18:21.834259
663	test_user_123	5	2025-09-27	2025-09-27	temporary	t	2025-09-25 22:18:21.878754	2025-09-25 22:18:21.878754
664	emp_1758233488891_n83g7zh3w	11	2025-09-27	2025-09-27	temporary	t	2025-09-25 22:18:21.924379	2025-09-25 22:18:21.924379
665	test_employee_001	5	2025-09-28	2025-09-28	temporary	t	2025-09-25 22:18:21.967858	2025-09-25 22:18:21.967858
666	test_user_123	11	2025-09-28	2025-09-28	temporary	t	2025-09-25 22:18:22.012432	2025-09-25 22:18:22.012432
667	emp_1758233488891_n83g7zh3w	5	2025-09-28	2025-09-28	temporary	t	2025-09-25 22:18:22.057015	2025-09-25 22:18:22.057015
668	test_employee_001	11	2025-09-29	2025-09-29	temporary	t	2025-09-25 22:18:22.101602	2025-09-25 22:18:22.101602
669	test_user_123	5	2025-09-29	2025-09-29	temporary	t	2025-09-25 22:18:22.146579	2025-09-25 22:18:22.146579
670	emp_1758233488891_n83g7zh3w	11	2025-09-29	2025-09-29	temporary	t	2025-09-25 22:18:22.191975	2025-09-25 22:18:22.191975
671	test_employee_001	5	2025-09-30	2025-09-30	temporary	t	2025-09-25 22:18:22.236941	2025-09-25 22:18:22.236941
672	test_user_123	11	2025-09-30	2025-09-30	temporary	t	2025-09-25 22:18:22.281654	2025-09-25 22:18:22.281654
673	emp_1758233488891_n83g7zh3w	5	2025-09-30	2025-09-30	temporary	t	2025-09-25 22:18:22.32641	2025-09-25 22:18:22.32641
674	test_employee_001	11	2025-10-01	2025-10-01	temporary	t	2025-09-25 22:18:22.371742	2025-09-25 22:18:22.371742
675	test_user_123	5	2025-10-01	2025-10-01	temporary	t	2025-09-25 22:18:22.416663	2025-09-25 22:18:22.416663
676	emp_1758233488891_n83g7zh3w	11	2025-10-01	2025-10-01	temporary	t	2025-09-25 22:18:22.461257	2025-09-25 22:18:22.461257
677	test_employee_001	5	2025-10-02	2025-10-02	temporary	t	2025-09-25 22:18:22.505827	2025-09-25 22:18:22.505827
678	test_user_123	11	2025-10-02	2025-10-02	temporary	t	2025-09-25 22:18:22.551266	2025-09-25 22:18:22.551266
679	emp_1758233488891_n83g7zh3w	5	2025-10-02	2025-10-02	temporary	t	2025-09-25 22:18:22.594945	2025-09-25 22:18:22.594945
680	test_employee_001	11	2025-10-03	2025-10-03	temporary	t	2025-09-25 22:18:22.639786	2025-09-25 22:18:22.639786
681	test_user_123	5	2025-10-03	2025-10-03	temporary	t	2025-09-25 22:18:22.684614	2025-09-25 22:18:22.684614
682	emp_1758233488891_n83g7zh3w	11	2025-10-03	2025-10-03	temporary	t	2025-09-25 22:18:22.729321	2025-09-25 22:18:22.729321
683	test_employee_001	5	2025-10-04	2025-10-04	temporary	t	2025-09-25 22:18:22.774577	2025-09-25 22:18:22.774577
684	test_user_123	11	2025-10-04	2025-10-04	temporary	t	2025-09-25 22:18:22.819502	2025-09-25 22:18:22.819502
685	emp_1758233488891_n83g7zh3w	5	2025-10-04	2025-10-04	temporary	t	2025-09-25 22:18:22.864491	2025-09-25 22:18:22.864491
686	test_employee_001	11	2025-10-05	2025-10-05	temporary	t	2025-09-25 22:18:22.909217	2025-09-25 22:18:22.909217
687	test_user_123	5	2025-10-05	2025-10-05	temporary	t	2025-09-25 22:18:22.953031	2025-09-25 22:18:22.953031
688	emp_1758233488891_n83g7zh3w	11	2025-10-05	2025-10-05	temporary	t	2025-09-25 22:18:22.997727	2025-09-25 22:18:22.997727
689	test_employee_001	5	2025-10-06	2025-10-06	temporary	t	2025-09-25 22:18:23.042856	2025-09-25 22:18:23.042856
690	test_user_123	11	2025-10-06	2025-10-06	temporary	t	2025-09-25 22:18:23.087418	2025-09-25 22:18:23.087418
691	emp_1758233488891_n83g7zh3w	5	2025-10-06	2025-10-06	temporary	t	2025-09-25 22:18:23.132128	2025-09-25 22:18:23.132128
692	test_employee_001	11	2025-10-07	2025-10-07	temporary	t	2025-09-25 22:18:23.175895	2025-09-25 22:18:23.175895
693	test_user_123	5	2025-10-07	2025-10-07	temporary	t	2025-09-25 22:18:23.221448	2025-09-25 22:18:23.221448
694	emp_1758233488891_n83g7zh3w	11	2025-10-07	2025-10-07	temporary	t	2025-09-25 22:18:23.264879	2025-09-25 22:18:23.264879
695	test_employee_001	5	2025-10-08	2025-10-08	temporary	t	2025-09-25 22:18:23.309474	2025-09-25 22:18:23.309474
696	test_user_123	11	2025-10-08	2025-10-08	temporary	t	2025-09-25 22:18:23.354794	2025-09-25 22:18:23.354794
697	emp_1758233488891_n83g7zh3w	5	2025-10-08	2025-10-08	temporary	t	2025-09-25 22:18:23.400098	2025-09-25 22:18:23.400098
698	test_employee_001	11	2025-10-09	2025-10-09	temporary	t	2025-09-25 22:18:23.444492	2025-09-25 22:18:23.444492
699	test_user_123	5	2025-10-09	2025-10-09	temporary	t	2025-09-25 22:18:23.489346	2025-09-25 22:18:23.489346
700	emp_1758233488891_n83g7zh3w	11	2025-10-09	2025-10-09	temporary	t	2025-09-25 22:18:23.533865	2025-09-25 22:18:23.533865
701	test_employee_001	5	2025-10-10	2025-10-10	temporary	t	2025-09-25 22:18:23.578627	2025-09-25 22:18:23.578627
702	test_user_123	11	2025-10-10	2025-10-10	temporary	t	2025-09-25 22:18:23.62312	2025-09-25 22:18:23.62312
703	emp_1758233488891_n83g7zh3w	5	2025-10-10	2025-10-10	temporary	t	2025-09-25 22:18:23.668192	2025-09-25 22:18:23.668192
704	test_employee_001	11	2025-10-11	2025-10-11	temporary	t	2025-09-25 22:18:23.711907	2025-09-25 22:18:23.711907
705	test_user_123	5	2025-10-11	2025-10-11	temporary	t	2025-09-25 22:18:23.756452	2025-09-25 22:18:23.756452
706	emp_1758233488891_n83g7zh3w	11	2025-10-11	2025-10-11	temporary	t	2025-09-25 22:18:23.801048	2025-09-25 22:18:23.801048
707	test_employee_001	5	2025-10-12	2025-10-12	temporary	t	2025-09-25 22:18:23.845751	2025-09-25 22:18:23.845751
708	test_user_123	11	2025-10-12	2025-10-12	temporary	t	2025-09-25 22:18:23.902167	2025-09-25 22:18:23.902167
709	emp_1758233488891_n83g7zh3w	5	2025-10-12	2025-10-12	temporary	t	2025-09-25 22:18:23.946753	2025-09-25 22:18:23.946753
710	test_employee_001	11	2025-10-13	2025-10-13	temporary	t	2025-09-25 22:18:23.991789	2025-09-25 22:18:23.991789
711	test_user_123	5	2025-10-13	2025-10-13	temporary	t	2025-09-25 22:18:24.036906	2025-09-25 22:18:24.036906
712	emp_1758233488891_n83g7zh3w	11	2025-10-13	2025-10-13	temporary	t	2025-09-25 22:18:24.08155	2025-09-25 22:18:24.08155
713	test_employee_001	5	2025-10-14	2025-10-14	temporary	t	2025-09-25 22:18:24.126266	2025-09-25 22:18:24.126266
714	test_user_123	11	2025-10-14	2025-10-14	temporary	t	2025-09-25 22:18:24.17201	2025-09-25 22:18:24.17201
715	emp_1758233488891_n83g7zh3w	5	2025-10-14	2025-10-14	temporary	t	2025-09-25 22:18:24.216725	2025-09-25 22:18:24.216725
716	test_employee_001	11	2025-10-15	2025-10-15	temporary	t	2025-09-25 22:18:24.261981	2025-09-25 22:18:24.261981
717	test_user_123	5	2025-10-15	2025-10-15	temporary	t	2025-09-25 22:18:24.305905	2025-09-25 22:18:24.305905
718	emp_1758233488891_n83g7zh3w	11	2025-10-15	2025-10-15	temporary	t	2025-09-25 22:18:24.350973	2025-09-25 22:18:24.350973
719	test_employee_001	5	2025-10-16	2025-10-16	temporary	t	2025-09-25 22:18:24.399504	2025-09-25 22:18:24.399504
720	test_user_123	11	2025-10-16	2025-10-16	temporary	t	2025-09-25 22:18:24.444192	2025-09-25 22:18:24.444192
721	emp_1758233488891_n83g7zh3w	5	2025-10-16	2025-10-16	temporary	t	2025-09-25 22:18:24.48803	2025-09-25 22:18:24.48803
722	test_employee_001	11	2025-10-17	2025-10-17	temporary	t	2025-09-25 22:18:24.532563	2025-09-25 22:18:24.532563
723	test_user_123	5	2025-10-17	2025-10-17	temporary	t	2025-09-25 22:18:24.577011	2025-09-25 22:18:24.577011
724	emp_1758233488891_n83g7zh3w	11	2025-10-17	2025-10-17	temporary	t	2025-09-25 22:18:24.621486	2025-09-25 22:18:24.621486
725	test_employee_001	5	2025-10-18	2025-10-18	temporary	t	2025-09-25 22:18:24.666525	2025-09-25 22:18:24.666525
726	test_user_123	11	2025-10-18	2025-10-18	temporary	t	2025-09-25 22:18:24.711184	2025-09-25 22:18:24.711184
727	emp_1758233488891_n83g7zh3w	5	2025-10-18	2025-10-18	temporary	t	2025-09-25 22:18:24.755842	2025-09-25 22:18:24.755842
728	test_employee_001	11	2025-10-19	2025-10-19	temporary	t	2025-09-25 22:18:24.800367	2025-09-25 22:18:24.800367
729	test_user_123	5	2025-10-19	2025-10-19	temporary	t	2025-09-25 22:18:24.845181	2025-09-25 22:18:24.845181
730	emp_1758233488891_n83g7zh3w	11	2025-10-19	2025-10-19	temporary	t	2025-09-25 22:18:24.890092	2025-09-25 22:18:24.890092
731	test_employee_001	5	2025-10-20	2025-10-20	temporary	t	2025-09-25 22:18:24.934735	2025-09-25 22:18:24.934735
732	test_user_123	11	2025-10-20	2025-10-20	temporary	t	2025-09-25 22:18:24.979432	2025-09-25 22:18:24.979432
733	emp_1758233488891_n83g7zh3w	5	2025-10-20	2025-10-20	temporary	t	2025-09-25 22:18:25.024079	2025-09-25 22:18:25.024079
734	test_employee_001	11	2025-10-21	2025-10-21	temporary	t	2025-09-25 22:18:25.068761	2025-09-25 22:18:25.068761
735	test_user_123	5	2025-10-21	2025-10-21	temporary	t	2025-09-25 22:18:25.113265	2025-09-25 22:18:25.113265
736	emp_1758233488891_n83g7zh3w	11	2025-10-21	2025-10-21	temporary	t	2025-09-25 22:18:25.157868	2025-09-25 22:18:25.157868
737	test_employee_001	5	2025-10-22	2025-10-22	temporary	t	2025-09-25 22:18:25.202792	2025-09-25 22:18:25.202792
738	test_user_123	11	2025-10-22	2025-10-22	temporary	t	2025-09-25 22:18:25.247374	2025-09-25 22:18:25.247374
739	emp_1758233488891_n83g7zh3w	5	2025-10-22	2025-10-22	temporary	t	2025-09-25 22:18:25.291871	2025-09-25 22:18:25.291871
740	test_employee_001	11	2025-10-23	2025-10-23	temporary	t	2025-09-25 22:18:25.339876	2025-09-25 22:18:25.339876
741	test_user_123	5	2025-10-23	2025-10-23	temporary	t	2025-09-25 22:18:25.384427	2025-09-25 22:18:25.384427
742	emp_1758233488891_n83g7zh3w	11	2025-10-23	2025-10-23	temporary	t	2025-09-25 22:18:25.430864	2025-09-25 22:18:25.430864
743	test_employee_001	5	2025-10-24	2025-10-24	temporary	t	2025-09-25 22:18:25.47538	2025-09-25 22:18:25.47538
744	test_user_123	11	2025-10-24	2025-10-24	temporary	t	2025-09-25 22:18:25.518833	2025-09-25 22:18:25.518833
745	emp_1758233488891_n83g7zh3w	5	2025-10-24	2025-10-24	temporary	t	2025-09-25 22:18:25.563597	2025-09-25 22:18:25.563597
746	test_employee_001	11	2025-10-25	2025-10-25	temporary	t	2025-09-25 22:18:25.608397	2025-09-25 22:18:25.608397
747	test_user_123	5	2025-10-25	2025-10-25	temporary	t	2025-09-25 22:18:25.654049	2025-09-25 22:18:25.654049
748	emp_1758233488891_n83g7zh3w	11	2025-10-25	2025-10-25	temporary	t	2025-09-25 22:18:25.698662	2025-09-25 22:18:25.698662
749	test_employee_001	13	\N	\N	permanent	t	2025-10-22 22:10:26.271522	2025-10-22 22:10:26.271522
\.


--
-- TOC entry 4181 (class 0 OID 16690)
-- Dependencies: 249
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, company_id, department_id, is_active, created_at, updated_at, cpf, rg, rg_issuing_organ, ctps, pis_pasep, titulo_eleitor, birth_date, marital_status, gender, nationality, naturalness, cep, address, address_number, address_complement, neighborhood, city, state, country, personal_phone, commercial_phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, "position", admission_date, contract_type, work_schedule, salary, benefits, bank_code, bank_name, agency_number, account_number, account_type, pix_key, education_level, institution, course, graduation_year, dependents, password_hash, must_change_password, password_reset_token, password_reset_expires, internal_id) FROM stdin;
0wktYthnDhYK	teste+UkEErP@teste.com	Teste	Usuario	\N	admin	2	\N	t	2025-10-23 02:14:14.375797	2025-10-23 02:14:14.375797	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
usr_1758235005189_gi24wtxk4	novo@teste.com	Novo	Usuario	\N	superadmin	\N	\N	t	2025-09-18 22:36:45.210754	2025-09-21 01:25:30.074	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$deWV6cTnk6vhZyDa877cdw$DV413vzZiMAwR78jaMJ7sPNbpK6EC1Q/II3t325gtyc	t	\N	\N	\N
test_employee_001	teste@rhnet.com	João	Silva	\N	supervisor	2	2	t	2025-09-20 05:25:37.604684	2025-09-21 05:26:12.641	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$usWNhDtC2dUb/myLA+UZRA$Fi8ISukWnRjwLzV1+t6mZVnpBRbQ0ikUI1o2Zl4fMo8	f	\N	\N	\N
d4efc9d5-28a6-47d3-afbb-76152c88b74c	ivan@infosis.com.br	Ivan	Admin	\N	admin	2	\N	t	2025-11-15 14:53:38.404323	2025-11-16 22:02:17.697	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$0kAexa3ytKoXF/UyOr/SRA$r7Sq/36/zmcHUyoJW7A1xdfZxE4iqLGXjsYWLhPJ3uY	t	\N	\N	\N
28d967c9-b361-4baa-be0b-7cbbee072482	funcionario.teste@rhnet.com	Funcionário	Teste	\N	employee	2	4	t	2025-10-24 19:38:27.420191	2025-10-24 19:38:27.420191	98765432100	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$3rEFY5fYDEv19guzxFztlA$s0afyxc1IQUkJVNlaNR8H3lowMTDMf8HtuPo0ZMtrBs	f	\N	\N	\N
test_admin_requirements	test.requirements@admin.com	Test	Requirements	\N	admin	1	\N	t	2025-11-14 14:45:00.183243	2025-11-14 14:45:00.183243	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$cLPSsahl16fJoCJV2bmVZA$npfnIbWzQWgj2J6u4M2IJy7LcE10Uz+NsoDDOAqDRDQ	f	\N	\N	\N
88a36c6c-fd42-4a54-9c55-e9f9f16ad10b	admin.teste@rhnet.com	Admin	Teste	\N	admin	2	4	t	2025-10-24 19:37:16.346327	2025-10-24 19:37:16.346327	12345678901	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$6DX20D5OisT/O2cxNuksnQ$hXk7XCWuyK8l+2Schf9lEM2/bzFZTOviCqTv5z3bK6s	f	\N	\N	\N
usr_jQ7oPry43y08	testadmin_IHWv6z@rhnet.com	Test	Admin	\N	admin	1	\N	t	2025-10-08 18:30:07.285471	2025-10-08 18:32:09.028	123.456.789-00	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$7N5SxSB4ftVokuLWIEx++A$wL2ef/7gjTUi9JgM3qZqBaOuMp2/D9gvVlVvmjrYSmE	f	\N	\N	\N
emp_1758233488891_n83g7zh3w	teste@teste.com	Teste	teste	\N	superadmin	2	2	t	2025-09-18 22:11:28.911549	2025-10-08 20:14:42.049	143.555.520-12	1111111111	SSPSP	001			1991-01-01	solteiro	prefiro_nao_informar	Brasileira		06400-202	Rua Maria joana	5120		Centro	Barueri	SP	Brasil	(11) 98111-1111		AAAAA	(11) 99130-8502	maria	Auxiliar Financeiro	2020-01-01	clt	integral	2450.00		001	001	1234	134	corrente		medio			2025	\N	$argon2id$v=19$m=65536,t=3,p=1$JHK/qbQ5Ued++MwrSbHuAg$WZ2NCGAa0Xf4QBIwW2jdaIT2WssZbnYeLqJGzLapZGk	f	\N	\N	\N
test_admin_8kGg9X5V	test_E_FOEy@rhnet.com	Test	Admin	\N	admin	1	\N	t	2025-10-08 18:46:00.945834	2025-10-08 18:50:14.07	123.456.789-10	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$HTQc3gKLWbuXiPBz2A6xLw$9RdtAifn6/UDDYvpJ4HUPcwGyLNeE3dNdCo5ud+2bV0	f	\N	\N	\N
43729966	ivanmaracamargo@gmail.com	Ivan	Camargo	\N	superadmin	1	\N	t	2025-09-18 15:49:24.351369	2025-10-08 19:11:07.482	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$ZP/6YQVJDqoLetySFUKesw$XRDJp8Ow/yEUc4/SJLhY1M7vzSZpea8fSUZZRR5FTHY	f	\N	\N	\N
test_user_123	admin@teste.com	Admin	Teste	\N	admin	2	2	t	2025-09-19 06:39:49.925781	2025-09-25 01:47:14.69	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$GgGk+If9TvIP/hdTDNmWjg$4KPQqOfpdgdhr9q0d2yj5DvKNyZRSearFrePRgpcufg	f	\N	\N	\N
\.


--
-- TOC entry 4320 (class 0 OID 0)
-- Dependencies: 316
-- Name: application_requirement_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.application_requirement_responses_id_seq', 4, true);


--
-- TOC entry 4321 (class 0 OID 0)
-- Dependencies: 280
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applications_id_seq', 6, true);


--
-- TOC entry 4322 (class 0 OID 0)
-- Dependencies: 250
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 85, true);


--
-- TOC entry 4323 (class 0 OID 0)
-- Dependencies: 300
-- Name: authorized_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.authorized_devices_id_seq', 3, true);


--
-- TOC entry 4324 (class 0 OID 0)
-- Dependencies: 216
-- Name: break_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.break_entries_id_seq', 5, true);


--
-- TOC entry 4325 (class 0 OID 0)
-- Dependencies: 282
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.candidates_id_seq', 6, true);


--
-- TOC entry 4326 (class 0 OID 0)
-- Dependencies: 218
-- Name: certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.certificates_id_seq', 4, true);


--
-- TOC entry 4327 (class 0 OID 0)
-- Dependencies: 220
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.companies_id_seq', 8, true);


--
-- TOC entry 4328 (class 0 OID 0)
-- Dependencies: 276
-- Name: course_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.course_answers_id_seq', 19, true);


--
-- TOC entry 4329 (class 0 OID 0)
-- Dependencies: 278
-- Name: course_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.course_questions_id_seq', 11, true);


--
-- TOC entry 4330 (class 0 OID 0)
-- Dependencies: 222
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_id_seq', 7, true);


--
-- TOC entry 4331 (class 0 OID 0)
-- Dependencies: 260
-- Name: department_shift_breaks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_shift_breaks_id_seq', 2, true);


--
-- TOC entry 4332 (class 0 OID 0)
-- Dependencies: 252
-- Name: department_shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_shifts_id_seq', 14, true);


--
-- TOC entry 4333 (class 0 OID 0)
-- Dependencies: 224
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 4, true);


--
-- TOC entry 4334 (class 0 OID 0)
-- Dependencies: 322
-- Name: disc_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.disc_assessments_id_seq', 1, false);


--
-- TOC entry 4335 (class 0 OID 0)
-- Dependencies: 320
-- Name: disc_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.disc_questions_id_seq', 29, true);


--
-- TOC entry 4336 (class 0 OID 0)
-- Dependencies: 324
-- Name: disc_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.disc_responses_id_seq', 1, false);


--
-- TOC entry 4337 (class 0 OID 0)
-- Dependencies: 226
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 12, true);


--
-- TOC entry 4338 (class 0 OID 0)
-- Dependencies: 228
-- Name: employee_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_courses_id_seq', 6, true);


--
-- TOC entry 4339 (class 0 OID 0)
-- Dependencies: 230
-- Name: face_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.face_profiles_id_seq', 1, true);


--
-- TOC entry 4340 (class 0 OID 0)
-- Dependencies: 232
-- Name: holidays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.holidays_id_seq', 1, true);


--
-- TOC entry 4341 (class 0 OID 0)
-- Dependencies: 284
-- Name: interview_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interview_templates_id_seq', 1, false);


--
-- TOC entry 4342 (class 0 OID 0)
-- Dependencies: 286
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- TOC entry 4343 (class 0 OID 0)
-- Dependencies: 288
-- Name: job_openings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_openings_id_seq', 20, true);


--
-- TOC entry 4344 (class 0 OID 0)
-- Dependencies: 314
-- Name: job_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_requirements_id_seq', 25, true);


--
-- TOC entry 4345 (class 0 OID 0)
-- Dependencies: 234
-- Name: job_training_tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_training_tracks_id_seq', 1, false);


--
-- TOC entry 4346 (class 0 OID 0)
-- Dependencies: 318
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leads_id_seq', 6, true);


--
-- TOC entry 4347 (class 0 OID 0)
-- Dependencies: 310
-- Name: legal_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_files_id_seq', 1, false);


--
-- TOC entry 4348 (class 0 OID 0)
-- Dependencies: 312
-- Name: legal_nsr_sequences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_nsr_sequences_id_seq', 1, false);


--
-- TOC entry 4349 (class 0 OID 0)
-- Dependencies: 236
-- Name: message_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_attachments_id_seq', 1, false);


--
-- TOC entry 4350 (class 0 OID 0)
-- Dependencies: 238
-- Name: message_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_categories_id_seq', 1, true);


--
-- TOC entry 4351 (class 0 OID 0)
-- Dependencies: 240
-- Name: message_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_recipients_id_seq', 1, false);


--
-- TOC entry 4352 (class 0 OID 0)
-- Dependencies: 242
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 4, true);


--
-- TOC entry 4353 (class 0 OID 0)
-- Dependencies: 244
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 4354 (class 0 OID 0)
-- Dependencies: 290
-- Name: onboarding_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_documents_id_seq', 1, false);


--
-- TOC entry 4355 (class 0 OID 0)
-- Dependencies: 292
-- Name: onboarding_form_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_form_data_id_seq', 1, false);


--
-- TOC entry 4356 (class 0 OID 0)
-- Dependencies: 294
-- Name: onboarding_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_links_id_seq', 1, false);


--
-- TOC entry 4357 (class 0 OID 0)
-- Dependencies: 302
-- Name: overtime_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.overtime_rules_id_seq', 1, false);


--
-- TOC entry 4358 (class 0 OID 0)
-- Dependencies: 304
-- Name: overtime_tiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.overtime_tiers_id_seq', 1, false);


--
-- TOC entry 4359 (class 0 OID 0)
-- Dependencies: 264
-- Name: rotation_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_audit_id_seq', 1, false);


--
-- TOC entry 4360 (class 0 OID 0)
-- Dependencies: 266
-- Name: rotation_exceptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_exceptions_id_seq', 1, false);


--
-- TOC entry 4361 (class 0 OID 0)
-- Dependencies: 268
-- Name: rotation_instances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_instances_id_seq', 1, false);


--
-- TOC entry 4362 (class 0 OID 0)
-- Dependencies: 270
-- Name: rotation_segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_segments_id_seq', 6, true);


--
-- TOC entry 4363 (class 0 OID 0)
-- Dependencies: 272
-- Name: rotation_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_templates_id_seq', 3, true);


--
-- TOC entry 4364 (class 0 OID 0)
-- Dependencies: 274
-- Name: rotation_user_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_user_assignments_id_seq', 1, false);


--
-- TOC entry 4365 (class 0 OID 0)
-- Dependencies: 254
-- Name: sectors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sectors_id_seq', 11, true);


--
-- TOC entry 4366 (class 0 OID 0)
-- Dependencies: 296
-- Name: selection_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.selection_stages_id_seq', 1, false);


--
-- TOC entry 4367 (class 0 OID 0)
-- Dependencies: 256
-- Name: supervisor_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisor_assignments_id_seq', 2, true);


--
-- TOC entry 4368 (class 0 OID 0)
-- Dependencies: 306
-- Name: time_bank_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_bank_id_seq', 1, true);


--
-- TOC entry 4369 (class 0 OID 0)
-- Dependencies: 308
-- Name: time_bank_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_bank_transactions_id_seq', 1, true);


--
-- TOC entry 4370 (class 0 OID 0)
-- Dependencies: 247
-- Name: time_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_entries_id_seq', 22, true);


--
-- TOC entry 4371 (class 0 OID 0)
-- Dependencies: 298
-- Name: time_entry_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_entry_audit_id_seq', 9, true);


--
-- TOC entry 4372 (class 0 OID 0)
-- Dependencies: 258
-- Name: time_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_periods_id_seq', 2, true);


--
-- TOC entry 4373 (class 0 OID 0)
-- Dependencies: 262
-- Name: user_shift_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_shift_assignments_id_seq', 749, true);


--
-- TOC entry 3877 (class 2606 OID 319520)
-- Name: application_requirement_responses application_requirement_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_requirement_responses
    ADD CONSTRAINT application_requirement_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 3827 (class 2606 OID 155660)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- TOC entry 3792 (class 2606 OID 40969)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3853 (class 2606 OID 229390)
-- Name: authorized_devices authorized_devices_device_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_device_code_unique UNIQUE (device_code);


--
-- TOC entry 3855 (class 2606 OID 229388)
-- Name: authorized_devices authorized_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 16487)
-- Name: break_entries break_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.break_entries
    ADD CONSTRAINT break_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 3830 (class 2606 OID 155672)
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 16500)
-- Name: certificates certificates_certificate_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_number_unique UNIQUE (certificate_number);


--
-- TOC entry 3748 (class 2606 OID 16498)
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 16514)
-- Name: companies companies_cnpj_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_unique UNIQUE (cnpj);


--
-- TOC entry 3752 (class 2606 OID 16512)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 3822 (class 2606 OID 147465)
-- Name: course_answers course_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers
    ADD CONSTRAINT course_answers_pkey PRIMARY KEY (id);


--
-- TOC entry 3824 (class 2606 OID 147477)
-- Name: course_questions course_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_questions
    ADD CONSTRAINT course_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 16527)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3803 (class 2606 OID 98320)
-- Name: department_shift_breaks department_shift_breaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shift_breaks
    ADD CONSTRAINT department_shift_breaks_pkey PRIMARY KEY (id);


--
-- TOC entry 3794 (class 2606 OID 49163)
-- Name: department_shifts department_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shifts
    ADD CONSTRAINT department_shifts_pkey PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 16540)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 3886 (class 2606 OID 344092)
-- Name: disc_assessments disc_assessments_access_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_assessments
    ADD CONSTRAINT disc_assessments_access_token_key UNIQUE (access_token);


--
-- TOC entry 3888 (class 2606 OID 344090)
-- Name: disc_assessments disc_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_assessments
    ADD CONSTRAINT disc_assessments_pkey PRIMARY KEY (id);


--
-- TOC entry 3883 (class 2606 OID 344074)
-- Name: disc_questions disc_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_questions
    ADD CONSTRAINT disc_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 3891 (class 2606 OID 344121)
-- Name: disc_responses disc_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_responses
    ADD CONSTRAINT disc_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 3758 (class 2606 OID 16554)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 3761 (class 2606 OID 16567)
-- Name: employee_courses employee_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3764 (class 2606 OID 16579)
-- Name: face_profiles face_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 3766 (class 2606 OID 16581)
-- Name: face_profiles face_profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_user_id_unique UNIQUE (user_id);


--
-- TOC entry 3768 (class 2606 OID 16595)
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- TOC entry 3833 (class 2606 OID 155684)
-- Name: interview_templates interview_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates
    ADD CONSTRAINT interview_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3835 (class 2606 OID 155695)
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- TOC entry 3837 (class 2606 OID 155708)
-- Name: job_openings job_openings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_pkey PRIMARY KEY (id);


--
-- TOC entry 3874 (class 2606 OID 319503)
-- Name: job_requirements job_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requirements
    ADD CONSTRAINT job_requirements_pkey PRIMARY KEY (id);


--
-- TOC entry 3770 (class 2606 OID 16608)
-- Name: job_training_tracks job_training_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_pkey PRIMARY KEY (id);


--
-- TOC entry 3881 (class 2606 OID 335884)
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- TOC entry 3867 (class 2606 OID 311308)
-- Name: legal_files legal_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_files
    ADD CONSTRAINT legal_files_pkey PRIMARY KEY (id);


--
-- TOC entry 3869 (class 2606 OID 311322)
-- Name: legal_nsr_sequences legal_nsr_sequences_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_nsr_sequences
    ADD CONSTRAINT legal_nsr_sequences_company_id_key UNIQUE (company_id);


--
-- TOC entry 3871 (class 2606 OID 311320)
-- Name: legal_nsr_sequences legal_nsr_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_nsr_sequences
    ADD CONSTRAINT legal_nsr_sequences_pkey PRIMARY KEY (id);


--
-- TOC entry 3772 (class 2606 OID 16618)
-- Name: message_attachments message_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 3774 (class 2606 OID 16630)
-- Name: message_categories message_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_categories
    ADD CONSTRAINT message_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3776 (class 2606 OID 16643)
-- Name: message_recipients message_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients
    ADD CONSTRAINT message_recipients_pkey PRIMARY KEY (id);


--
-- TOC entry 3779 (class 2606 OID 16656)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3781 (class 2606 OID 16669)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3839 (class 2606 OID 155719)
-- Name: onboarding_documents onboarding_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents
    ADD CONSTRAINT onboarding_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 3841 (class 2606 OID 155733)
-- Name: onboarding_form_data onboarding_form_data_onboarding_link_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data
    ADD CONSTRAINT onboarding_form_data_onboarding_link_id_unique UNIQUE (onboarding_link_id);


--
-- TOC entry 3843 (class 2606 OID 155731)
-- Name: onboarding_form_data onboarding_form_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data
    ADD CONSTRAINT onboarding_form_data_pkey PRIMARY KEY (id);


--
-- TOC entry 3845 (class 2606 OID 155744)
-- Name: onboarding_links onboarding_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3847 (class 2606 OID 155746)
-- Name: onboarding_links onboarding_links_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_token_unique UNIQUE (token);


--
-- TOC entry 3857 (class 2606 OID 270351)
-- Name: overtime_rules overtime_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_rules
    ADD CONSTRAINT overtime_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 3859 (class 2606 OID 270372)
-- Name: overtime_tiers overtime_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_tiers
    ADD CONSTRAINT overtime_tiers_pkey PRIMARY KEY (id);


--
-- TOC entry 3807 (class 2606 OID 122892)
-- Name: rotation_audit rotation_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit
    ADD CONSTRAINT rotation_audit_pkey PRIMARY KEY (id);


--
-- TOC entry 3809 (class 2606 OID 122902)
-- Name: rotation_exceptions rotation_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_pkey PRIMARY KEY (id);


--
-- TOC entry 3811 (class 2606 OID 122913)
-- Name: rotation_instances rotation_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances
    ADD CONSTRAINT rotation_instances_pkey PRIMARY KEY (id);


--
-- TOC entry 3814 (class 2606 OID 122926)
-- Name: rotation_segments rotation_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments
    ADD CONSTRAINT rotation_segments_pkey PRIMARY KEY (id);


--
-- TOC entry 3817 (class 2606 OID 122939)
-- Name: rotation_templates rotation_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3819 (class 2606 OID 122951)
-- Name: rotation_user_assignments rotation_user_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 3796 (class 2606 OID 49175)
-- Name: sectors sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 3849 (class 2606 OID 155758)
-- Name: selection_stages selection_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selection_stages
    ADD CONSTRAINT selection_stages_pkey PRIMARY KEY (id);


--
-- TOC entry 3896 (class 2606 OID 450566)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3784 (class 2606 OID 16676)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- TOC entry 3798 (class 2606 OID 49185)
-- Name: supervisor_assignments supervisor_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments
    ADD CONSTRAINT supervisor_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 3861 (class 2606 OID 270391)
-- Name: time_bank time_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank
    ADD CONSTRAINT time_bank_pkey PRIMARY KEY (id);


--
-- TOC entry 3865 (class 2606 OID 270413)
-- Name: time_bank_transactions time_bank_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank_transactions
    ADD CONSTRAINT time_bank_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3863 (class 2606 OID 270393)
-- Name: time_bank time_bank_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank
    ADD CONSTRAINT time_bank_user_id_key UNIQUE (user_id);


--
-- TOC entry 3786 (class 2606 OID 16689)
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 3851 (class 2606 OID 213001)
-- Name: time_entry_audit time_entry_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit
    ADD CONSTRAINT time_entry_audit_pkey PRIMARY KEY (id);


--
-- TOC entry 3801 (class 2606 OID 81931)
-- Name: time_periods time_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_pkey PRIMARY KEY (id);


--
-- TOC entry 3893 (class 2606 OID 344123)
-- Name: disc_responses unique_disc_response; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_responses
    ADD CONSTRAINT unique_disc_response UNIQUE (assessment_id, question_id);


--
-- TOC entry 3879 (class 2606 OID 319522)
-- Name: application_requirement_responses unique_requirement_response; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_requirement_responses
    ADD CONSTRAINT unique_requirement_response UNIQUE (application_id, requirement_id);


--
-- TOC entry 3805 (class 2606 OID 114700)
-- Name: user_shift_assignments user_shift_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments
    ADD CONSTRAINT user_shift_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 3788 (class 2606 OID 16702)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3790 (class 2606 OID 16700)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3782 (class 1259 OID 16871)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- TOC entry 3825 (class 1259 OID 327680)
-- Name: access_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX access_token_idx ON public.applications USING btree (access_token);


--
-- TOC entry 3875 (class 1259 OID 319533)
-- Name: app_requirement_responses_application_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX app_requirement_responses_application_idx ON public.application_requirement_responses USING btree (application_id);


--
-- TOC entry 3884 (class 1259 OID 344113)
-- Name: disc_access_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disc_access_token_idx ON public.disc_assessments USING btree (access_token);


--
-- TOC entry 3889 (class 1259 OID 344134)
-- Name: disc_responses_assessment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disc_responses_assessment_idx ON public.disc_responses USING btree (assessment_id);


--
-- TOC entry 3894 (class 1259 OID 450567)
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_expire ON public.session USING btree (expire);


--
-- TOC entry 3872 (class 1259 OID 319509)
-- Name: job_requirements_job_opening_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_requirements_job_opening_idx ON public.job_requirements USING btree (job_opening_id);


--
-- TOC entry 3828 (class 1259 OID 155839)
-- Name: unique_application; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_application ON public.applications USING btree (job_opening_id, candidate_id);


--
-- TOC entry 3831 (class 1259 OID 155840)
-- Name: unique_candidate_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_candidate_email ON public.candidates USING btree (company_id, email);


--
-- TOC entry 3759 (class 1259 OID 16868)
-- Name: unique_document_version; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_document_version ON public.documents USING btree (company_id, title, version);


--
-- TOC entry 3777 (class 1259 OID 16870)
-- Name: unique_message_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_message_recipient ON public.message_recipients USING btree (message_id, user_id);


--
-- TOC entry 3799 (class 1259 OID 49264)
-- Name: unique_supervisor_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_supervisor_sector ON public.supervisor_assignments USING btree (supervisor_id, sector_id);


--
-- TOC entry 3812 (class 1259 OID 123047)
-- Name: unique_template_cycle; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_template_cycle ON public.rotation_instances USING btree (template_id, cycle_number);


--
-- TOC entry 3815 (class 1259 OID 123048)
-- Name: unique_template_sequence; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_template_sequence ON public.rotation_segments USING btree (template_id, sequence_order);


--
-- TOC entry 3762 (class 1259 OID 16869)
-- Name: unique_user_course_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_user_course_active ON public.employee_courses USING btree (user_id, course_id);


--
-- TOC entry 3820 (class 1259 OID 123049)
-- Name: unique_user_template_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_user_template_active ON public.rotation_user_assignments USING btree (user_id, template_id, is_active);


--
-- TOC entry 3995 (class 2606 OID 319523)
-- Name: application_requirement_responses app_req_responses_application_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_requirement_responses
    ADD CONSTRAINT app_req_responses_application_fk FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 3996 (class 2606 OID 319528)
-- Name: application_requirement_responses app_req_responses_requirement_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_requirement_responses
    ADD CONSTRAINT app_req_responses_requirement_fk FOREIGN KEY (requirement_id) REFERENCES public.job_requirements(id) ON DELETE CASCADE;


--
-- TOC entry 3966 (class 2606 OID 155764)
-- Name: applications applications_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 3967 (class 2606 OID 155759)
-- Name: applications applications_job_opening_id_job_openings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_opening_id_job_openings_id_fk FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- TOC entry 3931 (class 2606 OID 40980)
-- Name: audit_log audit_log_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- TOC entry 3932 (class 2606 OID 40970)
-- Name: audit_log audit_log_performed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_performed_by_users_id_fk FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3933 (class 2606 OID 40975)
-- Name: audit_log audit_log_target_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_target_user_id_users_id_fk FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3984 (class 2606 OID 229391)
-- Name: authorized_devices authorized_devices_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 3985 (class 2606 OID 229396)
-- Name: authorized_devices authorized_devices_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE SET NULL;


--
-- TOC entry 3968 (class 2606 OID 155769)
-- Name: candidates candidates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3897 (class 2606 OID 16713)
-- Name: certificates certificates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3898 (class 2606 OID 16708)
-- Name: certificates certificates_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- TOC entry 3899 (class 2606 OID 16703)
-- Name: certificates certificates_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3900 (class 2606 OID 16718)
-- Name: certificates certificates_verified_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_verified_by_users_id_fk FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3963 (class 2606 OID 147479)
-- Name: course_answers course_answers_employee_course_id_employee_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers
    ADD CONSTRAINT course_answers_employee_course_id_employee_courses_id_fk FOREIGN KEY (employee_course_id) REFERENCES public.employee_courses(id) ON DELETE CASCADE;


--
-- TOC entry 3964 (class 2606 OID 147484)
-- Name: course_answers course_answers_question_id_course_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers
    ADD CONSTRAINT course_answers_question_id_course_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.course_questions(id) ON DELETE CASCADE;


--
-- TOC entry 3965 (class 2606 OID 147489)
-- Name: course_questions course_questions_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_questions
    ADD CONSTRAINT course_questions_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 3901 (class 2606 OID 16723)
-- Name: courses courses_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3941 (class 2606 OID 98321)
-- Name: department_shift_breaks department_shift_breaks_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shift_breaks
    ADD CONSTRAINT department_shift_breaks_shift_id_department_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.department_shifts(id) ON DELETE CASCADE;


--
-- TOC entry 3934 (class 2606 OID 49244)
-- Name: department_shifts department_shifts_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shifts
    ADD CONSTRAINT department_shifts_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- TOC entry 3902 (class 2606 OID 16728)
-- Name: departments departments_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3903 (class 2606 OID 49265)
-- Name: departments departments_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id);


--
-- TOC entry 3999 (class 2606 OID 344093)
-- Name: disc_assessments disc_assessments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_assessments
    ADD CONSTRAINT disc_assessments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 4000 (class 2606 OID 344098)
-- Name: disc_assessments disc_assessments_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_assessments
    ADD CONSTRAINT disc_assessments_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 4001 (class 2606 OID 344108)
-- Name: disc_assessments disc_assessments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_assessments
    ADD CONSTRAINT disc_assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4002 (class 2606 OID 344103)
-- Name: disc_assessments disc_assessments_job_opening_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_assessments
    ADD CONSTRAINT disc_assessments_job_opening_id_fkey FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- TOC entry 4003 (class 2606 OID 344124)
-- Name: disc_responses disc_responses_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_responses
    ADD CONSTRAINT disc_responses_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.disc_assessments(id) ON DELETE CASCADE;


--
-- TOC entry 4004 (class 2606 OID 344129)
-- Name: disc_responses disc_responses_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_responses
    ADD CONSTRAINT disc_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.disc_questions(id);


--
-- TOC entry 3904 (class 2606 OID 16743)
-- Name: documents documents_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3905 (class 2606 OID 16733)
-- Name: documents documents_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3906 (class 2606 OID 16748)
-- Name: documents documents_parent_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_parent_document_id_documents_id_fk FOREIGN KEY (parent_document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- TOC entry 3907 (class 2606 OID 16738)
-- Name: documents documents_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 3908 (class 2606 OID 16763)
-- Name: employee_courses employee_courses_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3909 (class 2606 OID 16758)
-- Name: employee_courses employee_courses_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 3910 (class 2606 OID 16753)
-- Name: employee_courses employee_courses_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3911 (class 2606 OID 16768)
-- Name: employee_courses employee_courses_validated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_validated_by_users_id_fk FOREIGN KEY (validated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3912 (class 2606 OID 16773)
-- Name: face_profiles face_profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3913 (class 2606 OID 16778)
-- Name: holidays holidays_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3969 (class 2606 OID 155774)
-- Name: interview_templates interview_templates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates
    ADD CONSTRAINT interview_templates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3970 (class 2606 OID 155779)
-- Name: interview_templates interview_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates
    ADD CONSTRAINT interview_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3971 (class 2606 OID 155784)
-- Name: interviews interviews_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 3972 (class 2606 OID 155789)
-- Name: interviews interviews_template_id_interview_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_template_id_interview_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.interview_templates(id);


--
-- TOC entry 3973 (class 2606 OID 155794)
-- Name: job_openings job_openings_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3974 (class 2606 OID 155804)
-- Name: job_openings job_openings_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3975 (class 2606 OID 155799)
-- Name: job_openings job_openings_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- TOC entry 3994 (class 2606 OID 319504)
-- Name: job_requirements job_requirements_job_opening_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requirements
    ADD CONSTRAINT job_requirements_job_opening_fk FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- TOC entry 3914 (class 2606 OID 16783)
-- Name: job_training_tracks job_training_tracks_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3915 (class 2606 OID 16793)
-- Name: job_training_tracks job_training_tracks_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 3916 (class 2606 OID 16788)
-- Name: job_training_tracks job_training_tracks_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- TOC entry 3997 (class 2606 OID 335885)
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- TOC entry 3998 (class 2606 OID 335890)
-- Name: leads leads_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3917 (class 2606 OID 16798)
-- Name: message_attachments message_attachments_message_id_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- TOC entry 3918 (class 2606 OID 16803)
-- Name: message_attachments message_attachments_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 3919 (class 2606 OID 16808)
-- Name: message_categories message_categories_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_categories
    ADD CONSTRAINT message_categories_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3920 (class 2606 OID 16813)
-- Name: message_recipients message_recipients_message_id_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients
    ADD CONSTRAINT message_recipients_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- TOC entry 3921 (class 2606 OID 16818)
-- Name: message_recipients message_recipients_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients
    ADD CONSTRAINT message_recipients_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3922 (class 2606 OID 16833)
-- Name: messages messages_category_id_message_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_category_id_message_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.message_categories(id) ON DELETE SET NULL;


--
-- TOC entry 3923 (class 2606 OID 16823)
-- Name: messages messages_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3924 (class 2606 OID 16828)
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 3925 (class 2606 OID 16843)
-- Name: notifications notifications_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3926 (class 2606 OID 16838)
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3976 (class 2606 OID 155809)
-- Name: onboarding_documents onboarding_documents_onboarding_link_id_onboarding_links_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents
    ADD CONSTRAINT onboarding_documents_onboarding_link_id_onboarding_links_id_fk FOREIGN KEY (onboarding_link_id) REFERENCES public.onboarding_links(id) ON DELETE CASCADE;


--
-- TOC entry 3977 (class 2606 OID 155814)
-- Name: onboarding_documents onboarding_documents_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents
    ADD CONSTRAINT onboarding_documents_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 3978 (class 2606 OID 155819)
-- Name: onboarding_form_data onboarding_form_data_onboarding_link_id_onboarding_links_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data
    ADD CONSTRAINT onboarding_form_data_onboarding_link_id_onboarding_links_id_fk FOREIGN KEY (onboarding_link_id) REFERENCES public.onboarding_links(id) ON DELETE CASCADE;


--
-- TOC entry 3979 (class 2606 OID 155824)
-- Name: onboarding_links onboarding_links_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 3980 (class 2606 OID 155829)
-- Name: onboarding_links onboarding_links_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3986 (class 2606 OID 270352)
-- Name: overtime_rules overtime_rules_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_rules
    ADD CONSTRAINT overtime_rules_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- TOC entry 3987 (class 2606 OID 270357)
-- Name: overtime_rules overtime_rules_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_rules
    ADD CONSTRAINT overtime_rules_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.department_shifts(id) ON DELETE CASCADE;


--
-- TOC entry 3988 (class 2606 OID 270373)
-- Name: overtime_tiers overtime_tiers_overtime_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_tiers
    ADD CONSTRAINT overtime_tiers_overtime_rule_id_fkey FOREIGN KEY (overtime_rule_id) REFERENCES public.overtime_rules(id) ON DELETE CASCADE;


--
-- TOC entry 3944 (class 2606 OID 122957)
-- Name: rotation_audit rotation_audit_performed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit
    ADD CONSTRAINT rotation_audit_performed_by_users_id_fk FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- TOC entry 3945 (class 2606 OID 122952)
-- Name: rotation_audit rotation_audit_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit
    ADD CONSTRAINT rotation_audit_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- TOC entry 3946 (class 2606 OID 122982)
-- Name: rotation_exceptions rotation_exceptions_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3947 (class 2606 OID 122972)
-- Name: rotation_exceptions rotation_exceptions_original_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_original_shift_id_department_shifts_id_fk FOREIGN KEY (original_shift_id) REFERENCES public.department_shifts(id);


--
-- TOC entry 3948 (class 2606 OID 122977)
-- Name: rotation_exceptions rotation_exceptions_override_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_override_shift_id_department_shifts_id_fk FOREIGN KEY (override_shift_id) REFERENCES public.department_shifts(id);


--
-- TOC entry 3949 (class 2606 OID 122962)
-- Name: rotation_exceptions rotation_exceptions_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- TOC entry 3950 (class 2606 OID 122967)
-- Name: rotation_exceptions rotation_exceptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3951 (class 2606 OID 122992)
-- Name: rotation_instances rotation_instances_generated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances
    ADD CONSTRAINT rotation_instances_generated_by_users_id_fk FOREIGN KEY (generated_by) REFERENCES public.users(id);


--
-- TOC entry 3952 (class 2606 OID 122987)
-- Name: rotation_instances rotation_instances_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances
    ADD CONSTRAINT rotation_instances_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- TOC entry 3953 (class 2606 OID 123002)
-- Name: rotation_segments rotation_segments_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments
    ADD CONSTRAINT rotation_segments_shift_id_department_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.department_shifts(id) ON DELETE SET NULL;


--
-- TOC entry 3954 (class 2606 OID 122997)
-- Name: rotation_segments rotation_segments_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments
    ADD CONSTRAINT rotation_segments_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- TOC entry 3955 (class 2606 OID 123007)
-- Name: rotation_templates rotation_templates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3956 (class 2606 OID 123017)
-- Name: rotation_templates rotation_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3957 (class 2606 OID 123012)
-- Name: rotation_templates rotation_templates_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- TOC entry 3958 (class 2606 OID 237568)
-- Name: rotation_user_assignments rotation_user_assignments_active_instance_id_rotation_instances; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_active_instance_id_rotation_instances FOREIGN KEY (active_instance_id) REFERENCES public.rotation_instances(id) ON DELETE SET NULL;


--
-- TOC entry 3959 (class 2606 OID 123037)
-- Name: rotation_user_assignments rotation_user_assignments_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- TOC entry 3960 (class 2606 OID 123042)
-- Name: rotation_user_assignments rotation_user_assignments_deactivated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_deactivated_by_users_id_fk FOREIGN KEY (deactivated_by) REFERENCES public.users(id);


--
-- TOC entry 3961 (class 2606 OID 123027)
-- Name: rotation_user_assignments rotation_user_assignments_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- TOC entry 3962 (class 2606 OID 123022)
-- Name: rotation_user_assignments rotation_user_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3935 (class 2606 OID 49249)
-- Name: sectors sectors_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT sectors_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3981 (class 2606 OID 155834)
-- Name: selection_stages selection_stages_job_opening_id_job_openings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selection_stages
    ADD CONSTRAINT selection_stages_job_opening_id_job_openings_id_fk FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- TOC entry 3936 (class 2606 OID 49259)
-- Name: supervisor_assignments supervisor_assignments_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments
    ADD CONSTRAINT supervisor_assignments_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE CASCADE;


--
-- TOC entry 3937 (class 2606 OID 49254)
-- Name: supervisor_assignments supervisor_assignments_supervisor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments
    ADD CONSTRAINT supervisor_assignments_supervisor_id_users_id_fk FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3989 (class 2606 OID 270399)
-- Name: time_bank time_bank_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank
    ADD CONSTRAINT time_bank_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3991 (class 2606 OID 270414)
-- Name: time_bank_transactions time_bank_transactions_time_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank_transactions
    ADD CONSTRAINT time_bank_transactions_time_bank_id_fkey FOREIGN KEY (time_bank_id) REFERENCES public.time_bank(id) ON DELETE CASCADE;


--
-- TOC entry 3992 (class 2606 OID 270424)
-- Name: time_bank_transactions time_bank_transactions_time_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank_transactions
    ADD CONSTRAINT time_bank_transactions_time_entry_id_fkey FOREIGN KEY (time_entry_id) REFERENCES public.time_entries(id);


--
-- TOC entry 3993 (class 2606 OID 270419)
-- Name: time_bank_transactions time_bank_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank_transactions
    ADD CONSTRAINT time_bank_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3990 (class 2606 OID 270394)
-- Name: time_bank time_bank_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_bank
    ADD CONSTRAINT time_bank_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3927 (class 2606 OID 16853)
-- Name: time_entries time_entries_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- TOC entry 3928 (class 2606 OID 16848)
-- Name: time_entries time_entries_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3982 (class 2606 OID 213007)
-- Name: time_entry_audit time_entry_audit_edited_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit
    ADD CONSTRAINT time_entry_audit_edited_by_users_id_fk FOREIGN KEY (edited_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3983 (class 2606 OID 213002)
-- Name: time_entry_audit time_entry_audit_time_entry_id_time_entries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit
    ADD CONSTRAINT time_entry_audit_time_entry_id_time_entries_id_fk FOREIGN KEY (time_entry_id) REFERENCES public.time_entries(id) ON DELETE CASCADE;


--
-- TOC entry 3938 (class 2606 OID 81937)
-- Name: time_periods time_periods_closed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_closed_by_users_id_fk FOREIGN KEY (closed_by) REFERENCES public.users(id);


--
-- TOC entry 3939 (class 2606 OID 81932)
-- Name: time_periods time_periods_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3940 (class 2606 OID 81942)
-- Name: time_periods time_periods_reopened_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_reopened_by_users_id_fk FOREIGN KEY (reopened_by) REFERENCES public.users(id);


--
-- TOC entry 3942 (class 2606 OID 114706)
-- Name: user_shift_assignments user_shift_assignments_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments
    ADD CONSTRAINT user_shift_assignments_shift_id_department_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.department_shifts(id) ON DELETE CASCADE;


--
-- TOC entry 3943 (class 2606 OID 114701)
-- Name: user_shift_assignments user_shift_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments
    ADD CONSTRAINT user_shift_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3929 (class 2606 OID 16858)
-- Name: users users_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- TOC entry 3930 (class 2606 OID 16863)
-- Name: users users_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


-- Completed on 2025-11-16 22:31:33 UTC

--
-- PostgreSQL database dump complete
--

