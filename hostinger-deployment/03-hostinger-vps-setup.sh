#!/bin/bash
# =========================================
# Script de Configuração Inicial do VPS
# RHNet - Hostinger VPS Setup
# =========================================
# 
# Execute este script como ROOT no seu VPS Hostinger
# SSH: ssh root@SEU_IP_VPS
#
# =========================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando configuração do VPS Hostinger para RHNet..."
echo ""

# ============= ATUALIZAR SISTEMA =============
echo "📦 [1/10] Atualizando sistema..."
apt update -y
apt upgrade -y

# ============= INSTALAR DEPENDÊNCIAS BÁSICAS =============
echo "🔧 [2/10] Instalando dependências básicas..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ufw \
    fail2ban \
    vim \
    htop \
    unzip

# ============= INSTALAR NODE.JS =============
echo "📗 [3/10] Instalando Node.js LTS via NVM..."

# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default node

# Verificar instalação
node -v
npm -v

# ============= INSTALAR PM2 =============
echo "⚙️  [4/10] Instalando PM2..."
npm install -g pm2

# ============= INSTALAR POSTGRESQL =============
echo "🐘 [5/10] Instalando PostgreSQL 16..."

# Adicionar repositório oficial do PostgreSQL
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update -y

# Instalar PostgreSQL
apt install -y postgresql-16 postgresql-contrib-16

# Iniciar e habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

echo "✅ PostgreSQL instalado e rodando!"

# ============= CONFIGURAR POSTGRESQL =============
echo "🔐 [6/10] Configurando banco de dados RHNet..."

# Gerar senha aleatória segura
DB_PASSWORD=$(openssl rand -base64 32)

# Criar usuário e banco de dados
sudo -u postgres psql << EOF
-- Criar usuário
CREATE USER rhnet_user WITH PASSWORD '$DB_PASSWORD';

-- Criar banco de dados
CREATE DATABASE rhnet_db OWNER rhnet_user;

-- Garantir permissões
GRANT ALL PRIVILEGES ON DATABASE rhnet_db TO rhnet_user;

-- Conectar ao banco e dar permissões no schema
\c rhnet_db
GRANT ALL ON SCHEMA public TO rhnet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rhnet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rhnet_user;

-- Otimizações para produção
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = '100';
ALTER SYSTEM SET random_page_cost = '1.1';
ALTER SYSTEM SET effective_io_concurrency = '200';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

EOF

# Reiniciar PostgreSQL para aplicar configurações
systemctl restart postgresql

echo "✅ Banco de dados criado!"
echo ""
echo "📋 CREDENCIAIS DO BANCO (ANOTE ESTAS INFORMAÇÕES):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Usuário: rhnet_user"
echo "Senha: $DB_PASSWORD"
echo "Banco: rhnet_db"
echo "Host: localhost"
echo "Porta: 5432"
echo ""
echo "DATABASE_URL:"
echo "postgresql://rhnet_user:$DB_PASSWORD@localhost:5432/rhnet_db"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANTE: Salve estas credenciais em local seguro!"
echo ""

# Salvar credenciais em arquivo temporário
cat > /root/db_credentials.txt << EOF
DATABASE_URL=postgresql://rhnet_user:$DB_PASSWORD@localhost:5432/rhnet_db
PGUSER=rhnet_user
PGPASSWORD=$DB_PASSWORD
PGDATABASE=rhnet_db
PGHOST=localhost
PGPORT=5432
EOF

chmod 600 /root/db_credentials.txt
echo "💾 Credenciais salvas em: /root/db_credentials.txt"
echo ""

# ============= INSTALAR NGINX =============
echo "🌐 [7/10] Instalando Nginx..."

# Remover Apache se existir (Hostinger instala por padrão)
systemctl stop apache2 2>/dev/null || true
apt remove --purge apache2 -y 2>/dev/null || true
apt autoremove -y

# Instalar Nginx
apt install -y nginx

# Iniciar e habilitar Nginx
systemctl start nginx
systemctl enable nginx

echo "✅ Nginx instalado!"

# ============= CONFIGURAR FIREWALL =============
echo "🔥 [8/10] Configurando firewall UFW..."

# Resetar firewall
ufw --force reset

# Regras básicas
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (CRÍTICO!)
ufw allow 22/tcp

# Permitir HTTP e HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Permitir PostgreSQL apenas localmente (segurança)
# ufw allow from 127.0.0.1 to any port 5432

# Habilitar firewall
ufw --force enable

echo "✅ Firewall configurado!"

# ============= INSTALAR CERTBOT (SSL) =============
echo "🔒 [9/10] Instalando Certbot para SSL..."

apt install -y certbot python3-certbot-nginx

echo "✅ Certbot instalado!"

# ============= CRIAR ESTRUTURA DE DIRETÓRIOS =============
echo "📁 [10/10] Criando estrutura de diretórios..."

# Diretório da aplicação
mkdir -p /var/www/rhnet
mkdir -p /var/www/rhnet/uploads
mkdir -p /var/log/rhnet

# Diretório de backups
mkdir -p /var/backups/rhnet

# Permissões
chown -R www-data:www-data /var/www/rhnet
chmod -R 755 /var/www/rhnet

echo "✅ Estrutura criada!"

# ============= CONFIGURAR FAIL2BAN =============
echo "🛡️  Configurando Fail2Ban (proteção SSH)..."

systemctl start fail2ban
systemctl enable fail2ban

# ============= RESUMO FINAL =============
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURAÇÃO INICIAL CONCLUÍDA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Status dos serviços:"
echo "   Node.js: $(node -v)"
echo "   npm: $(npm -v)"
echo "   PM2: $(pm2 -v)"
echo "   PostgreSQL: $(sudo -u postgres psql --version | cut -d' ' -f3)"
echo "   Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. 📥 Fazer upload do código da aplicação:"
echo "   scp -r /caminho/local/rhnet root@SEU_IP:/var/www/rhnet"
echo ""
echo "2. 📦 Importar backup do banco de dados:"
echo "   psql 'postgresql://rhnet_user:SENHA@localhost:5432/rhnet_db' < rhnet_backup.sql"
echo ""
echo "3. ⚙️  Configurar variáveis de ambiente (.env)"
echo ""
echo "4. 🏗️  Build da aplicação:"
echo "   cd /var/www/rhnet && npm install && npm run build"
echo ""
echo "5. 🚀 Iniciar com PM2:"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "6. 🌐 Configurar Nginx (use o arquivo 04-nginx-config.conf)"
echo ""
echo "7. 🔒 Configurar SSL:"
echo "   certbot --nginx -d www.rhnet.online -d rhnet.online"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  LEMBRETE: Credenciais do banco salvas em /root/db_credentials.txt"
echo ""
