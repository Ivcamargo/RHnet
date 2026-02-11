#!/bin/bash
# =========================================
# Script de Backup Automático Diário
# RHNet - PostgreSQL Backup com Rotação
# =========================================
#
# INSTALAÇÃO:
# 1. Copie para: /usr/local/bin/rhnet-backup.sh
# 2. Dê permissão: chmod +x /usr/local/bin/rhnet-backup.sh
# 3. Crie cron job: crontab -e
#    Adicione: 0 3 * * * /usr/local/bin/rhnet-backup.sh
#    (Executa todo dia às 3h da manhã)
#
# =========================================

set -e

# ============= CONFIGURAÇÃO =============
BACKUP_DIR="/var/backups/rhnet"
RETENTION_DAYS=7  # Manter backups dos últimos 7 dias
LOG_FILE="/var/log/rhnet/backup.log"

# Carregar credenciais (preferir .env do projeto)
if [ -f "/root/RHnet/.env" ]; then
    set -a
    source /root/RHnet/.env
    set +a
fi

# Verificar pg_dump
if ! command -v pg_dump >/dev/null 2>&1; then
    echo "[$(date)] ERRO: pg_dump não encontrado. Instale postgresql-client." >> "$LOG_FILE"
    exit 1
fi

# Usar URL de backup dedicada se existir
BACKUP_URL="${DATABASE_URL_BACKUP:-$DATABASE_URL}"

# Verificar BACKUP_URL
if [ -z "$BACKUP_URL" ]; then
    echo "[$(date)] ERRO: DATABASE_URL_BACKUP/DATABASE_URL não configurado!" >> "$LOG_FILE"
    exit 1
fi

# Remover parâmetro pgbouncer=true se existir (pg_dump não precisa dele)
BACKUP_URL="${BACKUP_URL/pgbouncer=true/}"
BACKUP_URL="${BACKUP_URL/&&/}"
BACKUP_URL="${BACKUP_URL/?&/?}"

# ============= CRIAR DIRETÓRIOS =============
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# ============= LOGGING =============
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🔄 Iniciando backup automático do RHNet"

# ============= CRIAR BACKUP =============
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/rhnet_auto_$TIMESTAMP.sql"
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

log "📦 Criando backup: $BACKUP_FILE"

# Fazer backup
if pg_dump "$BACKUP_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    > "$BACKUP_FILE" 2>> "$LOG_FILE"; then
    
    # Comprimir backup
    log "🗜️  Comprimindo backup..."
    gzip -f "$BACKUP_FILE"
    
    # Verificar tamanho
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    log "✅ Backup criado com sucesso! Tamanho: $BACKUP_SIZE"
    
    # Estatísticas
    TABLE_COUNT=$(zcat "$BACKUP_FILE_GZ" | grep -c "CREATE TABLE" || echo "0")
    log "📊 Tabelas: $TABLE_COUNT"
    
else
    log "❌ Erro ao criar backup!"
    exit 1
fi

# ============= ROTAÇÃO DE BACKUPS =============
log "🔄 Aplicando rotação de backups (manter últimos $RETENTION_DAYS dias)..."

# Remover backups antigos
DELETED_COUNT=0
while IFS= read -r old_backup; do
    rm -f "$old_backup"
    log "🗑️  Removido: $(basename "$old_backup")"
    ((DELETED_COUNT++))
done < <(find "$BACKUP_DIR" -name "rhnet_auto_*.sql.gz" -mtime +$RETENTION_DAYS)

if [ $DELETED_COUNT -eq 0 ]; then
    log "✅ Nenhum backup antigo para remover"
else
    log "✅ $DELETED_COUNT backup(s) antigo(s) removido(s)"
fi

# ============= LISTAR BACKUPS EXISTENTES =============
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/rhnet_auto_*.sql.gz 2>/dev/null | wc -l)
log "📁 Total de backups mantidos: $BACKUP_COUNT"

# Listar os 5 mais recentes
log "📋 Backups recentes:"
ls -lht "$BACKUP_DIR"/rhnet_auto_*.sql.gz 2>/dev/null | head -5 | while read -r line; do
    log "   $(echo "$line" | awk '{print $9, "("$5")"}')"
done

# ============= VERIFICAR ESPAÇO EM DISCO =============
DISK_USAGE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
log "💾 Uso de disco: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 85 ]; then
    log "⚠️  AVISO: Disco com mais de 85% de uso!"
fi

# ============= TESTAR BACKUP (Opcional) =============
# Descomente para validar integridade do backup
# log "🔍 Testando integridade do backup..."
# if zcat "$BACKUP_FILE_GZ" | head -100 > /dev/null 2>&1; then
#     log "✅ Backup íntegro"
# else
#     log "❌ Backup pode estar corrompido!"
# fi

# ============= BACKUP REMOTO (Opcional) =============
# Descomente e configure para enviar para storage externo

# Exemplo: Amazon S3
# if command -v aws &> /dev/null; then
#     log "☁️  Enviando para S3..."
#     aws s3 cp "$BACKUP_FILE_GZ" "s3://seu-bucket/rhnet-backups/"
#     log "✅ Backup enviado para S3"
# fi

# Exemplo: rsync para servidor remoto
# if command -v rsync &> /dev/null; then
#     log "📤 Enviando para servidor remoto..."
#     rsync -avz "$BACKUP_FILE_GZ" user@remote-server:/backups/rhnet/
#     log "✅ Backup enviado para servidor remoto"
# fi

# Exemplo: Google Drive (usando rclone)
# if command -v rclone &> /dev/null; then
#     log "☁️  Enviando para Google Drive..."
#     rclone copy "$BACKUP_FILE_GZ" "gdrive:RHNet-Backups/"
#     log "✅ Backup enviado para Google Drive"
# fi

# ============= NOTIFICAÇÃO POR EMAIL (Opcional) =============
# Descomente e configure para receber notificações

# EMAIL_TO="admin@rhnet.online"
# EMAIL_SUBJECT="✅ RHNet Backup - $(date '+%Y-%m-%d')"
# EMAIL_BODY="Backup concluído com sucesso!\n\nArquivo: $BACKUP_FILE_GZ\nTamanho: $BACKUP_SIZE\nTabelas: $TABLE_COUNT\nBackups mantidos: $BACKUP_COUNT"
# 
# if command -v mail &> /dev/null; then
#     echo -e "$EMAIL_BODY" | mail -s "$EMAIL_SUBJECT" "$EMAIL_TO"
#     log "📧 Notificação enviada para $EMAIL_TO"
# fi

log "✅ Backup automático concluído com sucesso!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""

exit 0
