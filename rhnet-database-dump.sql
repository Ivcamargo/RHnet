--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_company_id_companies_id_fk;
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
DROP INDEX IF EXISTS public.unique_user_template_active;
DROP INDEX IF EXISTS public.unique_user_course_active;
DROP INDEX IF EXISTS public.unique_template_sequence;
DROP INDEX IF EXISTS public.unique_template_cycle;
DROP INDEX IF EXISTS public.unique_supervisor_sector;
DROP INDEX IF EXISTS public.unique_message_recipient;
DROP INDEX IF EXISTS public.unique_document_version;
DROP INDEX IF EXISTS public.unique_candidate_email;
DROP INDEX IF EXISTS public.unique_application;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_shift_assignments DROP CONSTRAINT IF EXISTS user_shift_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.time_periods DROP CONSTRAINT IF EXISTS time_periods_pkey;
ALTER TABLE IF EXISTS ONLY public.time_entry_audit DROP CONSTRAINT IF EXISTS time_entry_audit_pkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisor_assignments DROP CONSTRAINT IF EXISTS supervisor_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.selection_stages DROP CONSTRAINT IF EXISTS selection_stages_pkey;
ALTER TABLE IF EXISTS ONLY public.sectors DROP CONSTRAINT IF EXISTS sectors_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_user_assignments DROP CONSTRAINT IF EXISTS rotation_user_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_templates DROP CONSTRAINT IF EXISTS rotation_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_segments DROP CONSTRAINT IF EXISTS rotation_segments_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_instances DROP CONSTRAINT IF EXISTS rotation_instances_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_exceptions DROP CONSTRAINT IF EXISTS rotation_exceptions_pkey;
ALTER TABLE IF EXISTS ONLY public.rotation_audit DROP CONSTRAINT IF EXISTS rotation_audit_pkey;
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
ALTER TABLE IF EXISTS ONLY public.job_training_tracks DROP CONSTRAINT IF EXISTS job_training_tracks_pkey;
ALTER TABLE IF EXISTS ONLY public.job_openings DROP CONSTRAINT IF EXISTS job_openings_pkey;
ALTER TABLE IF EXISTS ONLY public.interviews DROP CONSTRAINT IF EXISTS interviews_pkey;
ALTER TABLE IF EXISTS ONLY public.interview_templates DROP CONSTRAINT IF EXISTS interview_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.holidays DROP CONSTRAINT IF EXISTS holidays_pkey;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_courses DROP CONSTRAINT IF EXISTS employee_courses_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
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
ALTER TABLE IF EXISTS public.user_shift_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_periods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_entry_audit ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisor_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.selection_stages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sectors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_user_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_segments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_instances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_exceptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rotation_audit ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.onboarding_links ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.onboarding_form_data ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.onboarding_documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_recipients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_attachments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_training_tracks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_openings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.interviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.interview_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.holidays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.face_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_courses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.documents ALTER COLUMN id DROP DEFAULT;
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
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_shift_assignments_id_seq;
DROP TABLE IF EXISTS public.user_shift_assignments;
DROP SEQUENCE IF EXISTS public.time_periods_id_seq;
DROP TABLE IF EXISTS public.time_periods;
DROP SEQUENCE IF EXISTS public.time_entry_audit_id_seq;
DROP TABLE IF EXISTS public.time_entry_audit;
DROP SEQUENCE IF EXISTS public.time_entries_id_seq;
DROP TABLE IF EXISTS public.time_entries;
DROP SEQUENCE IF EXISTS public.supervisor_assignments_id_seq;
DROP TABLE IF EXISTS public.supervisor_assignments;
DROP TABLE IF EXISTS public.sessions;
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
DROP SEQUENCE IF EXISTS public.job_training_tracks_id_seq;
DROP TABLE IF EXISTS public.job_training_tracks;
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
SET default_tablespace = '';

SET default_table_access_method = heap;

--
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
    updated_at timestamp without time zone DEFAULT now()
);


--
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
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
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
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
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
-- Name: authorized_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.authorized_devices_id_seq OWNED BY public.authorized_devices.id;


--
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
-- Name: break_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.break_entries_id_seq OWNED BY public.break_entries.id;


--
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
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
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
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
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
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
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
-- Name: course_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_answers_id_seq OWNED BY public.course_answers.id;


--
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
-- Name: course_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_questions_id_seq OWNED BY public.course_questions.id;


--
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
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
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
-- Name: department_shift_breaks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_shift_breaks_id_seq OWNED BY public.department_shift_breaks.id;


--
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
    break_end character varying
);


--
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
-- Name: department_shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_shifts_id_seq OWNED BY public.department_shifts.id;


--
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
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
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
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
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
-- Name: employee_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_courses_id_seq OWNED BY public.employee_courses.id;


--
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
-- Name: face_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.face_profiles_id_seq OWNED BY public.face_profiles.id;


--
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
-- Name: holidays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.holidays_id_seq OWNED BY public.holidays.id;


--
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
-- Name: interview_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interview_templates_id_seq OWNED BY public.interview_templates.id;


--
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
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
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
    updated_at timestamp without time zone DEFAULT now()
);


--
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
-- Name: job_openings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_openings_id_seq OWNED BY public.job_openings.id;


--
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
-- Name: job_training_tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_training_tracks_id_seq OWNED BY public.job_training_tracks.id;


--
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
-- Name: message_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_attachments_id_seq OWNED BY public.message_attachments.id;


--
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
-- Name: message_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_categories_id_seq OWNED BY public.message_categories.id;


--
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
-- Name: message_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_recipients_id_seq OWNED BY public.message_recipients.id;


--
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
    sender_deleted_at timestamp without time zone
);


--
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
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
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
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
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
-- Name: onboarding_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_documents_id_seq OWNED BY public.onboarding_documents.id;


--
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
-- Name: onboarding_form_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_form_data_id_seq OWNED BY public.onboarding_form_data.id;


--
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
-- Name: onboarding_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_links_id_seq OWNED BY public.onboarding_links.id;


--
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
-- Name: rotation_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_audit_id_seq OWNED BY public.rotation_audit.id;


--
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
-- Name: rotation_exceptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_exceptions_id_seq OWNED BY public.rotation_exceptions.id;


--
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
-- Name: rotation_instances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_instances_id_seq OWNED BY public.rotation_instances.id;


--
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
-- Name: rotation_segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_segments_id_seq OWNED BY public.rotation_segments.id;


--
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
-- Name: rotation_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_templates_id_seq OWNED BY public.rotation_templates.id;


--
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
-- Name: rotation_user_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rotation_user_assignments_id_seq OWNED BY public.rotation_user_assignments.id;


--
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
-- Name: sectors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sectors_id_seq OWNED BY public.sectors.id;


--
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
-- Name: selection_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.selection_stages_id_seq OWNED BY public.selection_stages.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: supervisor_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisor_assignments (
    id integer NOT NULL,
    supervisor_id character varying NOT NULL,
    sector_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
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
-- Name: supervisor_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisor_assignments_id_seq OWNED BY public.supervisor_assignments.id;


--
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
    device_id integer
);


--
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
-- Name: time_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_entries_id_seq OWNED BY public.time_entries.id;


--
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
-- Name: time_entry_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_entry_audit_id_seq OWNED BY public.time_entry_audit.id;


--
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
-- Name: time_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_periods_id_seq OWNED BY public.time_periods.id;


--
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
-- Name: user_shift_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_shift_assignments_id_seq OWNED BY public.user_shift_assignments.id;


--
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
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: authorized_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices ALTER COLUMN id SET DEFAULT nextval('public.authorized_devices_id_seq'::regclass);


--
-- Name: break_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.break_entries ALTER COLUMN id SET DEFAULT nextval('public.break_entries_id_seq'::regclass);


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: course_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers ALTER COLUMN id SET DEFAULT nextval('public.course_answers_id_seq'::regclass);


