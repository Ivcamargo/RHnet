#!/bin/bash
# =========================================
# Script de Importação do Banco de Dados
# RHNet - Restaurar backup no Hostinger VPS
# =========================================

set -e  # Parar em caso de erro

echo "📥 Importando banco de dados RHNet..."
echo ""

# ============= CONFIGURAÇÃO =============
# Arquivo de backup (ajuste o caminho se necessário)
BACKUP_FILE="${1:-/root/rhnet_backup.sql}"

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erro: Arquivo de backup não encontrado!"
    echo "   Esperado: $BACKUP_FILE"
    echo ""
    echo "📋 Uso correto:"
    echo "   $0 /caminho/para/backup.sql"
    echo ""
    echo "💡 Dica: Faça upload do backup primeiro:"
    echo "   scp rhnet_backup.sql root@SEU_IP:/root/"
    exit 1
fi

# Carregar credenciais do banco
if [ -f "/root/db_credentials.txt" ]; then
    source /root/db_credentials.txt
    echo "✅ Credenciais carregadas de /root/db_credentials.txt"
else
    echo "⚠️  Arquivo de credenciais não encontrado."
    echo "   Por favor, configure DATABASE_URL manualmente:"
    read -p "DATABASE_URL: " DATABASE_URL
fi

# Verificar se DATABASE_URL está configurado
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não configurado!"
    exit 1
fi

echo ""
echo "📊 Informações do backup:"
echo "   Arquivo: $BACKUP_FILE"
echo "   Tamanho: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""

# ============= BACKUP DO BANCO ATUAL (Segurança) =============
echo "🔄 Criando backup do banco atual (segurança)..."
SAFETY_BACKUP="/root/rhnet_pre_import_$(date +%Y%m%d_%H%M%S).sql"

pg_dump "$DATABASE_URL" > "$SAFETY_BACKUP" 2>/dev/null || echo "⚠️  Banco vazio, sem necessidade de backup de segurança"

echo "✅ Backup de segurança criado: $SAFETY_BACKUP"
echo ""

# ============= VERIFICAR CONEXÃO =============
echo "🔌 Testando conexão com banco de dados..."

if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Conexão bem-sucedida!"
else
    echo "❌ Erro ao conectar no banco de dados!"
    echo "   Verifique DATABASE_URL e se PostgreSQL está rodando"
    exit 1
fi

echo ""

# ============= IMPORTAR BACKUP =============
echo "📦 Importando dados do backup..."
echo "   Isso pode levar alguns minutos..."
echo ""

# Importar usando psql
# --quiet: modo silencioso
# --single-transaction: rollback completo em caso de erro
# --set ON_ERROR_STOP=on: parar em caso de erro

psql "$DATABASE_URL" \
    --quiet \
    --single-transaction \
    --set ON_ERROR_STOP=on \
    < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Importação concluída com sucesso!"
else
    echo "❌ Erro durante importação!"
    echo "   Banco foi revertido ao estado anterior (rollback)"
    exit 1
fi

echo ""

# ============= VALIDAR IMPORTAÇÃO =============
echo "🔍 Validando importação..."
echo ""

# Contar tabelas
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "📊 Tabelas importadas: $TABLE_COUNT"

# Listar tabelas principais
echo ""
echo "📋 Tabelas principais encontradas:"
psql "$DATABASE_URL" -c "
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC 
LIMIT 15;
" || echo "⚠️  Erro ao listar tabelas"

echo ""

# Verificar tabelas críticas
echo "✅ Verificando tabelas críticas do RHNet:"

CRITICAL_TABLES=(
    "users"
    "departments"
    "time_entries"
    "break_entries"
    "shifts"
    "user_shift_assignments"
    "messages"
    "job_openings"
    "candidates"
    "leads"
    "session"
)

MISSING_TABLES=()

for table in "${CRITICAL_TABLES[@]}"; do
    if psql "$DATABASE_URL" -t -c "SELECT to_regclass('public.$table');" | grep -q "$table"; then
        echo "   ✅ $table"
    else
        echo "   ❌ $table - NÃO ENCONTRADA!"
        MISSING_TABLES+=("$table")
    fi
done

echo ""

# Resumo
if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ IMPORTAÇÃO VALIDADA COM SUCESSO!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Estatísticas:"
    echo "   - Total de tabelas: $TABLE_COUNT"
    echo "   - Tabelas críticas: ${#CRITICAL_TABLES[@]}/${#CRITICAL_TABLES[@]}"
    echo ""
    echo "⏭️  Próximo passo:"
    echo "   Configure o arquivo .env e inicie a aplicação"
    echo ""
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  ATENÇÃO: Algumas tabelas críticas não foram encontradas!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Tabelas faltando:"
    for table in "${MISSING_TABLES[@]}"; do
        echo "   - $table"
    done
    echo ""
    echo "💡 Isso pode acontecer se:"
    echo "   1. O backup está incompleto"
    echo "   2. A aplicação vai criar as tabelas via migrations"
    echo ""
    echo "⚠️  Verifique se a aplicação consegue iniciar corretamente"
fi

echo ""
echo "📋 Informações úteis:"
echo "   - Backup original: $BACKUP_FILE"
echo "   - Backup de segurança: $SAFETY_BACKUP"
echo "   - DATABASE_URL: ${DATABASE_URL%%@*}@***"
echo ""

# ============= OTIMIZAÇÕES PÓS-IMPORTAÇÃO =============
echo "⚙️  Executando otimizações..."

psql "$DATABASE_URL" << EOF
-- Recalcular estatísticas
ANALYZE;

-- Vacuum (limpar espaço)
VACUUM;

-- Reindexar
REINDEX DATABASE rhnet_db;
EOF

echo "✅ Otimizações concluídas!"
echo ""
echo "🎉 Banco de dados pronto para uso!"
