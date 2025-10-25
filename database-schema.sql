-- ==================================================================================
-- RHNet - Sistema de Gestão de Recursos Humanos
-- Database Schema - PostgreSQL
-- 
-- Este script contém a definição completa do banco de dados do RHNet
-- incluindo todas as tabelas, relacionamentos, índices e constraints.
-- ==================================================================================

-- ==================================================================================
-- CORE TABLES - Empresas, Usuários e Sessões
-- ==================================================================================

-- Sessions table (Replit Auth compatibility)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    cnpj VARCHAR UNIQUE,
    address TEXT,
    phone VARCHAR,
    email VARCHAR,
    logo_url VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR NOT NULL,
    date DATE NOT NULL,
    type VARCHAR DEFAULT 'national', -- national, regional, company
    is_recurring BOOLEAN DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- ORGANIZATIONAL STRUCTURE - Setores e Departamentos
-- ==================================================================================

-- Sectors table (Setores com geofencing)
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR NOT NULL,
    description TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius INTEGER DEFAULT 100, -- meters
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    sector_id INTEGER NOT NULL REFERENCES sectors(id),
    name VARCHAR NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Department shifts (Turnos de trabalho)
CREATE TABLE IF NOT EXISTS department_shifts (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    start_time VARCHAR NOT NULL,
    end_time VARCHAR NOT NULL,
    break_start VARCHAR,
    break_end VARCHAR,
    days_of_week INTEGER[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Department shift breaks (Intervalos configuráveis)
CREATE TABLE IF NOT EXISTS department_shift_breaks (
    id SERIAL PRIMARY KEY,
    shift_id INTEGER NOT NULL REFERENCES department_shifts(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    auto_deduct BOOLEAN DEFAULT FALSE,
    scheduled_start VARCHAR,
    scheduled_end VARCHAR,
    min_work_minutes INTEGER DEFAULT 360,
    tolerance_before_minutes INTEGER DEFAULT 0,
    tolerance_after_minutes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- USERS AND AUTHENTICATION
-- ==================================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    
    -- Documentos pessoais
    cpf VARCHAR(14),
    rg VARCHAR(20),
    rg_issuing_organ VARCHAR(10),
    ctps VARCHAR(20),
    pis_pasep VARCHAR(15),
    titulo_eleitor VARCHAR(15),
    
    -- Dados pessoais
    birth_date DATE,
    marital_status VARCHAR,
    gender VARCHAR,
    nationality VARCHAR DEFAULT 'Brasileira',
    naturalness VARCHAR,
    
    -- Endereço
    cep VARCHAR(9),
    address TEXT,
    address_number VARCHAR(10),
    address_complement VARCHAR,
    neighborhood VARCHAR,
    city VARCHAR,
    state VARCHAR(2),
    country VARCHAR DEFAULT 'Brasil',
    
    -- Contatos
    personal_phone VARCHAR(15),
    commercial_phone VARCHAR(15),
    emergency_contact_name VARCHAR,
    emergency_contact_phone VARCHAR(15),
    emergency_contact_relationship VARCHAR,
    
    -- Dados profissionais
    internal_id VARCHAR(50),
    role VARCHAR DEFAULT 'employee',
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR,
    admission_date DATE,
    contract_type VARCHAR,
    work_schedule VARCHAR,
    salary DECIMAL(10, 2),
    benefits TEXT,
    
    -- Dados bancários
    bank_code VARCHAR(3),
    bank_name VARCHAR,
    agency_number VARCHAR(10),
    account_number VARCHAR(20),
    account_type VARCHAR,
    pix_key VARCHAR,
    
    -- Escolaridade
    education_level VARCHAR,
    institution VARCHAR,
    course VARCHAR,
    graduation_year INTEGER,
    
    -- Dependentes
    dependents JSONB,
    
    -- Autenticação local
    password_hash VARCHAR,
    must_change_password BOOLEAN DEFAULT FALSE,
    password_reset_token VARCHAR,
    password_reset_expires TIMESTAMP,
    
    -- Sistema
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User shift assignments (Vinculação funcionário-turno)
CREATE TABLE IF NOT EXISTS user_shift_assignments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_id INTEGER NOT NULL REFERENCES department_shifts(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    assignment_type VARCHAR DEFAULT 'permanent',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supervisor assignments
CREATE TABLE IF NOT EXISTS supervisor_assignments (
    id SERIAL PRIMARY KEY,
    supervisor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sector_id INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_supervisor_sector 
    ON supervisor_assignments(supervisor_id, sector_id);

-- ==================================================================================
-- TIME TRACKING - Registro de Ponto
-- ==================================================================================

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    device_id INTEGER REFERENCES authorized_devices(id),
    clock_in_time TIMESTAMP,
    clock_out_time TIMESTAMP,
    clock_in_latitude REAL,
    clock_in_longitude REAL,
    clock_out_latitude REAL,
    clock_out_longitude REAL,
    total_hours DECIMAL(6, 2),
    regular_hours DECIMAL(6, 2) DEFAULT 0,
    overtime_hours DECIMAL(6, 2) DEFAULT 0,
    expected_hours DECIMAL(6, 2),
    late_minutes INTEGER,
    shortfall_minutes INTEGER,
    irregularity_reasons TEXT[],
    status VARCHAR DEFAULT 'active',
    face_recognition_verified BOOLEAN DEFAULT FALSE,
    
    -- Fotos de reconhecimento facial
    clock_in_photo_url VARCHAR,
    clock_out_photo_url VARCHAR,
    
    -- Validação de IP e geolocalização
    clock_in_ip_address VARCHAR,
    clock_out_ip_address VARCHAR,
    clock_in_within_geofence BOOLEAN,
    clock_out_within_geofence BOOLEAN,
    clock_in_shift_compliant BOOLEAN,
    clock_out_shift_compliant BOOLEAN,
    clock_in_validation_message TEXT,
    clock_out_validation_message TEXT,
    
    -- Sistema de inclusão manual
    entry_type VARCHAR DEFAULT 'automatic',
    inserted_by VARCHAR,
    approved_by VARCHAR,
    approval_status VARCHAR DEFAULT 'approved',
    justification TEXT,
    support_document_url VARCHAR,
    
    date VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Break entries table
CREATE TABLE IF NOT EXISTS break_entries (
    id SERIAL PRIMARY KEY,
    time_entry_id INTEGER NOT NULL REFERENCES time_entries(id),
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    duration DECIMAL(4, 2),
    type VARCHAR DEFAULT 'break',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Time entry audit (Rastreamento de edições)
CREATE TABLE IF NOT EXISTS time_entry_audit (
    id SERIAL PRIMARY KEY,
    time_entry_id INTEGER NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    field_name VARCHAR NOT NULL,
    old_value TEXT,
    new_value TEXT,
    justification TEXT NOT NULL,
    attachment_url TEXT,
    edited_by VARCHAR NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Face profiles (Reconhecimento facial)
CREATE TABLE IF NOT EXISTS face_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    face_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Time periods (Controle de períodos abertos/fechados)
CREATE TABLE IF NOT EXISTS time_periods (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR DEFAULT 'open',
    closed_by VARCHAR REFERENCES users(id),
    closed_at TIMESTAMP,
    reopened_by VARCHAR REFERENCES users(id),
    reopened_at TIMESTAMP,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- TERMINAL/KIOSK MODE - Terminais Autorizados
-- ==================================================================================

-- Authorized devices (Terminais fixos)
CREATE TABLE IF NOT EXISTS authorized_devices (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    latitude REAL,
    longitude REAL,
    radius INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- MESSAGING SYSTEM
-- ==================================================================================

-- Message categories
CREATE TABLE IF NOT EXISTS message_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    color VARCHAR DEFAULT '#3B82F6',
    company_id INTEGER NOT NULL REFERENCES companies(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    sender_id VARCHAR NOT NULL REFERENCES users(id),
    category_id INTEGER REFERENCES message_categories(id) ON DELETE SET NULL,
    subject VARCHAR NOT NULL,
    content TEXT NOT NULL,
    is_mass_message BOOLEAN DEFAULT FALSE,
    priority VARCHAR DEFAULT 'normal',
    sender_deleted BOOLEAN DEFAULT FALSE,
    sender_deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Message recipients
CREATE TABLE IF NOT EXISTS message_recipients (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_message_recipient 
    ON message_recipients(message_id, user_id);

-- Message attachments
CREATE TABLE IF NOT EXISTS message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR NOT NULL,
    original_name VARCHAR NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- DOCUMENT MANAGEMENT
-- ==================================================================================

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    title VARCHAR NOT NULL,
    description TEXT,
    file_name VARCHAR NOT NULL,
    original_name VARCHAR NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR NOT NULL,
    file_path TEXT NOT NULL,
    category VARCHAR DEFAULT 'general',
    uploaded_by VARCHAR NOT NULL REFERENCES users(id),
    assigned_to VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    parent_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_document_version 
    ON documents(company_id, title, version);

-- ==================================================================================
-- TRAINING AND COURSES
-- ==================================================================================

-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    duration INTEGER,
    is_required BOOLEAN DEFAULT FALSE,
    video_url TEXT,
    external_url TEXT,
    certificate_template TEXT,
    passing_score INTEGER DEFAULT 70,
    validity_period INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job training tracks
CREATE TABLE IF NOT EXISTS job_training_tracks (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    job_role VARCHAR,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,
    days_to_complete INTEGER DEFAULT 30,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Employee courses
CREATE TABLE IF NOT EXISTS employee_courses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    status VARCHAR DEFAULT 'not_started',
    progress INTEGER DEFAULT 0,
    score INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    certificate_url TEXT,
    validated_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_user_course_active 
    ON employee_courses(user_id, course_id);

-- Course questions
CREATE TABLE IF NOT EXISTS course_questions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR DEFAULT 'multiple_choice',
    options JSONB NOT NULL,
    correct_answer VARCHAR NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Course answers
CREATE TABLE IF NOT EXISTS course_answers (
    id SERIAL PRIMARY KEY,
    employee_course_id INTEGER NOT NULL REFERENCES employee_courses(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES course_questions(id) ON DELETE CASCADE,
    answer VARCHAR NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),
    certificate_number VARCHAR UNIQUE NOT NULL,
    title VARCHAR NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    file_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- NOTIFICATIONS AND AUDIT
-- ==================================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    content TEXT,
    related_id INTEGER,
    related_type VARCHAR,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    priority VARCHAR DEFAULT 'normal',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR NOT NULL,
    performed_by VARCHAR NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    target_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    target_resource VARCHAR,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    details JSONB,
    ip_address VARCHAR,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- ROTATION MANAGEMENT - Sistema de Escalas
-- ==================================================================================

-- Rotation templates
CREATE TABLE IF NOT EXISTS rotation_templates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    cadence_type VARCHAR NOT NULL,
    cycle_length INTEGER NOT NULL,
    starts_on VARCHAR DEFAULT 'monday',
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rotation segments
CREATE TABLE IF NOT EXISTS rotation_segments (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES rotation_templates(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    shift_id INTEGER REFERENCES department_shifts(id) ON DELETE SET NULL,
    name VARCHAR NOT NULL,
    work_duration_hours DECIMAL(4, 2),
    rest_duration_hours DECIMAL(4, 2),
    days_of_week_mask INTEGER[],
    consecutive_days INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_template_sequence 
    ON rotation_segments(template_id, sequence_order);

-- Rotation instances
CREATE TABLE IF NOT EXISTS rotation_instances (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES rotation_templates(id) ON DELETE CASCADE,
    cycle_number INTEGER NOT NULL,
    effective_start DATE NOT NULL,
    effective_end DATE NOT NULL,
    status VARCHAR DEFAULT 'active',
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by VARCHAR REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_template_cycle 
    ON rotation_instances(template_id, cycle_number);

-- Rotation user assignments
CREATE TABLE IF NOT EXISTS rotation_user_assignments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES rotation_templates(id) ON DELETE CASCADE,
    anchor_date DATE NOT NULL,
    starting_segment_order INTEGER DEFAULT 1,
    active_instance_id INTEGER REFERENCES rotation_instances(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_by VARCHAR NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    deactivated_at TIMESTAMP,
    deactivated_by VARCHAR REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_user_template_active 
    ON rotation_user_assignments(user_id, template_id, is_active);

-- Rotation exceptions
CREATE TABLE IF NOT EXISTS rotation_exceptions (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES rotation_templates(id) ON DELETE CASCADE,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    original_shift_id INTEGER REFERENCES department_shifts(id),
    override_shift_id INTEGER REFERENCES department_shifts(id),
    reason VARCHAR NOT NULL,
    notes TEXT,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rotation audit
CREATE TABLE IF NOT EXISTS rotation_audit (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES rotation_templates(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL,
    affected_users INTEGER DEFAULT 0,
    date_range VARCHAR,
    old_assignment_count INTEGER DEFAULT 0,
    new_assignment_count INTEGER DEFAULT 0,
    details JSONB,
    performed_by VARCHAR NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- RECRUITMENT & SELECTION MODULE
-- ==================================================================================

-- Job openings
CREATE TABLE IF NOT EXISTS job_openings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    department_id INTEGER REFERENCES departments(id),
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    location VARCHAR,
    employment_type VARCHAR NOT NULL,
    salary_range VARCHAR,
    work_schedule VARCHAR,
    vacancies INTEGER DEFAULT 1,
    status VARCHAR DEFAULT 'draft',
    published_at TIMESTAMP,
    closed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    cpf VARCHAR,
    birth_date DATE,
    address TEXT,
    city VARCHAR,
    state VARCHAR,
    zip_code VARCHAR,
    latitude REAL,
    longitude REAL,
    resume_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    skills TEXT[],
    experience TEXT,
    education TEXT,
    source_channel VARCHAR,
    notes TEXT,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_candidate_email 
    ON candidates(company_id, email);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_opening_id INTEGER NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'applied',
    current_stage_id INTEGER,
    score INTEGER DEFAULT 0,
    distance_km REAL,
    cover_letter TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    screening_notes TEXT,
    rejection_reason TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_application 
    ON applications(job_opening_id, candidate_id);

-- Selection stages
CREATE TABLE IF NOT EXISTS selection_stages (
    id SERIAL PRIMARY KEY,
    job_opening_id INTEGER NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    type VARCHAR NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    duration_days INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interview templates
CREATE TABLE IF NOT EXISTS interview_templates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR NOT NULL,
    description TEXT,
    type VARCHAR NOT NULL,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Interviews
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES interview_templates(id),
    interviewer_ids VARCHAR[],
    scheduled_at TIMESTAMP NOT NULL,
    location VARCHAR,
    meeting_url TEXT,
    status VARCHAR DEFAULT 'scheduled',
    feedback TEXT,
    rating INTEGER,
    evaluation JSONB,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding links
CREATE TABLE IF NOT EXISTS onboarding_links (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    token VARCHAR NOT NULL UNIQUE,
    candidate_name VARCHAR NOT NULL,
    candidate_email VARCHAR NOT NULL,
    candidate_phone VARCHAR,
    position VARCHAR NOT NULL,
    department VARCHAR,
    start_date DATE,
    status VARCHAR DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding documents
CREATE TABLE IF NOT EXISTS onboarding_documents (
    id SERIAL PRIMARY KEY,
    onboarding_link_id INTEGER NOT NULL REFERENCES onboarding_links(id) ON DELETE CASCADE,
    document_type VARCHAR NOT NULL,
    file_name VARCHAR NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR,
    status VARCHAR DEFAULT 'pending_review',
    review_notes TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR REFERENCES users(id)
);

-- Onboarding form data
CREATE TABLE IF NOT EXISTS onboarding_form_data (
    id SERIAL PRIMARY KEY,
    onboarding_link_id INTEGER NOT NULL REFERENCES onboarding_links(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================================================
-- COMMENTS
-- ==================================================================================
-- 
-- Este schema SQL foi gerado a partir do Drizzle ORM schema (shared/schema.ts)
-- do sistema RHNet.
-- 
-- Principais recursos:
-- - Gestão completa de empresas e funcionários
-- - Sistema de ponto eletrônico com geofencing e reconhecimento facial
-- - Terminais/kiosks fixos para registro de ponto
-- - Mensagens corporativas
-- - Gestão de documentos
-- - Sistema de treinamentos e cursos
-- - Módulo completo de recrutamento e seleção
-- - Sistema de escalas e rotações
-- - Auditoria completa de alterações
-- 
-- Para aplicar este schema:
-- 1. Crie um banco de dados PostgreSQL vazio
-- 2. Execute: psql -d nome_do_banco -f database-schema.sql
-- 3. Configure as variáveis de ambiente DATABASE_URL
-- 
-- ==================================================================================
