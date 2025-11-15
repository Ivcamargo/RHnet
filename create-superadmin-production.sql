-- Script para criar superadmin no banco de PRODUÇÃO
-- Execute este SQL no banco de PRODUÇÃO do Replit
-- 
-- IMPORTANTE: Após o primeiro login, TROQUE A SENHA imediatamente!
-- Email: ivan@infosis.com.br
-- Senha temporária: @Admin123

-- Habilitar extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Passo 1: Garantir que existe a empresa padrão
INSERT INTO companies (name, cnpj, is_active)
VALUES ('Empresa Padrão', '00000000000000', true)
ON CONFLICT (cnpj) DO NOTHING;

-- Passo 2: Inserir o superadmin
-- Hash da senha @Admin123: $argon2id$v=19$m=65536,t=3,p=4$0kAexa3ytKoXF/UyOr/SRA$r7Sq/36/zmcHUyoJW7A1xdfZxE4iqLGXjsYWLhPJ3uY
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  password_hash,
  role,
  company_id,
  must_change_password,
  is_active
)
VALUES (
  gen_random_uuid()::text,
  'ivan@infosis.com.br',
  'Ivan',
  'Admin',
  '$argon2id$v=19$m=65536,t=3,p=4$0kAexa3ytKoXF/UyOr/SRA$r7Sq/36/zmcHUyoJW7A1xdfZxE4iqLGXjsYWLhPJ3uY',
  'superadmin',
  (SELECT id FROM companies WHERE cnpj = '00000000000000'),
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'superadmin',
  must_change_password = true;

-- Verificar se foi criado corretamente
SELECT id, email, first_name, last_name, role, must_change_password, is_active
FROM users
WHERE email = 'ivan@infosis.com.br';
