#!/bin/bash
# =========================================
# Script de Exportação do Banco de Dados
# RHNet - Migração Replit → Hostinger
# =========================================

echo "🔄 Exportando banco de dados PostgreSQL do Replit..."

# Verificar se DATABASE_URL existe
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não configurado!"
    echo "Execute: export DATABASE_URL='sua_connection_string'"
    exit 1
fi

# Criar diretório de backup
BACKUP_DIR="./hostinger-deployment/backups"
mkdir -p "$BACKUP_DIR"

# Nome do arquivo com timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/rhnet_backup_$TIMESTAMP.sql"

# Extrair componentes da DATABASE_URL (formato: postgresql://user:pass@host:port/dbname)
# Nota: Neon usa formato especial, vamos usar pg_dump direto com a URL

echo "📦 Criando backup completo..."
echo "   Arquivo: $BACKUP_FILE"

# Exportar usando pg_dump (precisa estar instalado)
# --clean: adiciona DROP TABLE antes de CREATE
# --if-exists: previne erros se tabela não existir
# --no-owner: não inclui comandos SET OWNER
# --no-privileges: não exporta permissões (vai recriar no destino)

LOG_FILE="$BACKUP_DIR/export_$TIMESTAMP.log"

if command -v pg_dump &> /dev/null; then
    pg_dump "$DATABASE_URL" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --verbose \
        > "$BACKUP_FILE" 2> "$LOG_FILE"
    
    if [ $? -eq 0 ]; then
        # Verificar se arquivo foi criado e não está vazio
        if [ -s "$BACKUP_FILE" ]; then
            FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            echo "✅ Backup concluído com sucesso!"
            echo "   Tamanho: $FILE_SIZE"
            echo ""
            echo "📊 Estatísticas do backup:"
            echo "   - Tabelas: $(grep -c "CREATE TABLE" "$BACKUP_FILE")"
            echo "   - Índices: $(grep -c "CREATE INDEX" "$BACKUP_FILE")"
            echo "   - Constraints: $(grep -c "ALTER TABLE.*ADD CONSTRAINT" "$BACKUP_FILE")"
            echo ""
            echo "📁 Arquivos gerados:"
            echo "   - SQL: $BACKUP_FILE"
            echo "   - Log: $LOG_FILE"
            echo ""
            echo "⏭️  Próximo passo:"
            echo "   Faça upload deste arquivo para o seu VPS Hostinger usando:"
            echo "   scp $BACKUP_FILE root@SEU_IP_VPS:/root/rhnet_backup.sql"
        else
            echo "❌ Erro: Arquivo de backup está vazio!"
            exit 1
        fi
    else
        echo "❌ Erro ao executar pg_dump. Verifique os logs acima."
        exit 1
    fi
else
    echo "❌ Erro: pg_dump não está instalado!"
    echo ""
    echo "Para instalar pg_dump no Replit:"
    echo "1. Adicione 'postgresql' aos pacotes do sistema"
    echo "2. Ou use Docker: docker run --rm postgres:16 pg_dump ..."
    echo ""
    echo "Alternativamente, você pode:"
    echo "1. Acessar o painel do Neon (neon.tech)"
    echo "2. Fazer backup direto de lá"
    exit 1
fi

echo ""
echo "📋 Informações importantes:"
echo "   - Número de tabelas esperadas: 56+"
echo "   - Inclui: users, departments, time_entries, shifts, messages, etc."
echo "   - NÃO inclui: senhas em texto claro (são hash argon2)"
echo ""
echo "⚠️  Guarde este arquivo em local seguro!"