--
-- Name: course_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_questions ALTER COLUMN id SET DEFAULT nextval('public.course_questions_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: department_shift_breaks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shift_breaks ALTER COLUMN id SET DEFAULT nextval('public.department_shift_breaks_id_seq'::regclass);


--
-- Name: department_shifts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shifts ALTER COLUMN id SET DEFAULT nextval('public.department_shifts_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: employee_courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses ALTER COLUMN id SET DEFAULT nextval('public.employee_courses_id_seq'::regclass);


--
-- Name: face_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles ALTER COLUMN id SET DEFAULT nextval('public.face_profiles_id_seq'::regclass);


--
-- Name: holidays id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays ALTER COLUMN id SET DEFAULT nextval('public.holidays_id_seq'::regclass);


--
-- Name: interview_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates ALTER COLUMN id SET DEFAULT nextval('public.interview_templates_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: job_openings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings ALTER COLUMN id SET DEFAULT nextval('public.job_openings_id_seq'::regclass);


--
-- Name: job_training_tracks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks ALTER COLUMN id SET DEFAULT nextval('public.job_training_tracks_id_seq'::regclass);


--
-- Name: message_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments ALTER COLUMN id SET DEFAULT nextval('public.message_attachments_id_seq'::regclass);


--
-- Name: message_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_categories ALTER COLUMN id SET DEFAULT nextval('public.message_categories_id_seq'::regclass);


--
-- Name: message_recipients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients ALTER COLUMN id SET DEFAULT nextval('public.message_recipients_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: onboarding_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents ALTER COLUMN id SET DEFAULT nextval('public.onboarding_documents_id_seq'::regclass);


--
-- Name: onboarding_form_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data ALTER COLUMN id SET DEFAULT nextval('public.onboarding_form_data_id_seq'::regclass);


--
-- Name: onboarding_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links ALTER COLUMN id SET DEFAULT nextval('public.onboarding_links_id_seq'::regclass);


--
-- Name: rotation_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit ALTER COLUMN id SET DEFAULT nextval('public.rotation_audit_id_seq'::regclass);


--
-- Name: rotation_exceptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions ALTER COLUMN id SET DEFAULT nextval('public.rotation_exceptions_id_seq'::regclass);


--
-- Name: rotation_instances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances ALTER COLUMN id SET DEFAULT nextval('public.rotation_instances_id_seq'::regclass);


--
-- Name: rotation_segments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments ALTER COLUMN id SET DEFAULT nextval('public.rotation_segments_id_seq'::regclass);


--
-- Name: rotation_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates ALTER COLUMN id SET DEFAULT nextval('public.rotation_templates_id_seq'::regclass);


--
-- Name: rotation_user_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments ALTER COLUMN id SET DEFAULT nextval('public.rotation_user_assignments_id_seq'::regclass);


--
-- Name: sectors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors ALTER COLUMN id SET DEFAULT nextval('public.sectors_id_seq'::regclass);


--
-- Name: selection_stages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selection_stages ALTER COLUMN id SET DEFAULT nextval('public.selection_stages_id_seq'::regclass);


--
-- Name: supervisor_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments ALTER COLUMN id SET DEFAULT nextval('public.supervisor_assignments_id_seq'::regclass);


--
-- Name: time_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries ALTER COLUMN id SET DEFAULT nextval('public.time_entries_id_seq'::regclass);


--
-- Name: time_entry_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit ALTER COLUMN id SET DEFAULT nextval('public.time_entry_audit_id_seq'::regclass);


--
-- Name: time_periods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods ALTER COLUMN id SET DEFAULT nextval('public.time_periods_id_seq'::regclass);


--
-- Name: user_shift_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments ALTER COLUMN id SET DEFAULT nextval('public.user_shift_assignments_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applications (id, job_opening_id, candidate_id, status, current_stage_id, score, distance_km, cover_letter, applied_at, screening_notes, rejection_reason, updated_at) FROM stdin;
2	13	2	screening	\N	0	\N	Tenho 5 anos de experiência	2025-10-23 02:11:10.908	\N	\N	2025-10-23 16:20:33.956
1	4	1	screening	\N	0	\N	teste	2025-10-10 18:05:34.984	\N	\N	2025-10-23 16:20:42.979
\.


--
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
\.


--
-- Data for Name: authorized_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.authorized_devices (id, device_code, device_name, company_id, sector_id, description, latitude, longitude, geofence_radius, is_active, last_used_at, created_at, updated_at, location, radius) FROM stdin;
2	TERM-5364	Terminal Test Final	2	\N	\N	-23.483833	-46.88903	100	t	2025-10-25 02:03:37.511	2025-10-24 19:49:50.68915	2025-10-25 02:04:43.139	Teste Final	170
1	TERM-6409	Terminal Teste E2E	2	\N	\N	-23.771029	-46.7318	100	t	\N	2025-10-24 19:45:30.471	2025-10-24 20:53:02.485	Recepção Teste	100
3	TERM-0201	Terminal Auth Test	2	\N	\N	-23.55686	-46.66141	100	t	2025-10-24 21:53:15.414	2025-10-24 21:03:30.664695	2025-10-24 21:03:30.664695	Auth Test Location	100
\.


--
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
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.candidates (id, company_id, name, email, phone, cpf, birth_date, address, city, state, zip_code, latitude, longitude, resume_url, linkedin_url, portfolio_url, skills, experience, education, source_channel, notes, status, created_at, updated_at) FROM stdin;
1	2	Jose joao silva	silvajose@gmail.com	55321321212	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-10-10 18:05:34.926227	2025-10-10 18:05:34.926227
2	2	João Silva Candidato	joao.candidato@email.com	(11) 98765-4321	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	active	2025-10-23 02:11:10.873152	2025-10-23 02:11:10.873152
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.certificates (id, user_id, course_id, company_id, certificate_number, title, issued_date, expiry_date, file_url, is_verified, verified_by, verified_at, metadata, created_at) FROM stdin;
1	43729966	3	1	CERT-1761218916942-43729966	Curso de Teste lScRFI	2025-10-23	\N	\N	f	\N	\N	{"score": 100, "completedAt": "2025-10-23T11:28:36.942Z", "passingScore": 70, "correctAnswers": 3, "totalQuestions": 3}	2025-10-23 11:28:36.960922
2	43729966	3	1	CERT-1761218955830-43729966	Curso de Teste lScRFI	2025-10-23	\N	\N	f	\N	\N	{"score": 100, "completedAt": "2025-10-23T11:29:15.830Z", "passingScore": 70, "correctAnswers": 3, "totalQuestions": 3}	2025-10-23 11:29:15.847436
3	emp_1758233488891_n83g7zh3w	2	2	CERT-1761236501426-emp_1758	segurança	2025-10-23	\N	\N	f	\N	\N	{"score": 100, "completedAt": "2025-10-23T16:21:41.426Z", "passingScore": 70, "correctAnswers": 2, "totalQuestions": 2}	2025-10-23 16:21:41.444126
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, cnpj, address, phone, email, logo_url, is_active, created_at, updated_at) FROM stdin;
1	Jota pé	00000000000000	Endereço não definido			\N	t	2025-09-13 14:36:29.290636	2025-09-15 14:52:15.781
2	Informa Comercial Sistemas	0056643900186		11981151349	ivan@infosis.com.br	\N	t	2025-09-13 18:44:26.519003	2025-09-18 18:55:59.855
\.


--
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
\.


--
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
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, company_id, title, description, category, duration, is_required, external_url, certificate_template, passing_score, validity_period, is_active, created_at, updated_at, video_url) FROM stdin;
1	2	teste	teste	\N	15	f	\N	\N	\N	\N	t	2025-10-08 16:13:57.757676	2025-10-08 16:13:57.757676	\N
2	2	segurança	teste	\N	20	f	\N	\N	70	\N	t	2025-10-08 16:21:38.739223	2025-10-08 16:21:38.739223	https://www.youtube.com/watch?v=EGQ4nm4Fpvs
3	1	Curso de Teste lScRFI	Descrição do curso de teste	\N	60	f	\N	\N	70	\N	t	2025-10-08 18:34:35.282188	2025-10-08 18:34:35.282188	https://www.youtube.com/watch?v=dQw4w9WgXcQ
4	2	teste2	teste 2	\N	50	f	\N	\N	70	\N	t	2025-10-08 20:48:24.725078	2025-10-08 20:48:24.725078	
5	1	Teste	teste	\N	15	t	\N	\N	75	\N	t	2025-10-23 11:27:15.636947	2025-10-23 11:27:15.636947	https://www.youtube.com/watch?v=EGQ4nm4Fpvs
6	1	TESTE	Teste	\N	20	t	\N	\N	70	\N	t	2025-10-23 12:21:19.818806	2025-10-23 12:21:19.818806	
\.


--
-- Data for Name: department_shift_breaks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_shift_breaks (id, shift_id, name, duration_minutes, is_paid, auto_deduct, scheduled_start, scheduled_end, min_work_minutes, tolerance_before_minutes, tolerance_after_minutes, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: department_shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_shifts (id, department_id, name, start_time, end_time, days_of_week, is_active, created_at, updated_at, break_start, break_end) FROM stdin;
5	2	Normal	08:00	17:00	{1,2,3,4,5}	t	2025-09-21 11:50:13.381013	2025-09-24 21:27:41.445	12:00	13:00
10	2	Administração	08:00	17:30	{1,2,3,4,5}	t	2025-09-24 21:04:30.652544	2025-09-24 21:28:08.945	12:30	13:30
11	2	Turno Teste	09:00	18:00	{1,2,3,4,5}	t	2025-09-24 22:00:49.556067	2025-09-24 22:00:49.556067	12:00	13:00
13	3	12x36 Medicos	07:00	19:00	{1,2,3,4,5}	t	2025-09-26 06:47:14.705688	2025-09-26 06:47:14.705688		
14	3	Folga 12x36	00:00	00:00	{1,2,3,4,5}	t	2025-09-26 06:47:53.061295	2025-09-26 06:47:53.061295		
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, company_id, name, description, is_active, created_at, updated_at, sector_id) FROM stdin;
2	2	Financeiro	Fiinanceiro	t	2025-09-18 19:50:54.836286	2025-09-18 19:50:54.836286	2
3	2	Medicos	Medicos	t	2025-09-26 06:46:38.956083	2025-09-26 06:46:38.956083	4
4	2	Departamento Teste	Departamento para testes de validação	t	2025-10-24 19:38:13.108731	2025-10-24 19:38:13.108731	11
\.


--
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
-- Data for Name: employee_courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_courses (id, user_id, course_id, company_id, status, progress, score, started_at, completed_at, expires_at, certificate_url, validated_by, validated_at, notes, created_at, updated_at) FROM stdin;
3	emp_1758233488891_n83g7zh3w	4	2	not_started	0	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-23 01:08:59.41642	2025-10-23 01:10:04.39
5	43729966	5	1	completed	100	\N	2025-10-23 11:27:27.134	2025-10-23 11:27:31.026	\N	\N	\N	\N	\N	2025-10-23 11:27:27.152502	2025-10-23 11:27:31.026
4	43729966	3	1	completed	100	100	\N	2025-10-23 11:29:15.74	\N	\N	\N	\N	\N	2025-10-23 10:35:44.467583	2025-10-23 11:29:15.74
2	emp_1758233488891_n83g7zh3w	2	2	completed	100	100	2025-10-08 16:22:00.927	2025-10-23 16:21:41.337	\N	\N	\N	\N	\N	2025-10-08 16:22:00.946296	2025-10-23 16:21:41.337
1	emp_1758233488891_n83g7zh3w	1	2	not_started	0	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-08 16:14:02.16203	2025-10-24 14:50:00.663
\.


--
-- Data for Name: face_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.face_profiles (id, user_id, face_data, is_active, created_at, updated_at) FROM stdin;
1	emp_1758233488891_n83g7zh3w	{"features": "mock_face_embedding_data", "timestamp": "2025-10-24T00:23:25.498Z", "confidence": 0.95}	t	2025-10-24 00:23:25.697939	2025-10-24 00:23:25.697939
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.holidays (id, company_id, name, date, type, is_recurring, description, is_active, created_at, updated_at) FROM stdin;
1	1	Dia do trabalho	2025-05-01	national	t		t	2025-10-23 01:00:32.865933	2025-10-23 01:00:32.865933
\.


--
-- Data for Name: interview_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interview_templates (id, company_id, name, description, type, questions, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interviews (id, application_id, template_id, interviewer_ids, scheduled_at, location, meeting_url, status, feedback, rating, evaluation, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: job_openings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_openings (id, company_id, department_id, title, description, requirements, responsibilities, benefits, location, employment_type, salary_range, work_schedule, vacancies, status, published_at, closed_at, expires_at, created_by, created_at, updated_at) FROM stdin;
1	2	\N	Analista de RH RDIu07	Responsável por recrutamento e seleção	Experiência em RH, conhecimento em legislação trabalhista	\N	\N	São Paulo - SP	full_time	\N	\N	1	published	2025-10-10 14:59:42.399	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 14:57:58.099534	2025-10-10 14:59:42.399
2	2	\N	Desenvolvedor Full Stack W6vgz7	Desenvolvimento de aplicações web modernas	React, Node.js, PostgreSQL	\N	\N	Remote	full_time	\N	\N	1	published	2025-10-10 15:05:43.457	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 15:04:11.804293	2025-10-10 15:05:43.457
3	2	\N	Designer UX/UI JWygwp	Criação de interfaces e experiências de usuário	Figma, Design System, Prototipação	\N	\N	Híbrido - SP	full_time	\N	\N	1	published	2025-10-10 15:11:28.719	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 15:10:26.535901	2025-10-10 15:11:28.719
4	2	\N	Gerente de Projetos RFiEMY	Gestão de projetos de software	PMP, Agile, Scrum	\N	\N	São Paulo - SP	full_time	\N	\N	1	published	2025-10-10 15:18:44.627	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 15:17:45.912364	2025-10-10 15:18:44.627
5	2	\N	Analista de Sistemas Zht08I	Teste de criação de vaga	Conhecimento em React	\N	\N		internship	\N	\N	1	published	2025-10-10 21:57:21.002	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 21:42:30.171227	2025-10-10 21:59:05.061
8	2	\N	QA Engineer VZDZJH	Testing and quality assurance	Experience with automated testing	\N	\N		full_time	\N	\N	1	published	2025-10-10 22:05:57.355	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 22:02:54.003836	2025-10-10 22:05:57.355
9	2	\N	Tech Lead hGuyET	Technical leadership role	10+ years experience	\N	\N		full_time	\N	\N	1	published	\N	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 22:11:08.79112	2025-10-10 22:15:14.123
11	2	\N	Desenvolvedor Full Stack (Teste)	Vaga para desenvolvedor experiente (teste automatizado)	Conhecimento em React e Node.js	\N	\N	São Paulo - SP	CLT	R$ 8.000 - R$ 12.000	\N	1	active	\N	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-23 02:03:30.376415	2025-10-23 02:03:30.376415
13	2	\N	Desenvolvedor Full Stack	Vaga para desenvolvedor experiente	Conhecimento em React e Node.js	\N	\N	São Paulo - SP	CLT	R$ 8.000 - R$ 12.000	\N	1	active	\N	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-23 02:08:47.272521	2025-10-23 02:08:47.272521
15	2	\N	Test Job	Test Description	Test Requirements	\N	\N	Test Location	CLT	R$ 5.000	\N	1	active	\N	\N	\N	0wktYthnDhYK	2025-10-23 02:14:41.899167	2025-10-23 02:14:41.899167
6	2	\N	Analista de Sistemas e_mrS_	Teste de criação de vaga	Conhecimento em React	\N	\N	São Paulo - SP	contract	\N	\N	1	published	2025-10-23 15:54:31.508	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 21:48:47.323218	2025-10-23 15:54:31.508
7	2	\N	Desenvolvedor Backend bIJwmQ	Desenvolvimento de APIs REST	Experiência com Node.js e PostgreSQL	\N	\N		contract	\N	\N	1	published	2025-10-23 15:54:37.054	\N	\N	emp_1758233488891_n83g7zh3w	2025-10-10 21:55:21.435395	2025-10-23 15:54:37.054
\.


--
-- Data for Name: job_training_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_training_tracks (id, company_id, department_id, job_role, course_id, is_required, days_to_complete, "order", created_at) FROM stdin;
\.


--
-- Data for Name: message_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_attachments (id, message_id, file_name, original_name, file_size, mime_type, file_path, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: message_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_categories (id, name, description, color, company_id, is_active, created_at) FROM stdin;
1	Mensagens	\N	#EA580C	2	t	2025-10-08 13:03:16.83167
\.


--
-- Data for Name: message_recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_recipients (id, message_id, user_id, is_delivered, delivered_at, is_read, read_at, is_deleted, deleted_at, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, company_id, sender_id, category_id, subject, content, is_mass_message, priority, created_at, updated_at, sender_deleted, sender_deleted_at) FROM stdin;
1	2	emp_1758233488891_n83g7zh3w	1	Curso	tds devem fazer	f	normal	2025-10-08 13:03:36.762928	2025-10-08 13:03:36.762928	f	\N
3	2	emp_1758233488891_n83g7zh3w	1	teste	teste 2	t	high	2025-10-08 13:29:23.374822	2025-10-08 13:29:23.374822	t	2025-10-08 15:18:37.66
2	2	emp_1758233488891_n83g7zh3w	1	teste	teste 2	t	high	2025-10-08 13:29:16.491151	2025-10-08 13:29:16.491151	t	2025-10-08 15:18:59.496
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, company_id, type, title, content, related_id, related_type, is_read, read_at, email_sent, email_sent_at, priority, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: onboarding_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_documents (id, onboarding_link_id, document_type, file_name, file_url, file_size, mime_type, status, review_notes, uploaded_at, reviewed_at, reviewed_by) FROM stdin;
\.


--
-- Data for Name: onboarding_form_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_form_data (id, onboarding_link_id, personal_data, contact_data, bank_data, dependents, emergency_contact, contract_data, is_complete, submitted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: onboarding_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_links (id, application_id, token, candidate_name, candidate_email, candidate_phone, "position", department, start_date, status, expires_at, completed_at, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: rotation_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_audit (id, template_id, action, affected_users, date_range, old_assignment_count, new_assignment_count, details, performed_by, performed_at) FROM stdin;
\.


--
-- Data for Name: rotation_exceptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_exceptions (id, template_id, user_id, exception_date, original_shift_id, override_shift_id, reason, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: rotation_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_instances (id, template_id, cycle_number, effective_start, effective_end, status, generated_at, generated_by) FROM stdin;
\.


--
-- Data for Name: rotation_segments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_segments (id, template_id, sequence_order, shift_id, name, work_duration_hours, rest_duration_hours, days_of_week_mask, consecutive_days, is_active, created_at, updated_at) FROM stdin;
5	3	0	13	12x36 Medicos - Ordem 0	\N	\N	\N	1	t	2025-09-26 06:55:20.752748	2025-09-26 06:55:20.752748
6	3	1	14	Folga 12x36 - Ordem 1	\N	\N	\N	1	t	2025-09-26 06:55:37.259652	2025-09-26 06:55:37.259652
\.


--
-- Data for Name: rotation_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_templates (id, company_id, department_id, name, description, cadence_type, cycle_length, starts_on, is_active, created_by, created_at, updated_at) FROM stdin;
3	2	\N	12x36		custom	3	monday	t	emp_1758233488891_n83g7zh3w	2025-09-25 22:45:31.323593	2025-09-25 22:45:31.323593
\.


--
-- Data for Name: rotation_user_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rotation_user_assignments (id, user_id, template_id, anchor_date, starting_segment_order, active_instance_id, is_active, assigned_by, assigned_at, deactivated_at, deactivated_by) FROM stdin;
\.


--
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sectors (id, company_id, name, description, is_active, created_at, updated_at, latitude, longitude, radius) FROM stdin;
5	2	Setor Teste CEP HNSixQ		t	2025-10-22 21:01:35.687665	2025-10-22 21:01:35.687665	-23.565016	-46.65177	200
6	2	Teste Layout 2cqs	Testando layout landscape	t	2025-10-22 21:16:40.495918	2025-10-22 21:16:40.495918	-23.565016	-46.65177	100
7	2	Setor Final K7otLd	Teste completo com refetch	t	2025-10-22 21:22:28.627425	2025-10-22 21:22:28.627425	-23.565016	-46.65177	250
8	2	Debug Test kfXm		t	2025-10-22 21:30:25.471415	2025-10-22 21:30:25.471415	0	0	100
2	2	Administração	ADM	t	2025-09-18 19:45:36.210981	2025-10-22 21:36:06.84	-23.483833	-46.88903	300
9	2	SW Fixed NdnCoR	Teste com Service Worker corrigido	t	2025-10-22 21:36:18.498313	2025-10-22 21:36:18.498313	-23.565016	-46.65177	100
10	2	Teste Coords AWj8		t	2025-10-22 21:42:27.818519	2025-10-22 21:42:27.818519	-23.565016	-46.65177	200
3	2	Escola Municipal JJ	JJ	t	2025-09-21 05:30:38.692107	2025-10-22 21:47:22.097	-23.483833	-46.88903	200
4	2	Medicos		t	2025-09-26 06:43:59.421871	2025-10-22 21:49:00.533	-23.48808	-46.89222	300
11	2	Setor Teste Geofence	Setor para testes de validação dupla	t	2025-10-24 19:38:04.007208	2025-10-24 19:38:04.007208	-23.5505	-46.6333	100
\.


--
-- Data for Name: selection_stages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.selection_stages (id, job_opening_id, name, description, "order", type, is_required, duration_days, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: supervisor_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisor_assignments (id, supervisor_id, sector_id, created_at) FROM stdin;
1	test_employee_001	2	2025-09-21 05:29:04.170131
2	test_employee_001	3	2025-09-21 05:30:56.23225
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_entries (id, user_id, department_id, clock_in_time, clock_out_time, clock_in_latitude, clock_in_longitude, clock_out_latitude, clock_out_longitude, total_hours, status, face_recognition_verified, date, created_at, updated_at, clock_in_photo_url, clock_out_photo_url, entry_type, inserted_by, approved_by, approval_status, justification, support_document_url, regular_hours, overtime_hours, clock_in_ip_address, clock_out_ip_address, clock_in_within_geofence, clock_out_within_geofence, clock_in_shift_compliant, clock_out_shift_compliant, clock_in_validation_message, clock_out_validation_message, expected_hours, late_minutes, shortfall_minutes, irregularity_reasons, device_id) FROM stdin;
16	emp_1758233488891_n83g7zh3w	2	2025-10-23 23:00:35.974	2025-10-23 23:03:30.12	-23.484177	-46.88836	-23.48405	-46.888397	0.05	completed	t	2025-10-23	2025-10-23 23:00:36.277642	2025-10-23 23:03:30.485	\N	\N	automatic	\N	\N	approved	\N	\N	0.05	0.00	10.81.6.27	10.81.11.93	t	t	f	f	✓ Localização OK (79m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 23:00)	✓ Localização OK (69m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 23:03)	\N	\N	\N	\N	\N
15	emp_1758233488891_n83g7zh3w	2	2025-10-23 11:00:00	2025-10-23 20:03:00	-23.484062	-46.88809	-23.484104	-46.888412	9.05	completed	t	2025-10-23	2025-10-23 16:22:58.501964	2025-10-24 13:58:20.438	\N	\N	automatic	\N	\N	approved	[EDITADO ADMIN]: Atestado Medico\n[EDITADO ADMIN]: ajuste horario\n[EDITADO ADMIN]: aceerto ponto	\N	9.00	0.05	10.81.12.33	10.81.5.82	t	t	t	t	✓ Localização OK (99m do setor)\n✓ Turno OK (Normal: 08:00 - 17:00)	✓ Localização OK (70m do setor)\n✓ Turno OK (Normal: 08:00 - 17:00)	\N	\N	\N	\N	\N
17	emp_1758233488891_n83g7zh3w	2	2025-10-24 00:23:26.19	2025-10-24 23:13:36.105	-23.48402	-46.88839	-23.484137	-46.888256	\N	completed	t	2025-10-23	2025-10-24 00:23:26.545936	2025-10-24 23:13:36.105	data:image/jpeg;base64,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	\N	automatic	\N	\N	approved	\N	\N	0.00	0.00	10.81.9.56	\N	t	\N	f	\N	✓ Localização OK (68m do setor)\n⚠ Fora do horário do turno (Normal: 08:00 - 17:00, atual: 00:23)	\N	\N	\N	\N	\N	\N
18	emp_1758233488891_n83g7zh3w	2	2025-10-25 01:49:10.364	2025-10-25 02:04:52.586	-23.48404	-46.888317	-23.483854	-46.888786	\N	completed	f	2025-10-25	2025-10-25 01:49:10.382531	2025-10-25 02:04:52.586	\N	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAHgAoADASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAQIAAwQFBgcI/8QAPBAAAQMDAwMDAwMCBQIFBQAAAQACEQMhMQQSQQVRYQYicROBkQcyoRSxI0JSwdEV4RYzYvDxJCVDY3L/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/xAAkEQEBAQACAwADAQADAQEAAAAAARECIQMSMQRBUWETInFCgf/aAAwDAQACEQMRAD8A+Q6Sdkk8rpUo2DusWlAcJAsulQZa0Lz8+65Zf0spNtKv2dklMwYK0NHKceP9anf0rQmDLSmgG6Zk8rfo1OlcXgowrNvuui9pH3Wsw7I1pCYAboTsYO6LGwVLJU7IW3uoG8q5zAcJtsiymRVH0ybo7SDZXRwU22QqYpDL+5MaYOFZthEKLisU7qbIKsGU7WzlMpioA8qGkJkq0ATdMYJ8qCqLKQBwrm4uoWjsrEIGyEAwgq1rVLgqpqstgIbJVwAOU0DhMooDb3TFnMWVsElNssriqWN8KBnuurwAAhtSmKyByptlWOYEzWkKJtUhnBRNOeFdtAMoYthVdU7LpogqwCCm2ymJ2pDUQyBKtLL+EYEKaT/xTtQc2FcGzlEt4CsiqALXUgK0t7oFoAhXAmybhKWXVrRtCNiJUw1UAg6n3VhGITxPCKoDUzW8lO4ECAj9OGyVEU7bo7OArQ210QAFTFTqYHyhskK0kE91Nsq4ZFOwDhQssr4OCESzwr8FAap9NX7bqFp7KdpqgU0u2+FpaAMqFgPCa0zBqBZ3WmBgiyUsE2VRl2OOE+yBdX8WChHdKM5YOyAbJVzgeAixkqYKHtgJADMLSWGYIQFItNlcidqDTkqGnaOVo2gXKDhOExWZ1NAtWgNtdA0sRYKJdZ9gBlEsEYV5piLobYwqmMuw7pThgyVeGQZKBbfCaYzuZJ8IBgiy0bbwEdgFk1cZz8XQcLXFleWJS2bFJYTjigtltlUWnC0kQYQxaFOjXkdIZEnldKhAObLmaIyy/ddOm0QIWLP6syfGpoEyrmCFVSYtFNl+6kqiBOEzWiL5Ra3bdO0ArUMKBBnKdwm4R2wmb5Srivba6m044VhhBsz4SGQYgWRCm3ujEYlaxcCxTMCmy0ohhyVEyo6wwo1sGVZt3DypHCYmBAPCMdkWiEQDN8Ji4ECMIbRwni+UWtAKYhQLKASrDBwiBCYuKw1NFrJ47lQBMTCRhM1oT7BEhQATdNADR3R2GPCbbBlGeyIQj2oAQFc2IugWhVSCykdlZtBwhtgq4E2SjtkK2wSkEYU+BC21gjB4ynAcBeyJABurorMzdEN5hMM4kJiJUFJEIiU22+D8oIEOLpSE8SUS2yorAgQUQjEFRTuom0BQXTBpKm2M4WWspCIwiZiJRtEqQIVyIABPlH5CZsAqOEmysAMTYKFvtkFFrQSrItCopEJ5m0KQAcBMBzygQMMolpmFZM5QyVO16VlsIAQVZG08lTbKuf1MVuEoRCtawKFom6qYqDbqFiuIluEpkwEVUGgFEjsE+0JnNG3yoYozlCI7q0iVGgDKq4oc29lA0hXuAQcBCGKSyboBpwrYmCke102UQoYcJCyDdXcwEpbe90xcipzDFlIMK73EYCVwuqisCDbKhHJKsLQW2yl2kBQJ4SvAVzWEqt7SHRhOkVmnykIj4V0EBUvBmCofHj9EyabRNl06YFgFg00NAhdGiJUs7P8A8aWDhaKYM5VNNpsVopiSkkUSZynbZvChcHOiEQ0geFV0QAb8qbUWtsiE1eiht1YGzZQGeLo3BV1DBsCFA2CiLBH5WQDMShM+FZFrIbJyrJGvZG2wpBmUzW2KJBhP/E/9QAZUc2YKLRIkpwOeFF6IGcFFwAACcgnCAFr5Vyp0Gz2pmw0YunGEQL4VRW5k3RDVZtU2HhDAxwo0d1YGCFNtuU6QpbNhhTbdWNA5CJaiqoRHwrA0RdEM7IE+FAO4VmxBoKp2UBTb3T7SQgGmMqU0rglIn5TxZPssLqChotHKYCE5aWlEthaFO10pS0yriIUIthDFYF5hK4EnlWQUD2UCYCAbIkhPsUu1U3+li3hThNAKABmymRdDbayG2E+LoAymJ0AbKYAAXRjg4Qgg2TKJG3Cbac4TAGJKNyFTf4SAoB+E8TgXTAIisDhM1o5Cctk2EKQZumLpAJdBsoWQU5BPCZrCDNkRTtgo5yrdt1Cw8BDVMRlTbGQrS2R5QgucJBhBSG3lSLzCvDL3FlHsAwDHwis5ygACrtgKUtgoistMyVCJVoEpCDNkWE2ABAiDdW3wQlIlF2KYuoWhomFbAhLBdaLIarbiUIMyr/pwgRAwhmqmtKDxZW+03SPaSbJiXpUJAyo4TkqwstBSlpPwjKp0DCrcJ4VpHhQtgIa8VpWe0GZW+mDwsWkBYwAYW+gJXOVmWVqoNJFytDQAIuqWAiOy0sarrZmhO09wjTF8SjtJJgJmiDsITRcIbYxlWAWxdXFKWwjaLpg2QjEZVxC+EYTbZhWbBKKqu44TbSQrIvACJpkBDaQNR2lO1hiU4YQE6NUtbOVZtMWThhm4sjtIKGq2zMQnAHKYnaLBFsHKjV50A0BEiEwbuTuYYVZ1WLIhOGWuEwZAVxOyNYCo1rt0GI+VZ9MjBTfSLTA5Uw9r/FQaC60pwyZlW02Q7CO0lx8JgqLREDKDqZixEK8NlH6droM+2yYC2FcKcYElEswFVZ/gfdAsJMnC0GmRayQsO7P2RLcIadsWUazsFYKZ3SrS32qE7Z3NMXCBmLLQG/MJS1oUXFBE4SlpGYIV4HhBwViM8DAN0uy8q807yj9OTAVGYtvZAtnK0OYd3YKFg7KCgNtCG2Cr2t/CJpyJlVYzbZKIZ4V+w900WuoKY9sQi1tlaAOyLRBPlNFQgFOGyMo/TG6UxbJiIQVMZ2TBhm6tay9k5bGFUxU2mSZEqOYSrYJTfStMouqQ2EdqtbS7pi3gIazhpwnDCBwT2VwZ7SbSEux2cfCG4qDTGL/CIp9zCu2jmZU+mYwjW6o2QPdI7JACCtBaBkGUgZ7rggIxVQYZMgT4VZZe+FqLCD2QLREwi9MwaRZqXbBiMrQGQUSLXg+VZDpn+meErmnstBbZAtNoSwZiHERFlNoAsr6g3EbpSFsGDKhqqCYtPhEtERgq0tjF0GsIMyllS8qocwC4CkgwIgq97HOkBJ9Ow7p2aocz3d0Ntle5v5S7IyhjM5kpS32xC1uYBgKqoyB2KDw+k9zBaFvothY9E2KYuulSbuCzUxopst4V7GSfCqotItwtlFvtlFKBBwrGjcbp4IIKaCT4QLs92E22E8QUS0uMgWV7XpW1spw28EJmMIunDTlF1WKc3UDPcrwiMxCIr2EQbJvpk/Cs2E2TNaThBUGADKLWz4VuxFrAHBDVYacBNsJVpbB9oRDDIRFP0zKfYIFldsKZrJb5VFLaf+kJi3jnsrgw/wDwp9IA+UCbNoALbqBkq9jZNwUWs2mCUhqkN4i6jafdXlgmwKLWk5whqosBAAF0xpkYBVxZDVNoJufsgqDICG0TJn8LQBYhEU7eETVIBPBCUj4Wg3HCgYSUz9qzAXQNO8kXWkNO6+Uz2gi6UZS2YsYTNZaDlXCmAJAUgxIAhE1QQAQDP4UNPsFeQSQcIAe68orL9MGQEHN4K0uba2QlLZyExGbZHkKEEHwtG0jMQlcJkAA/KLuKYulLZwr/AKZAUDYChus20DCJZIvhXll7CZSkcHCCjbOE0Wh1lc1o4T7DkhVWcsARayTcwrNkm6f6dpP2CiapDR5Ray5Ktpsh8/wncwmSDlUVsbIiCmazAMgJqYLVZtnH5QZw0Ndiys27rDHhMGkmCLK0U2gwqKtkiAIUFMxZXFsG2E20CJUFAp9ryiWcK1wF7FQ/H5CDPsunDLEjPwrdgPwg2mJJHKup2oLJNwPKYsaGwBBV5bZIGx9lBQ5rsQT5SmmI/aVrESYlKJIIASKzhvhK5g3G0LQQZj+6jmyB3VXYylgbPKDmAiMFajT3t9uQqnUyMY8pozECbYChprQWAXgqFthEoKDS9sgJAIdMStDmnBQ2CQFU3FLmnbOFURuOFqcx0m8jslc2R7gtQ3frOGndChpkk2V5bYRIQLbZKxYdMhB3WSVKYI7Fa307TF1S6dsQsleD0tmiV0qLOQselaIG48rpUBH+yzGV1InELVTEwqaTDK2U6cq9NDtxKsaIsQnbTMSbgJiLSBZIaq2Xsma1XlocBeFGsGDlXNVXthPsdAsfhWhkpw2yrSjaAZKLWzfKuDJtCdrABBRmqWiTATbSAYVjKQm1laWgXGUxGdjZKLmXkYV30wMC58J209wEwFMxFGzdciFY1kkSrRT9wAum+nJgAx3VVV9MEz/Cf6duysDQDAsnDe4+yIzGmQcyFYadhAkq0NN4EBWAGBx8hDFDW3kzHZPsGYVgHdNtRVBBE4KIZzFuyv22goBgBMImEIG3CAZImFaBPCYRN1QgbbAChFrJwLqbJKiqQ0QbQmDQArA0f/KO0+ERURIhANV0RhCLoKywEoFgVpF7CERfhBSGRlAgA91c4cE3SbbSICGqnAobOYEq0g8gIxOMdkGdzAB/wk2HdJIAPBV5aSYsAo+m0j3QT3RFMeJlDZe4hWFpmRcIiCPKauKCzblBzZGLrQaZJGY8qFjg4CRCabWb6ZA/2TBrovZaCxKATYQPlXVVbe4t8Jwy0pyHTf7ItntKmMK9sAAJw23Ep9oN8fCJHYI0rLQRcCUzbCCE4beU0DyhhA2/hEsHlMBOAmAtkIpdoJwiW9rpyCBbCgbaUTSAXsoWk4A+6cAzhSJKuGqiJMQiRIwri0FQDiFBUB3Shom6vc0zaEobcoqpzb8qFsXgq4N+ECCTf+ETpnDRki6gG42iyuLeyaJbYIrO8RYW+EuwWB5VxaSRH3UNPvZExSaYASmzeAeyuLTxwgWyPcAUGZw9qApxPC1bAWwEopwZMK6qnbuGLpDT9platgxCRzbxz3TUxmNOR/ZJEEgiVsLAAJISPbEGJTf6MrwS2AFnLSbFp+y2OYR+1oCU0yQIOcp0l5Pn2lZuAJXTpN7rHox7RC30Wkm6ylkaqLDC1MHACrpWAAytLAfCqxGDwr6dMkQgxt5C0NaW3hGoqFPbaVYxktBIgpmiXYueU/0yT/3TFVbYsbEo7LycLQ1gi4+6jWO3Ahp2+VEI0DbiEGwD+0HzCvYDeBIT7IOAAqKA0wQGz5TBu4eVd9OBaRKgYdthymoqp03XVlNkHMhWhsG8FQMiT/AQIAJ7JwLWhHbNw1MBIgQEJVewF0wSngyE7W2wiGgC0oKz2CIB5Vm0Jtn4RO1e0D4KIEYCsLfCgbeTlE1UW+UwAjyn23smAPKKrAjujtThp4KYNJ4JQVQVA28xdWkGYwiAiqttrhAAwYCtIvCIbGBKuIqDbXypAPCsDZKJtxKiqS2RdQMVkHsiLDwiKiLXygADgK3bY2QwEFTgALj8pIA4T1d0LO+qGD3TZBbFpSkSO6VtYPEtu1K2oGuO6wKNHEdkpZ7rRCNUtIBZcoNqQLhES+4hAu92LqtuqY6oQLDyFeNpGQZ7JgU4uEdstvdM0Jo7oFAtcKBscJ9vhAWOUUNsmAmLYRbE3MJvKIVsGxTFgUbJ7JgDZF0oaBgIgHlOGyeyIEGyIWBF1I4Cs2yFGti4lAkXU2gcK2LycKbFTVcAxa6haYsrNpR2woKolDZyrAFIvZUVESmDQE5CWLGJKmCuRdSOVbtsLJXNtb8K4qogSg5oPCsAjj7IxH3VxNVNsleAMgkeArC0RcQoWnbaJUoSLWx2SlvhW7UsZnKgqgg3SuZeZVxAAhTZblUUECIuUHNAgiVa4EfKhaQ0k/ZMPih2Mfyq3MJwYKvDJE3lK5oDbj8KM2vn+hHsHyulQaJvlYdLSLWxPK6WmbGRKzjbQxsQRlamsDmyRfwq6TbgrXRaZg4VRGMwALK9zQAO/dMxmY+ytayY3XKumkazcJsmAaLcptp7QnDbefhDsrWgAiUS0xBt4TtZESZKbaTlTBW0YAbACMGYsQmDbH3fZM0EcWVCtaIMCUYMXsrIGbKERhDojWmyYAzf+yYNMzyjCJoAHjCO0EJttkzQIshpQCOERBTACUxub8IaQAfdSDFk+0JoCKrDTKaJtyrIEIbYvCITbBARc2eEwF5Cdo4JRYqDe4CeIFlZGcIQgQCc2UAATiJULRNlTSRwENpnKs2gWwiG9goiuEALSrDZCERVF0YTlvKhsIhU0hgBUVakCQCUup1AYIBG7sslPUVJP1Q0DiExpdUrueA2m2fJVNRm+fqTbgBWMqM2kgSSs9Wq4A74AUOx0+1odtEAJXRV3AiD4XJ1OqdpqpIfY9jKQ9VBZA2g94uid1vYBRfZ0/KL9V9M7mw5vIXEq6okF28lVN11iE1qca9H9WjWbuYRKFKqAdsH/wDoLzdPVhj1sbrWsIOQpq5/XpaL2bC2S545hGnUk3ghcXTa1rpk3N5WqjWINzZEdgAQTwiACFk0upa8lrjHaVrbY2uqg7bpwLYUiRhEC0jPlFQN5R2khNayYNtlEIG/CZrMzhMGTyiBNlQoACPwmibJtvIlNTSQYvYKfaycNlSCYARdKWkCQgAScKyCOCPlHbPgoKw0IbIucKyCJsgWwqmkLZS7b2CtvOESIE4KhqstCDg0GIlPHhQiFFUwN0xlHaZgKwttEfhANgyAqKto4kobSeFbtO6yEd4KEVFvbCBEGYVxHtQiQiqXNBylIteYVxbfFkjmmQeERWAQ69x5QdJHCtIkpQ2xwhqkNiYkqtwybgrRBnwkcG4CI8Bpfc0fK6dJm0A3WHStbYAcrp0RZYK0UWNJGZWumy+SqabBAIWyi2BIQkp6YDR7lc1vZK1s/uwrWU4EkwrqoAAoGnKO0hWAADkqqrLQiG+YTxdENIMyh0XaTwESAOU8IwCL5RFbGn7JnAkBMG4zCaMcIhGjvlEt7q0Mi+Uds5QVhvwEQALJ9vwjtAGboYRoIIhMWwmaEwZKqEi9sJiyBlMAMIoKwyLo7ZTlvlEDuhhAItCPKfaJkXChaIm5Q0kGeE20xynAaeJKLmyLBRdKWjEXQ2yFZtjCm29/wgqGM3QEgq3aA4xCgEuuFWdJtnlKRFla5gP7VVUAbPKYqtzg25XP1usLWn6YJAyVrc0PfdUVGg1Lj2KGOXSD3ONSpae/C0NNEtJkGLEq7UPYCGvEBcfU1WUKssCutL62toUHDaS5vNrrBqep0tQ8sLw2cA8rF1bU7wLg/C5IpF7g4G6xy5zjHbx+Llz+NPUDtJLcrnsc97pC1uY9w90mEWUtuAvPfM9/D8P+q6TniREhHaSZC0Bp2myejSO2SFzvlr1cfBxn6YXsl10HOc0GF1DSBbi6pfphCTyHL8bjf0wCu9gGVv0/UHwJdPyqXUREEKr6N7WW55v68/k/Cl+Ozp9e76gIAkecruaDqlOo/Y6Q7sQvEy+k4EFbKWufIlejhznKPneXwcvHXv2VA7BEK4EGxXj9B1JzHy4kEecr0vT9azUt3UzJ5XRw+NkDddOPCjSHcpgFAIIMpgIvKIAnMohoFzdU7QNdMqBt/dMJxI4gIxYZKAARYKRFxCcQmQIYIE5ShsOVkXlQgTZAm2SgGd05bdFU1WWzgYU2mMq2DfuhEC/4UXVQAiCPugWRaLK0ZxZAgE3Q1SRCEK85thIAJPCKqgCcqRIsrC2D7boYCBIA4Sbb+FaBJg2QIhJAhEiw/CTbe6tLTlBzTkhRFW0DmUkZV8d0pFocIWlUm3wq3tBiLK+CBcJXxE8qYx9fPdG2QL3ldikHRFoXM0hAEQurpmktEFZsMbadMEC8DxdaqbTMcKmkCWwVppBI1qxgiBKsDVG9oTtE4VoDR3RkYTXRgGxRQaDyiARlOGgAThEjsECAKbVYAAIKm08K9IUAkWCaJwE+2wlRDStHdENvfCcBSDFoKggZIm0IBoMpocBMhMTIkqp0UNEwFLSUzReYj5TxJUNJtgeE2yYTgQcIxhDCBsWH5R2gAJgEY8yqhIuAMIkDtCIHYIwUwwAPF1Cy83+6a6Lu0IYWOykJgLKW7KGFjsptPCJCgthVCRByqapIzdXYN1VVIlRWfZEkm6xairtJcLgceVtrva1t5lcbWua12+sQGC5BsEO2XVPLWmo6S43vgLyvU9a99SGlbOsdRdWqObScdmBBsuMAXuk5XHn5c6j3/jfj+/dWUazv2kTKvY1/+SQm09MHIWymyF5OXO19Xh4ZFenNQMLTBDsyFoZQnCZrJwtmnpSIU+u2SRk+hC0U6MNnuurpunfVAjK6Y6MGsEtM/Ks4a53nI8uaDiJ2/wAJH6eWkwvVf9OLBJasWq0xBIDT8wlliTyvLGi4EyFX9MyZC776IMgi/lYa1INkwuddOPLXHey5WWsC02sujXbeVhrkA3WuHL1rPk8c5wG6otA7hdbS6ofTp1tLUdTrj97eCuA6Jslpah+nrBzcL2+PzS9PkfkfjevcfTOj9QGpZ74nBXWaZ4XzbpHVBp9Y58/4T7lvYr6LReHsHNl6Hh+NEGIGEzZ7X8pGWPKczMqB8nMo2GMqtp4GU4ndeIV6Q0Iz4UCYQD3TYYUXNk9wgB7kwwZChhZnNkABPYIxaUQByU6RDtiRlKL5CsAsQgBaCi6rxPdCJEKxwvi6EGcWQIBaDEJdg4Vse7v8oOHZFVke3CQ4MZ8K6AhF557oqoD5KWHcj4ACvIkgoG3BQUlsi5v2UAk3srC3wlf2CuIqLYMygWk82Vm13IslghDVZF/KR7ZKuN8JHAgrKe0eB0jRsbaSutQJcZAhc3TD2iDeV09ODbbfws+2p03UmmBhamgRayopAiBAWmmJOJWlmLG4vCsF2gBAQrWiEaJBFym285RAknIRAjhAG/wmACaJFlA2RMhEAwAoPhHbHKIzAVwDPEptqYAttEeVII+ERB2iU0FxgAhFoi/KawEoFgRGUSI8/ZHm4KKCAdlALIgfhNEIFF85RA7Ikc8eUf7IiEW8IRAnhNMhSYagAHeApE/CMeUYg5TQIP2QgZunIv4QKGFM2yhCZ0DKQogkwLgoASpBKhJRFbmgZMrOf3k3utSz1ABJ4TDGbVVGN/cYgSSvn/Xerf1WuqUGO/w2WPyt/rjrTtLoqzKJH16g2MXi9HIp7nXc65J5K5eTn6x6vB4bzbC73RK00cglY6Yl66Wnp7iF4eXKWvt+HjOMxopNIK20mhV0mtBAKvO0RCz1Xe8lrGXELo6akInkcLmUqw3QtlHUCmQcgLU4ufLa7+nd9BoeAO/wuuKoqUGP3CSJuvIO1TqguPbMha6GrqOAacBduPJ5OfCvRteKlnESqdXTpEQAJhc+i58y1Vaupqts7QB4N1q2MSYza1jdxDVxtaQLHK21m6iSXNzyVy9S5273Lz8r/Hr8bJVHtXL1QldOs4EQFz6+Vh6oxR3VdS4MZWlwGFmrCDKcbZenn8s2OO7VVKGr2VD7XGF9i9M68arSMIcHQIlfHOq0w5u+JcLrqeivUFTQ6nbVJNF5DS2f2+V7/F5Padvj/k+H17j7YPKsa6AsmlqNqUmuaZkStTf2rs8h2m0pxjKpBIsFY02vdENBi8lOO3CRuMIjKph8FRuYKXcVAUDPiIUGFOUZ7qodsnMFBxjhAk8klSUNQxkKTbagHTEAo3OQnxZqR90CAMp8C9khvcZTtSxeRhAgTZOARlBzUUhCJb2RH3UPYZRFd57pf3G4hW2i+UoEXsidqjAJi5UmGzkqyZcgRNuEO1MOdeEjxaVoLRtjCqewgQVlPrwWjaCwEXPK6umEnFxhc3RNAb4XT07b3RNb2XMx8rTRAiVnpzAiIWmmQR2RqWLWjnlWtEi9ykZmeFaGzdFQC6gThqOz8opYgWTNuJx5U2xyE0SLwgUN5db/AHT4wEYtiVAHTOFU7BwJCaEQIyiAomlhNAKZo+6hHfCCbCpEA8o7QPhERFv5RMAWGIR/y5RaOVCJVO0sbFSyIEIQAbJglwUbEKA/6ipuHF0A/uoTPH3hQebKRyol1JIypgIOIm5UHzKpLSm4wg6wBiUXZsgc+E1QmbYQx5UcJSvxlGRJgGYC5vVdX/T6dzicCVtdIzcLwf6hdTbpdMGSZdIARrjHhus693UervmTTY4gHutLY2iMBcjRGXbzeV0WOJtNl4/Ny24+r+Px9Y36VsmV1tK2BK5WneAAF1tLUH0158fQjQy1yo5znGyDT+FcwWUxqK6bCXLdSYCACVVTs660NA3CFZx0ro6alT2ND3C+AQuhpqRpvlrAAn0YY7SEmwCb+pbVdtDh2ELrOP7x5edtqz+oLBBIzaFVVfVqh0iW8KirqGssSJBVumrMeZLxPYreOeMzqUs9+flcDqAaHGMd16TqNelTbd1yLALzmqIe43C5cpHo8VrlPuSsdW5wuo9gAWOo0TZcq9U5OfWFvKwal14ldDUuiYXK1I3mxMpHLyVi1R3WXCrOfSqu2GJXaqg7isFamHPJIkr0eG9vn/kTp9d/T3qw1nR9PRrOnU0WBrzP7vK9i02E2K+Meh9b/S9Q09OQBUO0knC+xUXS0Tle58vMXg8pyQcqsGTiEZvKYataewsmaZ5VbRdMTAUTs5KLcXSTJAhOMKwMASeyIJBSbrpje6qnF/HwoR2Sh0nFk09sIg5tcKGxxKAJGVC4ZUUxuMSpFrQFOMqAGLwqAZnyhBGTZObWF/koESMqKQtG65Ugk4RgAymkAXNvCJqsgzwoWgRMfhMYODZQttKpqtwEyAlsQrB8ShET2UTtUWyIN1WQWg4hWubacKt0E2iVcS14bSEbRtMrq6duCRNlzdI0bZAsMLrUP2AEieyzU/zk00hAAWhoj5VFPcczC0UwJwSjUxopCycC9krE4abkI0YSL5hHbMHlFgAMnlNEjMIFxmCjH4TCIuoAiFiRBJTkHbxKMDum247oFAEXyi0QcIhpARI2wqibZ4R8TZENt2UIITAtwfCeBtkEIEfdTbe/4QHNrKW5R/ug5pJyVC1O0IGR8KeEeFWSE+EwjgKEoAwLpq6JKQuJNlHdh/KEwLFESQDdAOuZSuPKKCAzhQmFCZlKBYouibhKXGLQpcfCQm/KGxVqXQxxAvC+LfqPrfqdW/pWul7WyR2lfYepPLdPVLThhJPay/PdR51nWNXqS4vDqrvf3E2WeVyNcM1o0RLGAFdKi+QLLAwe60LfRI24C8fkm9vr+KTPrdTMAWW/TVYhYKF4BW2lShwhcuo9fF1aLi8CBZaG+35WSidrU5eZWc1te50GUzNRtNxdZS7lQVRF7Fakadal1B4p/Tvt7JGapwqS0+Fz6VUXujReTUIW4nrHQfXcJchT1b2j3GyhpE0Sbrm1HFpMlaJx4tmo1hec4WX6pJN5WN9drHSSIVT+oUGZeAsWwzjG2pUVD3SCVz6/VqDT+8FZT1ZhmDKxYssadUNwkLnuBlT+uDiZwg54cJaVJGOWVlrtF1z6jm0nz3W55kmVz9RtDpK7eOdvN5uOzpfpTsqiqDG0z8L7b6f1f9X0yhXB3tcwQ7/UvhNCoTWDR+0r6z+m2odU6H9Jzv8AyXlkdryP4he3jXxucyvYtAN7owAR3St9oTkrWuYgybFMJxwqwLpwY8oLBYJgfsqg4RhOL/CKfdcBNKpuTmwRBdM5CKtJhGZthJE4mERIKqLQfhQcqsflMDCLhh+34RBiCgDIwpzFpUDE9lCoLZCMgnN0C8YKmUw/ChJ+U0KAJsiMXCgMI3jMpoXaYskLRwrD+1CBlDFREiOUkAXsFa7PdVubZGceF0pc1tsSurRHtBOVztKBsjicro02wIkwpn9TM+tlIHN/wtNMASs9OYHZaKYvc3RZVwMQbwrhe5sEgaTBPuCtDQBZGhA/CaCfhSLJmngIpYOJhQDiE3EFQA4CqWBfmITC+URi90QAIIlVMAC0zHymkHKmTcWRjkKAgWmbIRe5UMx3CBuJEfdE0yBF7FDPKZMTUMchK4QQRJRufKBEi2FAbZgFLzhE8RKBdZVQM8oEeVC4HKBOIQA8AFA2EKOMFDdMzwhYhKUuM2IIUMkWSmIg5RDQSM3U3RZVy4HwoSd0jCincZAypAn3n4STeXSo43sg43quq+h0HqD6Rgii4A/ZfDKbWUNOGsEWwvvHqWl9T0/1C7S76R2ieV8F1dQMcVnl8dOH1bQO4zK6emErh9Oq73G67+kPsiF5OfH+voePk20AJC3bg1sysNE7blZdbq77WuXPp7ONdE9TZTdBVdfr9CmIcYXCeHPuLlcrV9M1Wrqf4YJ8Lpw4ytXyWPRO9UUQSBdLS9RMqFeTf0ivp5NQEJGj6eCtWcYzx8lt7fQNJ1RlU5hdbSahrnTK+babVmmRdeq6NqxU2tBklc3o48teqra9zGeFx9b1JkEzBXc0nT3amkQGkmJXj/VPTqtJryy0KztbykcjqnV3bzDlwdbr61W7SfysOr1Dg4gqqnqxIByt8eOdvNz5S1cx+qe6xcV3+mMrBk1GkHyr/TOmp6kguheuf0+kynDQAnLl+nOa8y4+0zZVU9SWv2zZdHX0WsmMrzepcadbPKxjpv8AXccQWSFzNdcLZo9zqYJVGuaNpgXV4zty8l2MmlqAPEr6j+mDwW65oBjc1+eYj/ZfImOIqySvpX6Tahzepa+i/wDbUpNc35Bv/devjK+V5bNfVOAiT2SAzlNNrLTkYmAiO6QHujF0FgcD2CgJVcwmm3lVdWbiOExILRwqhEy5GR5hE1cDYQVA6+VS2R8Jx+6FFWyO6eQRCpPa6YSribVoN8omAZN1UHIjyi9rCb+ECSFA4BESZCdJlPEgSSpgIBGbJqpJjAQm8IukAKOAzCAc2KNpKHPEoOJNoj7IfAIE3SPA4VjhaYVRNz2SJrw+iB2AON106DS4RmFz9GQRIGTyujRyCptv1jj/AK2sEC6vYIVLL4CvYO+UjS+nO1XNCqYJgq0C0K9KMJ2i3CDW95R5wQmqJIt48JgL4Qa2TOU0ybSECnMJhItwhAJ4PlSYKidCVMDmESLIX4lUTOTZS2E0flKM4TU2jFsJSOyJkEwULjKAi2bJT8oyUrimCE2m6BvflQ4vZAnlDAKmeboEgpT4RcHzKV08IEjmVN0tsmoDnWzfwkIm8qO7i6W/wgaYESgIAKBNlARGFDTXgGbJSQOUAI5UNhbKDneop/6D1JzRJZp3uA+y/PPUKoexjmODmuEyOV+g/UOsGi6F1DUPwyg+R8hfmsN+jpqdLdu2tAlSunCduh0pwFUXXq9PBZZeV6SyXhwuvUad+wCy8fktfR8VmfDV6uwRK5QmpXyupqabKtMuBhy4u8UXk1CBCxLI9MdrTUwIm67WjFGi3fULWAckwvBVPULdNUIZ7yFw+q9f1epfL3ujgDAXTjOVc+fknH6+geqOqdNfp3NpP3Ve4avnOq1ZFQ7SYWEajU6ioAC4z2VtfT1mskscT8LrOGfXOebfixuuIOSvdeidTTL2ud+4r55p9NUq1GtDTJML3np/ptTRFhqSD2WfJxmdO/h3lX1jpmsNN8tggiCO6856rB+jVkmSCul0l5loFiqvUdAlriQYIXl4/wDWvZOEx8F1rn/1Lw7uszbPBley6p0T+prl1AQSbhYWdEFEn6zCT8L1cecePyeLlvTlUerO0oAEro6b1fqaYhtRwHbhGp0HT1yd1SpTHENB/usVf0/9OoRRe57eCQAt31v15rx8svTsM9SHUgitE91mq6ptV8tuue3olcn2gru9J9Naohrnsdt8rneM/VdvH/yf/UdDp1Ko6iHVHQ3srtUWfTMXXbo9HFHTiapBAxC5Wrow8tJELls105S5287UZNSWi6+k/pTpj/V6yq4fsY0A/Mrwn9Of62lSpgl1R4a2BNyV909OdIp9KoFlJgDnAbz5C9nC7OnyfPns6rU4CYiyGF0cMQIjOEsHKM2uoYNxPZQXQJAEDlQT2KoOEZCWD4Rx3RYeeFBIddJBJBTOMoLJvAumBvlVj2gSU5IPKaGnuiLmQfhIHAnymJMZTVWZBBUEckqsEn9yYZvhBYXYAwmaJsqiQIvCf3cOsiHMwgI2wEAYBGURjyqYIkiDwj90pJ7IAACVNTBM3Eqt0AYTl27CQ2KI8TpKRIa6TfK6dEXvwubpgTyQ0HAXToRA2mPlTdYkk6bKQm82WljMD+Vnp2sCtLJ3AI3MXsbtGZVrf3cn4StA5sE4EYhXVMDJgKCBmZUaE5AAUXCgyUYEXF0MKAybFAZtCIQxYZUgnmFUNOUN0wh/dQk9lASbpTJP7UZU3XhU0ombqSESBmUkxmyCOgXB+yEz2ROO6TKMiTe6DndzZSCDdAkZgJigXA4MpNxjAUME2uUu6OT9kELr3CBIHCBPPCUkEqJp91khQwUZ8IJlT4UkRgKZxb4QEGEvyo4TF1ACOUVwfWNL63QdcwzDqLwI7wvzuGF4JBkFfqGpRbWa6lVaHMeC0g+V+b/6CrpOta/QaiztPWcyOwm38Qs8vjt4uPuHQ3bH7XDC9fpn0ntAdlea0dD6OpIPK7dFobBC8fOyvf4Z6/W3W9PFWjNCoQ//AEgLy+q6H1OrULRSeWnmQvbaCowNE/uXWD2OZHK4+9nx7Z4/Z8nq+m62nd/i0S057j+EP+iNqRuE/ZfWP6dtQQQCEzegaOs3dUYQT/pdC68fLf2l8EfP+mdJp6am4U6VNpdyQJQf05tSvsO1x7Be8d6Y6e1xLhUfPH1HR/dXU+m6XSNihSYz4GVOXL9xePi4x5fpHp+jpao1DmD6guJGFt1DAagMCxXf+m2LrBqaLZkLHtb9dpxkbuilstJFwt/q+o19OntAB2QfK5fThtteF2vWRY/TaE0iCDSG8Dhy1py6sfONOxx1Rb5XVrdNbWp2aNx5hJRY2nXLnLfT11AHaXgFVr1368xqema/TvAGhNdp/wA1Igx9sp9P0vXVpL+n1KTe7nNv+CvYUajXuEQQt5gRFgtb/iXxx5XQ9CqNcH1Q0RwLrpvpCkwxAW3UagsJDcLk6us4g3XK8r/FnCRl1dQ/TK4Gqed0g3WzWahzQRK4epru3KcZbXDz+vGOt6NoHV+uOmAjcKbnVCPhpX3FkjwvjP6UVGv9d+4Gf6SpDu1wvtDIhfS8fG8Y+H5rvIwFsocogyiRZbcQiWoAWujHlQgwhhSSP2hGbKAIoAB3UBjF1FBE4V0weLIXhE5UEHNlDDtPtIN0QO+FXAMQmJKKb/NZORJvhVzfuEwMGxJCGHaRiIRBAKrEHkpgItwgskfdHiSYVYzCcFXTTNN7myJPZDhTjKhp5kXEKSALpe0KSCSCLhA8t7qtxE2RNweIQAJCrNeM0xMAAQJ7roUbWuCsWlA2A2MrfQEXiJ8KSxnNbKURGSVrpcTYrLTAsZWmmBuwo18ageCnaQMzKSmbcJwTyioJujfkShM2GU0d1VCe4yjEYU54RPhQQ2I7IiByluBKIxfCokxdCSiShNsflRNSbXSOwm5slNubqoAUJGUHEjlAkhBC4pCCcmExcYvMpSJ5QAuixN0jgQPCcRHdLMntwhhThLMKOylm6hgkwhIUJuhN7D7oAbIEmRdEmMoEyETEJi6Zrp+UojBKLcoYaBKg7wpPZNZF+EmcWXyf9UOlt0nqSh1Si32a2n9OoRgVG/8AI/svrWFwPWvTR1T0/qKQaPq0v8ameZHH3WeU2Ovh8nryj4tRqMfXAJ9wK699oXlXPdS1zCbbivUi9NpnIXi5R9b1zK1aR8OC7VFxLVwqDw0gWXWoO9oMrjeOPV4uWR0aVUtC2UdTIAcbLkfUR+tBmUemcdds1RGbLl9W6nS0lMue6/ZZNX1EUaRJcvCeoOpP1dbYHWlb49peOPZaXrD9U0lohvBWinWNYxyvP9LrU6eiY0ECy1Utc1lT2Ogrdn8Z9o9Vo3bT7iBCp6jXL7bp7XXNZrC4AySUtV+65dCz8+rLGbVVNpMrh9TpvdRdUovIc2+V0NfqGsYdzl53UdRs5jXC9lZ2Xln6dD076ic1/wBKu42ML22n6mypTkOlfIXMfQq/UiJuu107qzmANJWrKzOcr3mp1Ic6ZXP1FUuwVzaevD2gkpH1yTIK43XSfOi6s7gRyuTUYSTPHC3Pry8glKGB0zla4a8Xnn9dT9Hw8+vK7yBtZo32+SF9tYDAtC+LfpK40/1ArUItV0jzPkEf919qbi1l9Hj8fE80zl3BTGBlDIwob2utOQSJChEzKMWQRc0IAsAioI+6HJROoJwpHayCk8CyGjci6kwL3QGDBupPdAVADkiEAZPYJpsiiHRIUb5S3nCOcqKaeIRbM2Sgxym8g3V6TDAncSU7Te6qaZdZMJiDkoYtmFCZykBJyi2b3BQMZ5RI93nulaSDeZTF1vKIPCEgGbhQGGzhKTeUHk9M322HK6FBuLx4XO0wmxdddGgCe6WZWJGxhvdaKR2mYWen+6Tb5Wlju4EKNyr2GY8q2QBeVU3IhWgiVTTNIPhGUo+YRFwo0kAm6joCBHlQwBEqpiAxifupaLBAmByhPcK6gzeyMwLXSSO4RLh2UNQ3wluLABHdCQuvBKhqEcylmO6MwkdZ0nCoYmMpN0CygM5MJfm6iYcWbfJVZUkpSZRUm6Xm6PygTMxhVAJ7FQnulLjxbygJOModIflEARflDiDdTmyFE3wEWyMpSZ7phKakNbgKKAxyjInCjQmYQLA+Wuw4EKAglK63JzZDI/OvqDRO0+trMA99Cq6mfsV09E8v0zDPC6P6g6F2m9aapxbFLWNFdp7nB/sPysWlpBrIGF4vLO32PHd4RdTMGStbNRAAlZHANCzVapYbLhjtwrsu1QAuseq1wDTBXJq6twFyudqdUXDKThr1ceS7qHUHVJaCsmn04qNdUq9rLKHF1QCJXSIijF8LrxmF5stLV1KYLRMDCLde/feUhDQSqqrQBK05+2O3pOqOYImy0nqodMlePOpdSfaYSVtc6LJ6azfNI6fV+oOe47SuTpC+pqWbnTdZalYvMuK19JIdqmfK16Y43yy369T1HTMqaNpH7gMrzgc6m8h2QvUaiuz6Ia3gLzfUYD9yZ/W5yjRQ1L2xJstn9ZuAgrhU6kixV9J5+6xeLc8n8dVuoLnrqaFwJkrh0mEuBXa0jNrR3UzHPyctj0v6U6M1PXes1Tf/AMGkLb4O4j/gr7A1pItEr5n+l9Mt63qyz/PR9/2Nv919NAEL2+O/9XxvNd5FIIMEhE3EyjCBFsFbcewQkyjHlD5lRQIgypxKN8WUCoEKCPgI2lA/wijF0vflQ7uDZSO6CD7hMUo8JiVFSb2UIStEgomQqhgDCJMGyAdAxKE/+ygZt7pha5ukafBKZrsxMJ2HBH+lSRxY+Uh8CEzZjwibDgGMqOc6NqrDjN8Jpg8oHs2AB90Jh0JRPdQQORPcoPMad4LsiTldGgb2K59GnGe66NOCBtypmJO/rTTtkLVSF8j4WamDN1oY4DhFyNDTdMDzCRkkXN1Y0d1VQwf/AJUB4AKOPhQ2EtRRJ/KUn4UJkWhAk8kJ0gkyEJkQAlJ4CMoVNqhI4KBKE2RMAm10CQgQe9kjj7sWRDOPhKHE5wUC45QJ+xQEw2wulPwjylgj9x/lNVCYF7JRY9wjY5lKZwmoLiMpZBwpEJHSgP8AKhsLWQBgKTKi4kqZSxOMpgIjvyhgx5umBsQUAU1uUBa6Co4hSBCk9kS6mMKEA3JREzeFDHKJ28V+p+ibU6JR1oZNfTVQ0EZLXEAj45XgdNLSQV9k6zom9Q6ZqNK4SKjCB4PC+NAOo69+mqgtrMMOYchcPNP2+h+L5OvWrnixK5+oJldNzSVi1VAm4Xkte/jY42rcWi6wg7pMrf1Wm5tMGCuU2W+JWuPbr7LqFnSVvLt9IwuaKgY25sl/6lSpe0OC6yud9v6Z25rpiVHOJYSQqnaw1P2DKre+ofaQUt/xjb+1DwXOIhVVqZiMK+Hg2ElVVN5sQQVqW0vGVlNPaIldToho0ahfVPwue5j4vKAs0lyXty3jw/Tv6zX0RMOC5FfUirYGVxK9RzqhhxhdHpHS9drKVSvQpOdSZ+5y1PHXO+acrki6nLbhdDSte5wO03WfSaOs7UtpvY4XvZe40/TaNPStho3Rlc+f/X67ePfrk6eltALhBXQbAAJMIvpDcGwEuppfUpGmDd1gsccrpy6m2vo/6bdI1WirazW6obGVmNZRbN4GT4/7L3gPtPJVGhYGaWg0CIptEH4V57L28Jkx8bny9uVotMhQEYKAiPKO8Yj5WmREDi3dVuHYymIi/CERhECIQByCmsflRwHyigIAiLJXdmwoQRyhF7IaPP8A2UhS3dCZGUBi2UvKNhkoOiLwhptwhSf/AGUlipHBCgYGOVJCWwF5TCIkKgtOeyO0RM37JWm6k3sbJqrATHuUBjkwknyputwjNOCUw7iD8pQRaJKaZ8IYlxcGyAMA4KIgNJJnwEsgCwg9lDHAoi5AIN1soggWsVkoud9QhxAW6jY5lJ1Mc+PFooQD7iStLIcZGVnZA8LRStyq3P8AV4mI5RkjulbbAThFMlkmxKh78o8zEBDSlQic5UOeFDhFAyOyETkH5UP4QxymmGdbz8JSYCExbjuldEA/yoVCXEWS5zlQ4mY+EkyYVZhh+5KZ8KE9yoT2Ua6Q+ErrG8yjcoG5RNA4nhAmbyiT3wlcMwidhxYoQfshcWlSVRFJ4lCLyjKiiD2QM8mUPAwoboasbfwmCrBhO2TgobTAwiPhA4uoDwghtwhxJuEyGQiIy48rLrdDRrUKrH02Bz2lu7be/lagRHtRKWa1LY+L1aVTT1X0a1qtNxa5OxrXDF11PXmldo+vmswf4erbvns4QCuVpXCPcvB5PFlfZ/H5zlxlLX0TdRQLCBlczW9Cp7Wltl3wYNirarQ+n5WOPXx6uq8Hq/Tuq1ILNIRu7Gy8RrtLqdDqnUdVTfTqtNw5fdNNT2txdc/1H0nS9X0hbqKY+q0ex4yF6ePkz68vl8F5fHynpOpJqtDm2lenruoF7RtvC4lbpdXpmqhzS5oNiBlaxq2Q4uaQeLLHOe3xy48eXHquhSFFjtzhYqnWfRDhAF1zKmuJp7YWWpXq1IDSVOPjrVv8bdWRhoC5tWm9wIixXoOm9C1uroivUa5lLu4RPwuhU6bTp0hTLdxHK3k4n/Fy5vJdJ6JV1msa14ilNyvqPTqNLS6RulotApt4C4eiYKQDQIXe0ENublTlzvKY6ePwTgFTSMncGgH4VdQljYC3ViXTAsufqHho8rjjvmMtTkk3SdKou1/qDpujZd9Su0+IFzP4S1aoAM5Xc/THTHU+sDWAmnp9O5xnAJsP9108XDa8/n5ZwtfY8EjsnZB7gpWD2i8oweF7XxqIaDkoEQcqNJuERjj7ogADyQhn4ROeEJuqYFxhE54RJ+Eo8osgxMoDbyEJHChPYIBnAAQIIRnspdEJ+7KlzbhEj8JTICKP8JQTERPlN/lvCWQooi4Um1sIE9gp9lU09o8qAhIReyYC9sophcKEwQCFJj5QBmxv8ohg7smF0gHZQGMXKBzfJSxYnjuUTMiUjieFGa4umIcS7MlbqTgcZXPpxu8yt9DHb5Vv+McbrXSH3C0j2n/lUUyIEWVrfc4X+yjWL2ncJTYGUuLI/Juq12MwLXRDuwMeUCL+UDOJlQQmOCUrSSJIhESlJMSAUNEwckeEJPMJZIMlAmTklVdOYjKVxtGQgbXNkCJMyooH8JTAFihk/CAN/CqdDxKUnsj5myAUQQZSuiUTFyMpS6Y5VNSfMqOJ+ECZObdkvCM0ZM5ugbHylnuERJFrIag9wUA75QE8KXm6jQo82SkfKggi2EXTgDJKdphVhM1E02XSnHyh/CEognOULkXhEgRdK7ui4YARi6niIQBMWROJQrzfrjp39d0c1GCammmq0Dm1wvm9AkGDYr7Q8Ncwte32mx8hfJ/U2hf0zrFSn/kfL6Xlv/ZcfNxtnT2/ieSS+qguutumbuAXG+uXZsV0NBqDa+F48sfU42ft1Q3YIIWfUtlpha2V2vZ7gJVNUh0wntjv04Gq09N8/UaCfhcLW9KoPk0xBXqtTQc82WQ6B44stcebHLjK8NqOnFroiyv6ZpaVHUNfUbO0zde2b0ynUA3tuq6/RabQHMausu/tj0z9M+r686rTaxxdAEDsPhcupqt5sF2KvTmfTDSz+FmPTCHANYbrNkdJbGTSgvqArsbtjABlatF6f1TmgtpO/sr39I1VIxUpEecrPX6Z5csUtqf4HlcLqlcU8G69HW6bqRTltNxELxvVvqU9U5lam5hbw4QplrHvQ3nZuecr6f8ApBojT6Lq9c4Hdqqu1pIvsH+0yvkVZ5qsLWGJsF+juh6FnTOk6PR0mbWUaTWAfZerxcc7fO/M5/I6HYDCJIEQEBfhSb2XZ4NOI5IS4m8o2IuZKAiTJsiAD2QAun3bbQlJJMiyGBETOApbKhj5SusquGMTZCLXUBEXCB8YRMAZ8IlTygbi0IsiQoRa+FIsgUwxDB+EhEWCZ0wO/dKT90UD5UtPKPxA+VCPaSmIEdimm1hdKDaEcFRRFxcQUZgITAkfhSe6oYCOSlNjmygJPyoHf6hCJRLjH9kN2BF+6MmbFJkk8qsXXIokF5Ob8rdSjJMBYKO3A7rdR9zf4S4xNbKQBOfhaGycLNRADReVoFhcqOkixog3T/Fj3SNIuJKYOm17KxejDdN4KV04QB2ybyoTFzlFQyAImEHk24UL0hvi5UUXTa4SCSUTIygJ4hEo3Pc+ECb8qTe6V2ZARNQkRISm5UkQlbEwVA1hygSgXAcIbpyhIgPcqFSYlAkhUEgC6Qm/ZNnhAoA6EBIQMgiUcqCH5hAi/ZA2uLo3KAyiL2CSe6OeYQWRxMpmwVWBOFY26AmZhHAsULjKlgggwlgkIg8FQwgg4Rm8JRAvKhIMk2HkqmUxPyvOes+lf9R6YalFs6mkNzPI5C29Y6903pGmdW12ro02NyA4F34yvknrX9V62o3aT0+w0KBMHUVR73Dw3gfKl7jXDZemSpULX5V2m1e18ysjNUzW6KnXaAC4SY7rI+QZBXh5Ta+z4uVx7LQ6hldtjdbmtXjOm6t1J4g/K9Vo9Y2s0RlY9Xp48o2BgdwnOnmyrbVbNlr0rwagLjLRwrjtskSlozw0n7LTT0hx9O3wuhR1TZilSJ+cLQxznn3AAdgFLcceXkrjt6b9R07QF0NF0umHbnNBI7hbKVP6j4b+Ve+kabmhzs9lPaufLyNWho09waGC3hZPUTGFzbXAWujU+mYv9lzuqVS+re6lrn7OPX+rSYDc0yvM+pdBT6lpS2Ayo27Xj+3wvdad1N1MsqD2FcHqmmDS7YJapOXrddPsfG67Kmkc9rmkuBsO6/S/Suo6TqWjo1tHqaVZpY3dscDBi4XxP1P0k1qLq1Ee9uQMr5tQ6jr+jdUNbRamtpqzXTupuiT5GCvd4efvHzPyeGV+wky+b/pl+oLPUTRoepllLqQHtIs2qPHnwvo4Mrs8eGEcKOjhS3ZAOFxCCDyoTcxhQgcShAhXQMYR4nhDJ7KD5UVCQQlAHdE3OFIgWhE1P7JSR2MqTnsgHeFQx+UoucqTIxbwgRYwgJ+EoF7ZRGIJSzCGCc3QItYIkyPKgn7ouF8JiMIExwEQ4oYhuI7IRbyjM9ipkExBVShuIAwCjuhAYuhEcpp2kzPdBzkRfIUJiU1HHpD3G0LfRgNg/wALn6cktsJPfuuhSmLiAryjlxutNIRytDRaAIWVmMkFaWE7ZOVl0mLWmEd5niO6URFypx7SYTFM67pmyjjeR+Us90Pz9lV0d1ilLjxCgkId8T4U6NEkkd0gOZkphKQkT/siCTygXKFRxQK4xgIAyFD5CXd2TAwPeECUuUf7oAR3spMKEygTa6YqE3lQ4sUDAuAlLhOEQTxdTAQkd1M8qKN+yHF0Af4UJnlDTWhEEFVlwA7rDq+s9P0QP9Tq6VMjguE/hEdQfwiMyvJaj150OiSG6h1QjhrVxupfqhpaLD/R6N1R3G90BUfSJnJhE5svkR/Vet9If/b9OKnf6hhcDrv6j9U6hRNJtYadv/6rH8q+nL+JbH3o2BJx3XL1XXul6ehUq1dfp2sp/u94J+IX50/8UdR2lrdbqYOR9U3XPrdUe5kOMgJ6U9v4+ydc/Vbp1DS1B0yhWq1sNfUbsb8918v6n+oPX9dTq0q3Uan0n5az2R8Rf+V5TWag1VkU9bPrX1r1Gtq1HlznOc8/5nGT+Sspc4mSZSqBKs6+PcemKxOha12F1KggS264XQNzdAyF2KdWM3Xi5/X0vDuA15a6cLfpdW6mZaVz6rf8w5Q0zalWu2nTBLnWELMmvRI9p0RtfqDwWNJaMngL2mg6S1oa6rhZ/TVOnoek0GOA3NA3HklatVr3uO2jN1OX+Ne3Kt//ANNQbAAB7KipVn9mFipNd+6o4uJ7ldbp2m3kueLcBc5v7Yy/sdDLTuOeyt1GoBs6w7hbamimnLLHwuPqab6ZJd+Uy1frbuY6iJdNsrA5u553nOJVbaxHKamRWdFUgdknS+pXsizZWDViLEWXVNJ9Nsj3NWbUAVW+6JCLHmtRTc2pIb7V4f1F6Wo1dVU1FL9lS5bH7T4X1DYHtLCLrl67SFoIcLFSc7xu8V58OPOZyfC6Yr9H6tNNxY+m6WOFiF9Q9PfqrraL2Uuo0qWoogQXN9r/AM8rynrrpv0ara7WzutIC8YKhY+y+p4uXtxlr4/n4enLI/SOg/U3oepqNZWNfTFxiXsJb+QvWaPqvT9Yzdptbp6jfFQf8r8ks1ZabFXs6lWggPcGngGFu8d+OE39v12KjH3a4H4MppsvzF6d9YdR6NWDqGqe6nzTquL2/wA4XtqX6v6jaGnp9Au5eKjv7Qn/AB8v0XlJ9fZQ6JsgHXXgvSf6h6fq1c0Ncxmlq/5Tulrv+F39X6u6JpDtrdQoh0xAMkKXjZ9hx5Tl8egGEBHC85R9Z9DrO209cz5OF0D1nQNYS7VUYzO4LO43jpcwAUCIXHPqbpLZB11GefcrKXX+nVbM1lFx7bk1HSm9lD4wqKeso1BNKrTePBlWh4cLER4QOg7HZAARKYGMKhTPZDdObKOMmUCYEm6IKk2x/CNhcIF0qKkkgRHyo6xUBJ5lAm6uoYe6/ZAiTzHlT+ESQbEJoFuUpMWKJtiyUgnKJ25enjPfBW2k6xtdc+jO4h1r8Fb6Ijx2Vssc+51a1UyRBOVexwNwfsVnpn/VdXsE9o4Uanawm3ZQH8IE3vcKDwq0N/sVHGAhMWJhK4oDIBsgHXSnHtyUATETdMD7roEwUme6hu6ymKbPygUpMGEriZ5IQMSlwSgD3UJ8IDJMoKT2KFwJlQonCVQGBcXRlVEBgXuUCAUJBwputiFALSY4QKjiG5yvE+uvV9Ppmhq0NDVY7VuaW7gZ2HurJq7j0nV+taLo9IVNbW2g2DWiT+F5Pqf6j6KnSd/RUXvdwX2C+N67rmo1lT/Hr1Kjh/mcZK5dXVVC43XWeOfti3+Pbdb9cdU17iDqXU6f+in7R/yvNajqlV5Jc8l3cmSuK6o8nJQueSrM4/Iz/tb365zp9xWc6p5NyVSxl5QefdZNq6sdqHcKt1dxyVMpHQMqa1g/VPCsP7JOVTAlWE+xPZMU1FWmcZQWL23ARQUUV6z0/UDtEGzcLpOkGy8z6fr/AE6xpkwCvSl3ZePyccr6n43LeOCK02K9F6Tos+qa7wCQLSvMge5ey9JaV9WnIaQzkrk9Nek09StqatPS6Vrn1qhhjG5PNl1unNApw/8AeDtcDkEcJOm1B0rqGm1unph9eiTF4ifPC6mq1DNbr62sbRbRNYhzmAzeACZNzMcrNuMW6fTUDUcLQujRd9G0LHQ1FOm7I/KGq1Yj2uG4qbCO1R1tPaWkH7LBrWMqNsc8FZqFXcLhaCGETuWu0rnfSbugWSuAa68LqsbSN8/Cpe0VTsAt3KZ/qaop6mQGkCE2r0Yqsmk4B3gZVVfT/TzZPp6jqbpJJClqbI5OpbUY+DZwSFzardr4ldzWUaVdm6QDC85WDaVY9lmu3DlK4/XOmU9VSfSqNBa7B7L476i6PU6ZrH06gtlp4IX3mvD2Y+F5n1L0VnVdG6lUbtqC7H+V18PlvC45/keCc+P/AF+viZYYS79tiuj1LR1dDqH0qrSHNMLnvbK+jO+3xeUy5RD5VjKoZebrPtjCG2Stdxl0GaqplphOdZVj9ywBxam3StTnSSRtp9RrNNnEfdWs6nWBJY4tJzC55Fksq7v1Mtb/APqNZry7dJKsPV9Q4AOMgcFczlNuCks/i5kd7Q+o9Zo3bqFU0z/6bL1PTP1J6jp4+o4VRzuXzjdKLZmVq+vLuxzzPlfadP8AqqdoD9HLj/6rL1/pf1fpeu7m0z9Os2NzDlfmg1iDEldf091Sr0/W0q7HlpaZ+VLw4341efKTrt+qWkESovn3QP1A0+sqtp6kCnuH7pESvdabUsrMDmuEG48rjZY6TK0X+VAL3QN7qAmM2UURYzhRygMiwQuciEE3SFJvZDBkKXuiWi4m0YQdcIGeCq5cZDv4FlYzrm0J5c0/C20gbSZC5+mcCCIIkroUdsTda5SyuXH1vxpY23t/JV4kYKppmYhXDxdZ10kODIyoCbyEP2i0BSbWF01ocCUu4G0X+UAe6hIGJlRcT5gKXImfwg4zElKLIDJ7oSSZBiFJvcKGOyGiTuEApMdkZAEDKFjzdQSbWQmQlJ29kSfCpoF21TIUmRCBjuhpotJSgkmDhC55R47KIBNztWHqvU9N07Tuq6moGBomJElYPUXqHSdG0zn1Hh1TimMkr4p6p9RajqurfUqVSWT7W8NC3x4Xl8Lykeh9U+vNZqnvpaOq6hQP+g+4/JXgOo6x+oBL3knuSslSsSTJWdzpXaT1/Tn1VExUTVeCkqWci4yAs26vxJ9qDSl3cIkSguaRFlS796sbIaqSfcl/wh0hCcEQlufhZq/AMcIEmIUJUblMikKiLsqASmKEJSmISkLNWLdLUNKsx3Yr1+mrNqsBBXi11ulassIY4rh5eH7enwc8uPT0mA1GyclfTfTLQNG1tNvC+W0K4dBC+leidW1+iAcfeDB+F5u31JNmu26WP9xTu1IayxVXUDuduBXG1mq2MMFYqtw6lNdzQ64WnR6n69U3wvBVeoHT6pznusV2OhdZpU6p+o8QSkP/AB7+m8tAurS85WBuspVqVN1NwO68haPrEtgBX11m8f6ubqWteBuK1MqbnBrSJXKFFxduvdX0w5tiYKZIzy4yui4NI95n5SOa0gwk0xIs6SVc5+13sJk+E1y9GTa8Gxsudr6AfJwV2aoLgZBC5mqmAJlZ9a6cZlc+hdu13CFemHNgqx9An3Awqy4GzshZvHPr0yvGervTjOo0zVogDUNFuzvC+Va3S1NNVdTqsLXAwQV+gqgBsV5T1T6cpdQpOqMaG1hcGMrv4fP69V4vyfxff/tx+vjrhBS8rf1HQ1dLVc2o0iDCwEL37r5Vln0HQUzTCSCEQVrGacukIBAORlXoQqcIEIhERpurC6GpBCjwpVkKLmU+4hVuIARZLlJTp0dJqnMi5X1D9PPV/wBF402uqA0/2sc7hfI2na1atLX+mQZXWSWdp0/V2n1DazA9jg5pwZsrwdwXx70B6xcyozSapx2cPLufK+t0KzarA9jg4HkLjz4+tal1pFxdJMOF58IzxKGeFlTG/hTd7UMG6hgg90UXTFlW7cIGUTb91/CU3+FWXL07nB5iAFuZDgDEkLnUAdxmcrfSIMDC1XH3mtjCHDN1bZrcmVTTcGzZWtgif4WXSXfhw6W+UTb5S7gIEIEmCeFMbiOPJQmcqGS1ATHhFSR4KknslkT2CBMC0QqGuVDjylDuZlRxnmFBCOQZQLgPJUJ8Se6XgSiZBBk3uFMHwgRAkBAnzdQqd1JcIj+Um4tMEEhI6qA2HOAAvJsr2zsXEgTuMBeL9YesKXSgaGmc19eLif2rk+t/WzaDDpNC73GznjjwvkvUNe/U1nPqvLiTkrpw4b3WeV/jb1nrFfqGpfVr1HPceSVxqlWTlVvqKlzgu3U+MT/TPdYlVAzcqOdZIDdZt1rC1TKDMKOMmApTwQuf7anwJEp23VbxdO0wFdWnLlWRdNMpXIgTwj4Sg3R+UVFGqGwRZdBWRdRpui4XQwVFFyjWgyjFlG5unQQ2KZjiHAjKNQchV4WOUa4129DrLAE3XuPSXVDTqBm6xXy9jyDK9B0DW7NVTk8rzc+H8fQ8Hl3p9h1OpfUoEsN4Xj+rdYq0CWvpme69Jo3CpQaWmQQuP6j0LX6dz+QvLMtzk9u9PDazqz6+og2Cb69QNBa4rla0bNQY4K16ervpX4Xb1knTj73X0T0h1o1GMpVHy5trlfSel1G1mAuX576fq3aTVNew25X1T071sVaLC1091i7GrytfRKTG8BCpTG6YC5mi6iHNsQStzdUC2901ntY4OkBowi2q0EWlwVP1zeLBV75Movdjomqx7OFiqUGvPtclLmjuCtOnDSQYz2Wax2pdpg2ncfhYKmlsS5sL0raTHgAgKvUaRtRsAGPCnpWpyrx1SmWuthI/a8QQu9rtCBcCFxdTpiDZLwd+PKV5b1V6dpa/TE02gVhcGMr5N1TplbRVnMqtII8L7u8kAh91w+tdK0/U9O5j2Ddw6LhdvF5r4+r8eb8j8b3/AO3H6+JlKu317o9XpmqLHixuCOQuI8EFe6cpymx8vlxvG5QNipvvdK4xyoIPCrKzIUjykkynAlajNMIUUwLpJPKIUmSnYeyQDsnwPKnqp5unBH2VTMK0DkrUPjbotQaTwWmIX1v0D6u3hml1NT3Ewy+V8YBjC2aDVPoV2PaSHNMghW8faJ7V+q6NUVKbXSDPZWgbeZXz70H6lGt0rKNd4+o0QZOV7um8uEhcuXH1al1dN7o7mxj7pWncbhRxixwsFFw+xSuBhTJhsx5Sxef7qo5lGC8naQFup7DABMrBQJJLcrawAES0A9pWsz7XDhjW0jLhbwrAZNhZUMJ/CsE+Co7SrQ7diFHEwJ4QmBkJXGyKm6cFQOIMSJStcS2bIF0E2KLDG+UuFCYAgT8oHHlRUO2LqRblAu/HZEOsRZUGwaAEk7Rce1HcY8IF8yOUKgNif7pXQHA8oh3fhVV67aTC91gAoJqK7KTCXuaIE3K+Y+uPWBP1NJoqns/zPbn4VPrr1cX/AFNJo3bQHQ9w58L5hqdQ57nFxJkrrw4z7WOXZtbqTWeXPMrnud7kH1CSkJMrpv8AGPUXmVWcqOddDKLguiFWo4ogrDWYQzKAEFEm6izio5RF2UHQEDAoOvhFhlK7KtQAiAgSmUi0HmVGkBAm6YYVCOuVBlBEQprQkwo03RiUuCiLThVOEFO0ovuFKRUFfp6hp1GuHBVHK10dHVqUvqMEgdlz5R28dsr6d6R6m2tomhzrhdbV6Wt1NjqdM7B3K+YdA179FX2mYJX0rovV2OYMXXi58fXlr63j5+8fPfUnRtR0/UneNzTyFytO4iQvrPXaVLX6YhzQbWXzHXaUaeu4ditznKnLx53FbbrudB6gdI8An2lcSkNxsrqzTTAMqZqzr6+r9N6kHMaWOXo9JrN4Ac5fGeh9aOmqNbUMtXv+ma9tVocx2Vm9M17ZlQEZTl5ZcLiabVCRuK3urB7QJWe2ovOovhdDRaxogAflcT9pzIV1GqAbIWPV0agcdwIKeq8/5YC4+l1W0Dlb2V9wutOdmI9peINiVh1WhMe0E97LpNfLoAytdJoNiJlZxZa8fqumbhIaRK5NbSGlPZfRaukbtsF57quhAktBHeyl6bl1869R9Kp67TOa4e8CxhfKurdLq6KsWuYY7r7trNOGSDdec6t0ulraTg9o+V18Xm9ev05efwe82fXxZ7bpYv4XpOvdDq6F5c1pNM8heeqAtJBsvbx5Tl3Hy+fG8blA5TtcqrwiHELbGYscVW4ouceUkpA7cIHKgNpCkcrW6ixqbdNlWzCZoBKmGnFspw6ILUgcJhG3C1Ok7rvdA6nV0WqY9jiIK+/emOsM6loGPaW7gBuAX5ppP2wvZ+iOvVNBrqTS6aZMOvwr63l1E+P0EHWtYqOfJ4/C5+g1bdTQbUpnc1wkLaxoEwuNmXK17U+cQkLu/wDKO6BZVyS7I+FMLyc6jAduvcroUz7e54lc1kkjEzhbmEkgkH7Ld1iWtlOIi6sbtErOGy7JVrRE9u6y1LTBwGbqG9pCUgkWJKnlTY1KJuEsFA3vn4Q3Oc3sU6XTeRf4S2NwYUBIMDKBg5sgYmDYJA6b8IkDbcyg1wDUOzF20DmUo/dKD+4KSpU2M3SgGorMotLnmAF819d+qS7fpdM6GCxcDlavXnqQU6DtLp6kF1nlpuvknUNY97jLpXbx8P3XPnf0TXag1HEkyVzqjycpnOnKqd4W7jGEcQUCYSnKBKxuNyCShuQc6yWVPZZBcZUF8FAmyUGFLVwxhBCbqWWVNMpSeEUIWgzMKON1PhCFESxREJUQqokAo4CAymRNVEIhQ5R+FlRCUzKYGUHSFcBaUyrHwrBcKbUpHxwuv6c6kzR6gs1Ami6x8LjnKB8Lnz4+0yunHl63Xd6tqdNU1G7SgAT2WnpmvewCHY8rzTXLRp6xY6ZXC+PI9vj88fRNF1YPYGuN1xOt0m1Hl7Vy6GsgAgwVbV1u5hDiuc6er/l44xtf9NyFbUF3KqqvBcSFnc5dJGOXmq0v7Lu9E65U0pDHOlq8yTdD6hGDda9dcf8Anz6+v9N65SrMB3ie0rs0+o7m/u/lfC6GsrUKgcx5BXpuk+pSHNbWJB7rly8djpw8/Hl0+sUtcTYlaqWoM5XkOn9Tp12tLXArsU9RiDK5ZHeWR6bS6gAXXQZqpAHC8tR1HldCjXsDKl7Xrk9Tpa9u5XQp6gSACJXl9NqoIXSpVpAdgqTYxZj0DK5EdvKo14a5pdF4XLOrLWxuKrra2REyVfb/ABZHI6jpi4uMwuHWpFhg4XqX7arfcuRrdPtkDBS9usef1Wjp6lhY5oIPBXzz1L6afQe6rQbLZwF9SFIgmyyarTNqghwV4eS+OuHl8HHm+FVabqZIIghVNJ5XvvVPp0e6tQEHkLw9eg6k4hwgr38Oc5zY+Z5PHeFyqXlImcgF0cjAgWRSjKJPhImGbayaYKQGUYErX1KsBlGYVcgFTcnxMWh0ladLXNGoHA4KyNE3KZpErXHllZtfaP059RCrR/p6r/cSIC+mU37mhwNl+Yui69+j1LXsOOJX3f0t1xnUtJSqbjMDcJuCnk77hLZ9eoJBG4JYDh7hZBm1zcFF4BGIXH/1r6wUC0G5W2iYBLlgpkDkfha6bpgD9oytWfxjf9aw4kiw+QrATcSYVDZAtEcSnBkA3WcWU4cALSpusQEsmJNh5U/k+EkjeiHETYBK9x+/dCSfhB33RTEgRm/ZAHMEoBwibpN0zGEQxdH3RDBGbdksyMKt9TaLzKdpMWPc0DcbgeV4L1p6pbp2VKGlqQ/DiDZH1v6m/oqb9Np3AVf8x7L5Fr9Y+u9xc4mb3Xbx+P8AdZvP+Br9c/U1XPe4kyuXVqSbpy4Fpg3WWo68LpeWdM5py6RZVusbqBI83WbVkBxvZKSjbKErna3ESyococqNCIi6hF0JKkyraCY7KIEwhKzoYoQUZtCWVQwsVJSyVAVDDSiI7pJUlDDwAmI9syhIhMDZakZquJUAhGygyq0AChTAoG6liFlMw2SwoAp8VHCCgnIkJCFm0gJ2pFFizW5cXNcRgq4O3DKyAoh5CzeLtx8kn1oe5VueFWXEpZScUvl/hy6Uiii1jneWoigoiRu0HU6+jcDTfbsV6jpnq2BFZt14lQWNiscvFx5fXXj5+fHqV9i6P1hmv/8ALN+QvQ0qsAXXxDpHU6mirB7HEL6T0DrlPX0g0mH8hcufi9fj1eLzTl9e0o17ZXT0mplsSV5mnULY5C6GlrgFeevTNrvOqThViS6e6ppVQ4XKuBgBTtqbF7Be6GrYC24EKUiC4FW6hzX0iALq9xdcmpSaR7Vir0SOF2qFKxnlV6jTgtKxbFeX1GnbWlrgvIeovT9N7XPpthy+hVKEE2WDW6YPYQQunC3hdlcvJ45ymPhWt0b6FUtcMLKRtC+n9e6E2uxxbZwXzzqOiqaaqWvBXu4eX2j5nl8V4Vhm6MyUdhRgNXSduGpYJjZI0Scp3ALWhILnKywStMWTEEolO0yE+2bqoGyMwrLWci9hLXSF7H0V1t/T9ewl0McQDJsAvFB1lr0dUtrMvF10499VLP4/T2j1BrUA9jpacE8rS15IuIK856N1H1uk0DuBJb7pXoJAmZnjsuPKZca4zrtjoC9jHda2ETAMLm0qoBJ7LVSrAmTnurt5duXV+OgKhaBMR3lEuBMz/sqG1BEwUWkEFxEjsExrjb+1zzI9ptylkwIN+5VYeAJwT5UDw4e7hTW4sa4AXI+VJtzPBhU7gOPwle/bYE/CheS1xPx3SPe6AG/dAVRIEjcq6lUgXdJOYV1d/qwPMG915r1Z11nTNK+Hh7yLNC2dV6tQ0VAmo+PvdfGvV3Wn6/VvdMNwAt8Z7McrI5vVuo1ddqn1qjpLiuTVqFA1JyqnOnC6/OmJLR3WVDjeUznQFU4ysW10kPJSEyUA7hKTdYtrUgk2QBUlESeFnVCZRCMIGyvYNkEJKkqAlKU2UITAJTA+EMI7gruCE+FFFCFNCooQpCRTWT8ZSAJieFrtmlKgQRsrP9UeFAJUhGbpb/ECEIKDiZUusd1U+UFFFLFCVFFFnFRBRGFAFEVFRFEEVBPsgjCkIIogigIXR6brH6aq17HEEHK5oTsJlbkNsfYejdUZr9Kwg++Lhdqg/uvkfp/qr9BqGmZYTcL6X0/W09SxrmO4leLzcPS9Pf4fLeUx6GhWLSJK6NOoHMH/ACuEx8tsVpoViDBK4Xf09fG/126VQNyryZHC5dOobELdQqAt9xWdv7LVvEghEOlUbwCYKsY8GCmRrj/pNVQAbuhc11P3GQu49xqsDXcYWLUU2s9uVY1XB1mma4EABeQ6/wBCbqmuO33d19ArUiRLVi1FOWkOC3xudufLx+8yvh3Uem1dG8hzTHdcst9119i6x0qlqKZ3AXXz3rXRKmmeXNbLV7PH5Zy6fN83498fz4884QLKMBJui8EOgghRsALv28ootkpZ5RDirtSwznCPKjWkiUsAlOHEW4VlZv8AgTdaaBhwJ4WfN0Q+IW5SzX279NdaKmhDHu/avoILXCQBHdfBfQnWDpdU1pMAr7VoNYK9Br4Nxa6xzlt1njJx+P/Z	automatic	\N	\N	approved	\N	\N	0.00	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2
\.


--
-- Data for Name: time_entry_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_entry_audit (id, time_entry_id, field_name, old_value, new_value, justification, edited_by, ip_address, created_at, attachment_url) FROM stdin;
1	15	clockInTime	2025-10-23T08:00:00.000Z	2025-10-23T05:00:00.000Z	ajuste horario 	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:08:07.014127	\N
2	15	clockOutTime	2025-10-23T16:24:00.000Z	2025-10-23T10:24:00.000Z	ajuste horario 	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:08:07.069488	\N
3	15	clockInTime	2025-10-23T05:00:00.000Z	2025-10-23T11:00:00.000Z	aceerto ponto	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:58:20.509703	/uploads/audit-attachments/comprovante-1761314299072-381212130.pdf
4	15	clockOutTime	2025-10-23T10:24:00.000Z	2025-10-23T20:03:00.000Z	aceerto ponto	emp_1758233488891_n83g7zh3w	177.126.2.5	2025-10-24 13:58:20.569742	/uploads/audit-attachments/comprovante-1761314299072-381212130.pdf
\.


--
-- Data for Name: time_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_periods (id, company_id, name, start_date, end_date, status, closed_by, closed_at, reopened_by, reopened_at, reason, created_at, updated_at) FROM stdin;
1	2	Setembro	2025-09-20	2025-10-20	closed	emp_1758233488891_n83g7zh3w	2025-10-24 17:13:10.49	emp_1758233488891_n83g7zh3w	2025-09-20 23:43:20.781	encerramento mensal	2025-09-20 23:42:46.857455	2025-10-24 17:13:10.49
2	2	Outubro 2025	2025-10-24	2025-11-24	open	\N	\N	\N	\N	\N	2025-10-24 17:13:48.809061	2025-10-24 17:13:48.809061
\.


--
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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, company_id, department_id, is_active, created_at, updated_at, cpf, rg, rg_issuing_organ, ctps, pis_pasep, titulo_eleitor, birth_date, marital_status, gender, nationality, naturalness, cep, address, address_number, address_complement, neighborhood, city, state, country, personal_phone, commercial_phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, "position", admission_date, contract_type, work_schedule, salary, benefits, bank_code, bank_name, agency_number, account_number, account_type, pix_key, education_level, institution, course, graduation_year, dependents, password_hash, must_change_password, password_reset_token, password_reset_expires, internal_id) FROM stdin;
0wktYthnDhYK	teste+UkEErP@teste.com	Teste	Usuario	\N	admin	2	\N	t	2025-10-23 02:14:14.375797	2025-10-23 02:14:14.375797	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
emp_1758233488891_n83g7zh3w	teste@teste.com	Teste	teste	\N	admin	2	2	t	2025-09-18 22:11:28.911549	2025-10-08 20:14:42.049	143.555.520-12	1111111111	SSPSP	001			1991-01-01	solteiro	prefiro_nao_informar	Brasileira		06400-202	Rua Maria joana	5120		Centro	Barueri	SP	Brasil	(11) 98111-1111		AAAAA	(11) 99130-8502	maria	Auxiliar Financeiro	2020-01-01	clt	integral	2450.00		001	001	1234	134	corrente		medio			2025	\N	$argon2id$v=19$m=65536,t=3,p=1$JHK/qbQ5Ued++MwrSbHuAg$WZ2NCGAa0Xf4QBIwW2jdaIT2WssZbnYeLqJGzLapZGk	f	\N	\N	\N
usr_1758235005189_gi24wtxk4	novo@teste.com	Novo	Usuario	\N	superadmin	\N	\N	t	2025-09-18 22:36:45.210754	2025-09-21 01:25:30.074	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$deWV6cTnk6vhZyDa877cdw$DV413vzZiMAwR78jaMJ7sPNbpK6EC1Q/II3t325gtyc	t	\N	\N	\N
test_employee_001	teste@rhnet.com	João	Silva	\N	supervisor	2	2	t	2025-09-20 05:25:37.604684	2025-09-21 05:26:12.641	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$usWNhDtC2dUb/myLA+UZRA$Fi8ISukWnRjwLzV1+t6mZVnpBRbQ0ikUI1o2Zl4fMo8	f	\N	\N	\N
88a36c6c-fd42-4a54-9c55-e9f9f16ad10b	admin.teste@rhnet.com	Admin	Teste	\N	admin	2	4	t	2025-10-24 19:37:16.346327	2025-10-24 19:37:16.346327	12345678901	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$3rEFY5fYDEv19guzxFztlA$s0afyxc1IQUkJVNlaNR8H3lowMTDMf8HtuPo0ZMtrBs	f	\N	\N	\N
28d967c9-b361-4baa-be0b-7cbbee072482	funcionario.teste@rhnet.com	Funcionário	Teste	\N	employee	2	4	t	2025-10-24 19:38:27.420191	2025-10-24 19:38:27.420191	98765432100	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$3rEFY5fYDEv19guzxFztlA$s0afyxc1IQUkJVNlaNR8H3lowMTDMf8HtuPo0ZMtrBs	f	\N	\N	\N
usr_jQ7oPry43y08	testadmin_IHWv6z@rhnet.com	Test	Admin	\N	admin	1	\N	t	2025-10-08 18:30:07.285471	2025-10-08 18:32:09.028	123.456.789-00	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$7N5SxSB4ftVokuLWIEx++A$wL2ef/7gjTUi9JgM3qZqBaOuMp2/D9gvVlVvmjrYSmE	f	\N	\N	\N
test_admin_8kGg9X5V	test_E_FOEy@rhnet.com	Test	Admin	\N	admin	1	\N	t	2025-10-08 18:46:00.945834	2025-10-08 18:50:14.07	123.456.789-10	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=1$HTQc3gKLWbuXiPBz2A6xLw$9RdtAifn6/UDDYvpJ4HUPcwGyLNeE3dNdCo5ud+2bV0	f	\N	\N	\N
43729966	ivanmaracamargo@gmail.com	Ivan	Camargo	\N	superadmin	1	\N	t	2025-09-18 15:49:24.351369	2025-10-08 19:11:07.482	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$ZP/6YQVJDqoLetySFUKesw$XRDJp8Ow/yEUc4/SJLhY1M7vzSZpea8fSUZZRR5FTHY	f	\N	\N	\N
test_user_123	admin@teste.com	Admin	Teste	\N	admin	2	2	t	2025-09-19 06:39:49.925781	2025-09-25 01:47:14.69	\N	\N	\N	\N	\N	\N	\N	\N	\N	Brasileira	\N	\N	\N	\N	\N	\N	\N	\N	Brasil	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$GgGk+If9TvIP/hdTDNmWjg$4KPQqOfpdgdhr9q0d2yj5DvKNyZRSearFrePRgpcufg	f	\N	\N	\N
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applications_id_seq', 2, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 75, true);


--
-- Name: authorized_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.authorized_devices_id_seq', 3, true);


--
-- Name: break_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.break_entries_id_seq', 5, true);


--
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.candidates_id_seq', 2, true);


--
-- Name: certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.certificates_id_seq', 3, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.companies_id_seq', 7, true);


--
-- Name: course_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.course_answers_id_seq', 18, true);


--
-- Name: course_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.course_questions_id_seq', 10, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_id_seq', 6, true);


--
-- Name: department_shift_breaks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_shift_breaks_id_seq', 1, false);


--
-- Name: department_shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_shifts_id_seq', 14, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 4, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 12, true);


--
-- Name: employee_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_courses_id_seq', 5, true);


--
-- Name: face_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.face_profiles_id_seq', 1, true);


--
-- Name: holidays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.holidays_id_seq', 1, true);


--
-- Name: interview_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interview_templates_id_seq', 1, false);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- Name: job_openings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_openings_id_seq', 15, true);


--
-- Name: job_training_tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_training_tracks_id_seq', 1, false);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_attachments_id_seq', 1, false);


--
-- Name: message_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_categories_id_seq', 1, true);


--
-- Name: message_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_recipients_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 3, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: onboarding_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_documents_id_seq', 1, false);


--
-- Name: onboarding_form_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_form_data_id_seq', 1, false);


--
-- Name: onboarding_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_links_id_seq', 1, false);


--
-- Name: rotation_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_audit_id_seq', 1, false);


--
-- Name: rotation_exceptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_exceptions_id_seq', 1, false);


--
-- Name: rotation_instances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_instances_id_seq', 1, false);


--
-- Name: rotation_segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_segments_id_seq', 6, true);


--
-- Name: rotation_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_templates_id_seq', 3, true);


--
-- Name: rotation_user_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rotation_user_assignments_id_seq', 1, false);


--
-- Name: sectors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sectors_id_seq', 11, true);


--
-- Name: selection_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.selection_stages_id_seq', 1, false);


--
-- Name: supervisor_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisor_assignments_id_seq', 2, true);


--
-- Name: time_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_entries_id_seq', 18, true);


--
-- Name: time_entry_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_entry_audit_id_seq', 4, true);


--
-- Name: time_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_periods_id_seq', 2, true);


--
-- Name: user_shift_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_shift_assignments_id_seq', 749, true);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: authorized_devices authorized_devices_device_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_device_code_unique UNIQUE (device_code);


--
-- Name: authorized_devices authorized_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_pkey PRIMARY KEY (id);


--
-- Name: break_entries break_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.break_entries
    ADD CONSTRAINT break_entries_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_certificate_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_number_unique UNIQUE (certificate_number);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: companies companies_cnpj_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_unique UNIQUE (cnpj);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: course_answers course_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers
    ADD CONSTRAINT course_answers_pkey PRIMARY KEY (id);


--
-- Name: course_questions course_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_questions
    ADD CONSTRAINT course_questions_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: department_shift_breaks department_shift_breaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shift_breaks
    ADD CONSTRAINT department_shift_breaks_pkey PRIMARY KEY (id);


--
-- Name: department_shifts department_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shifts
    ADD CONSTRAINT department_shifts_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employee_courses employee_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_pkey PRIMARY KEY (id);


--
-- Name: face_profiles face_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_pkey PRIMARY KEY (id);


--
-- Name: face_profiles face_profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_user_id_unique UNIQUE (user_id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: interview_templates interview_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates
    ADD CONSTRAINT interview_templates_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: job_openings job_openings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_pkey PRIMARY KEY (id);


--
-- Name: job_training_tracks job_training_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_pkey PRIMARY KEY (id);


--
-- Name: message_attachments message_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (id);


--
-- Name: message_categories message_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_categories
    ADD CONSTRAINT message_categories_pkey PRIMARY KEY (id);


--
-- Name: message_recipients message_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients
    ADD CONSTRAINT message_recipients_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: onboarding_documents onboarding_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents
    ADD CONSTRAINT onboarding_documents_pkey PRIMARY KEY (id);


--
-- Name: onboarding_form_data onboarding_form_data_onboarding_link_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data
    ADD CONSTRAINT onboarding_form_data_onboarding_link_id_unique UNIQUE (onboarding_link_id);


--
-- Name: onboarding_form_data onboarding_form_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data
    ADD CONSTRAINT onboarding_form_data_pkey PRIMARY KEY (id);


--
-- Name: onboarding_links onboarding_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_pkey PRIMARY KEY (id);


--
-- Name: onboarding_links onboarding_links_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_token_unique UNIQUE (token);


--
-- Name: rotation_audit rotation_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit
    ADD CONSTRAINT rotation_audit_pkey PRIMARY KEY (id);


--
-- Name: rotation_exceptions rotation_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_pkey PRIMARY KEY (id);


--
-- Name: rotation_instances rotation_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances
    ADD CONSTRAINT rotation_instances_pkey PRIMARY KEY (id);


--
-- Name: rotation_segments rotation_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments
    ADD CONSTRAINT rotation_segments_pkey PRIMARY KEY (id);


--
-- Name: rotation_templates rotation_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_pkey PRIMARY KEY (id);


--
-- Name: rotation_user_assignments rotation_user_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_pkey PRIMARY KEY (id);


--
-- Name: sectors sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT sectors_pkey PRIMARY KEY (id);


--
-- Name: selection_stages selection_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selection_stages
    ADD CONSTRAINT selection_stages_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: supervisor_assignments supervisor_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments
    ADD CONSTRAINT supervisor_assignments_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: time_entry_audit time_entry_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit
    ADD CONSTRAINT time_entry_audit_pkey PRIMARY KEY (id);


--
-- Name: time_periods time_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_pkey PRIMARY KEY (id);


--
-- Name: user_shift_assignments user_shift_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments
    ADD CONSTRAINT user_shift_assignments_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: unique_application; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_application ON public.applications USING btree (job_opening_id, candidate_id);


--
-- Name: unique_candidate_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_candidate_email ON public.candidates USING btree (company_id, email);


--
-- Name: unique_document_version; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_document_version ON public.documents USING btree (company_id, title, version);


--
-- Name: unique_message_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_message_recipient ON public.message_recipients USING btree (message_id, user_id);


--
-- Name: unique_supervisor_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_supervisor_sector ON public.supervisor_assignments USING btree (supervisor_id, sector_id);


--
-- Name: unique_template_cycle; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_template_cycle ON public.rotation_instances USING btree (template_id, cycle_number);


--
-- Name: unique_template_sequence; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_template_sequence ON public.rotation_segments USING btree (template_id, sequence_order);


--
-- Name: unique_user_course_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_user_course_active ON public.employee_courses USING btree (user_id, course_id);


--
-- Name: unique_user_template_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_user_template_active ON public.rotation_user_assignments USING btree (user_id, template_id, is_active);


--
-- Name: applications applications_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- Name: applications applications_job_opening_id_job_openings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_opening_id_job_openings_id_fk FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- Name: audit_log audit_log_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: audit_log audit_log_performed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_performed_by_users_id_fk FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_log audit_log_target_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_target_user_id_users_id_fk FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: authorized_devices authorized_devices_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: authorized_devices authorized_devices_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_devices
    ADD CONSTRAINT authorized_devices_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE SET NULL;


--
-- Name: candidates candidates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: certificates certificates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: certificates certificates_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: certificates certificates_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_verified_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_verified_by_users_id_fk FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: course_answers course_answers_employee_course_id_employee_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers
    ADD CONSTRAINT course_answers_employee_course_id_employee_courses_id_fk FOREIGN KEY (employee_course_id) REFERENCES public.employee_courses(id) ON DELETE CASCADE;


--
-- Name: course_answers course_answers_question_id_course_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_answers
    ADD CONSTRAINT course_answers_question_id_course_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.course_questions(id) ON DELETE CASCADE;


--
-- Name: course_questions course_questions_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_questions
    ADD CONSTRAINT course_questions_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: department_shift_breaks department_shift_breaks_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shift_breaks
    ADD CONSTRAINT department_shift_breaks_shift_id_department_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.department_shifts(id) ON DELETE CASCADE;


--
-- Name: department_shifts department_shifts_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_shifts
    ADD CONSTRAINT department_shifts_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: departments departments_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: departments departments_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id);


--
-- Name: documents documents_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: documents documents_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: documents documents_parent_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_parent_document_id_documents_id_fk FOREIGN KEY (parent_document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: documents documents_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: employee_courses employee_courses_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: employee_courses employee_courses_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: employee_courses employee_courses_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_courses employee_courses_validated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_courses
    ADD CONSTRAINT employee_courses_validated_by_users_id_fk FOREIGN KEY (validated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: face_profiles face_profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: holidays holidays_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: interview_templates interview_templates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates
    ADD CONSTRAINT interview_templates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: interview_templates interview_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_templates
    ADD CONSTRAINT interview_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: interviews interviews_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: interviews interviews_template_id_interview_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_template_id_interview_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.interview_templates(id);


--
-- Name: job_openings job_openings_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: job_openings job_openings_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: job_openings job_openings_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: job_training_tracks job_training_tracks_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: job_training_tracks job_training_tracks_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: job_training_tracks job_training_tracks_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_training_tracks
    ADD CONSTRAINT job_training_tracks_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: message_attachments message_attachments_message_id_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_attachments message_attachments_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: message_categories message_categories_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_categories
    ADD CONSTRAINT message_categories_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: message_recipients message_recipients_message_id_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients
    ADD CONSTRAINT message_recipients_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_recipients message_recipients_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_recipients
    ADD CONSTRAINT message_recipients_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_category_id_message_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_category_id_message_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.message_categories(id) ON DELETE SET NULL;


--
-- Name: messages messages_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: onboarding_documents onboarding_documents_onboarding_link_id_onboarding_links_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents
    ADD CONSTRAINT onboarding_documents_onboarding_link_id_onboarding_links_id_fk FOREIGN KEY (onboarding_link_id) REFERENCES public.onboarding_links(id) ON DELETE CASCADE;


--
-- Name: onboarding_documents onboarding_documents_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_documents
    ADD CONSTRAINT onboarding_documents_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: onboarding_form_data onboarding_form_data_onboarding_link_id_onboarding_links_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_form_data
    ADD CONSTRAINT onboarding_form_data_onboarding_link_id_onboarding_links_id_fk FOREIGN KEY (onboarding_link_id) REFERENCES public.onboarding_links(id) ON DELETE CASCADE;


--
-- Name: onboarding_links onboarding_links_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: onboarding_links onboarding_links_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_links
    ADD CONSTRAINT onboarding_links_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: rotation_audit rotation_audit_performed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit
    ADD CONSTRAINT rotation_audit_performed_by_users_id_fk FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: rotation_audit rotation_audit_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_audit
    ADD CONSTRAINT rotation_audit_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- Name: rotation_exceptions rotation_exceptions_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: rotation_exceptions rotation_exceptions_original_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_original_shift_id_department_shifts_id_fk FOREIGN KEY (original_shift_id) REFERENCES public.department_shifts(id);


--
-- Name: rotation_exceptions rotation_exceptions_override_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_override_shift_id_department_shifts_id_fk FOREIGN KEY (override_shift_id) REFERENCES public.department_shifts(id);


--
-- Name: rotation_exceptions rotation_exceptions_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- Name: rotation_exceptions rotation_exceptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_exceptions
    ADD CONSTRAINT rotation_exceptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rotation_instances rotation_instances_generated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances
    ADD CONSTRAINT rotation_instances_generated_by_users_id_fk FOREIGN KEY (generated_by) REFERENCES public.users(id);


--
-- Name: rotation_instances rotation_instances_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_instances
    ADD CONSTRAINT rotation_instances_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- Name: rotation_segments rotation_segments_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments
    ADD CONSTRAINT rotation_segments_shift_id_department_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.department_shifts(id) ON DELETE SET NULL;


--
-- Name: rotation_segments rotation_segments_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_segments
    ADD CONSTRAINT rotation_segments_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- Name: rotation_templates rotation_templates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: rotation_templates rotation_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: rotation_templates rotation_templates_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_templates
    ADD CONSTRAINT rotation_templates_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: rotation_user_assignments rotation_user_assignments_active_instance_id_rotation_instances; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_active_instance_id_rotation_instances FOREIGN KEY (active_instance_id) REFERENCES public.rotation_instances(id) ON DELETE SET NULL;


--
-- Name: rotation_user_assignments rotation_user_assignments_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: rotation_user_assignments rotation_user_assignments_deactivated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_deactivated_by_users_id_fk FOREIGN KEY (deactivated_by) REFERENCES public.users(id);


--
-- Name: rotation_user_assignments rotation_user_assignments_template_id_rotation_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_template_id_rotation_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.rotation_templates(id) ON DELETE CASCADE;


--
-- Name: rotation_user_assignments rotation_user_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rotation_user_assignments
    ADD CONSTRAINT rotation_user_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sectors sectors_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT sectors_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: selection_stages selection_stages_job_opening_id_job_openings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selection_stages
    ADD CONSTRAINT selection_stages_job_opening_id_job_openings_id_fk FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- Name: supervisor_assignments supervisor_assignments_sector_id_sectors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments
    ADD CONSTRAINT supervisor_assignments_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE CASCADE;


--
-- Name: supervisor_assignments supervisor_assignments_supervisor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_assignments
    ADD CONSTRAINT supervisor_assignments_supervisor_id_users_id_fk FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: time_entries time_entries_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: time_entries time_entries_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: time_entry_audit time_entry_audit_edited_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit
    ADD CONSTRAINT time_entry_audit_edited_by_users_id_fk FOREIGN KEY (edited_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: time_entry_audit time_entry_audit_time_entry_id_time_entries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entry_audit
    ADD CONSTRAINT time_entry_audit_time_entry_id_time_entries_id_fk FOREIGN KEY (time_entry_id) REFERENCES public.time_entries(id) ON DELETE CASCADE;


--
-- Name: time_periods time_periods_closed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_closed_by_users_id_fk FOREIGN KEY (closed_by) REFERENCES public.users(id);


--
-- Name: time_periods time_periods_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: time_periods time_periods_reopened_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_periods
    ADD CONSTRAINT time_periods_reopened_by_users_id_fk FOREIGN KEY (reopened_by) REFERENCES public.users(id);


--
-- Name: user_shift_assignments user_shift_assignments_shift_id_department_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments
    ADD CONSTRAINT user_shift_assignments_shift_id_department_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.department_shifts(id) ON DELETE CASCADE;


--
-- Name: user_shift_assignments user_shift_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shift_assignments
    ADD CONSTRAINT user_shift_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: users users_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

