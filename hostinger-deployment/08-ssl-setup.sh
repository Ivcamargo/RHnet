#!/bin/bash
# =========================================
# Script de Configuração SSL (Let's Encrypt)
# RHNet - HTTPS com Certbot
# =========================================

set -e

echo "🔒 Configurando SSL/HTTPS para RHNet..."
echo ""

# ============= VERIFICAR PRÉ-REQUISITOS =============
echo "✅ Verificando pré-requisitos..."

# Certbot instalado?
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot não instalado!"
    echo "   Instalando..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Nginx instalado e rodando?
if ! systemctl is-active --quiet nginx; then
    echo "❌ Nginx não está rodando!"
    echo "   Iniciando Nginx..."
    systemctl start nginx
fi

# ============= SOLICITAR DOMÍNIO =============
echo ""
echo "📋 Configuração de domínio:"
echo ""
read -p "Digite seu domínio principal (ex: rhnet.online): " DOMAIN
read -p "Digite domínio alternativo com www? (s/n): " ADD_WWW

if [ "$ADD_WWW" = "s" ] || [ "$ADD_WWW" = "S" ]; then
    DOMAINS="-d $DOMAIN -d www.$DOMAIN"
    echo "   Domínios: $DOMAIN, www.$DOMAIN"
else
    DOMAINS="-d $DOMAIN"
    echo "   Domínio: $DOMAIN"
fi

# ============= SOLICITAR EMAIL =============
echo ""
read -p "Digite seu email (para notificações de renovação): " EMAIL

# ============= VERIFICAR DNS =============
echo ""
echo "🔍 Verificando DNS..."

if host "$DOMAIN" > /dev/null 2>&1; then
    CURRENT_IP=$(host "$DOMAIN" | grep "has address" | awk '{print $4}' | head -1)
    SERVER_IP=$(curl -s ifconfig.me)
    
    echo "   DNS de $DOMAIN aponta para: $CURRENT_IP"
    echo "   IP deste servidor: $SERVER_IP"
    
    if [ "$CURRENT_IP" != "$SERVER_IP" ]; then
        echo ""
        echo "⚠️  ATENÇÃO: O DNS não aponta para este servidor!"
        echo ""
        echo "Para corrigir:"
        echo "1. Acesse o painel da Hostinger"
        echo "2. Vá em Domínios → $DOMAIN → DNS/Name Servers"
        echo "3. Adicione/edite registro A:"
        echo "   Nome: @ (ou $DOMAIN)"
        echo "   Tipo: A"
        echo "   Valor: $SERVER_IP"
        echo "   TTL: Automático"
        echo ""
        echo "4. Se usar www, adicione também:"
        echo "   Nome: www"
        echo "   Tipo: A"
        echo "   Valor: $SERVER_IP"
        echo ""
        read -p "Pressione Enter após configurar o DNS (aguarde 5-15 min)..."
    else
        echo "✅ DNS configurado corretamente!"
    fi
else
    echo "⚠️  Não foi possível resolver DNS para $DOMAIN"
    echo "   Certifique-se de que o domínio está configurado corretamente"
    echo ""
    read -p "Deseja continuar mesmo assim? (s/n): " CONTINUE
    if [ "$CONTINUE" != "s" ] && [ "$CONTINUE" != "S" ]; then
        exit 1
    fi
fi

# ============= PREPARAR NGINX =============
echo ""
echo "⚙️  Preparando Nginx..."

# Verificar se já existe configuração
if [ -f "/etc/nginx/sites-enabled/rhnet" ]; then
    echo "   Configuração do RHNet já existe"
else
    echo "⚠️  Configuração do RHNet não encontrada!"
    echo "   Certifique-se de ter copiado o arquivo 04-nginx-config.conf"
    echo "   para /etc/nginx/sites-available/rhnet"
    echo ""
    read -p "Deseja continuar? (s/n): " CONTINUE
    if [ "$CONTINUE" != "s" ] && [ "$CONTINUE" != "S" ]; then
        exit 1
    fi
fi

# Testar configuração do Nginx
echo "   Testando configuração do Nginx..."
if nginx -t > /dev/null 2>&1; then
    echo "✅ Configuração do Nginx válida"
else
    echo "❌ Erro na configuração do Nginx!"
    nginx -t
    exit 1
fi

# ============= ABRIR PORTAS NO FIREWALL =============
echo ""
echo "🔥 Configurando firewall..."

ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1

echo "✅ Portas 80 e 443 abertas"

# ============= OBTER CERTIFICADO SSL =============
echo ""
echo "🔒 Obtendo certificado SSL do Let's Encrypt..."
echo "   Isso pode levar alguns minutos..."
echo ""

# Opções do Certbot:
# --nginx: Plugin do Nginx (configura automaticamente)
# --agree-tos: Aceitar termos de serviço
# --no-eff-email: Não compartilhar email com EFF
# --redirect: Redirecionar HTTP para HTTPS automaticamente
# --email: Email para notificações

certbot --nginx \
    $DOMAINS \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --redirect \
    --non-interactive

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ CERTIFICADO SSL INSTALADO COM SUCESSO!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Seu site agora está acessível em:"
    echo "   https://$DOMAIN"
    if [ "$ADD_WWW" = "s" ] || [ "$ADD_WWW" = "S" ]; then
        echo "   https://www.$DOMAIN"
    fi
    echo ""
    echo "🔒 Certificado válido por: 90 dias"
    echo "   (Renovação automática configurada)"
    echo ""
else
    echo "❌ Erro ao obter certificado SSL!"
    echo ""
    echo "Possíveis causas:"
    echo "1. DNS não está apontando para este servidor"
    echo "2. Firewall bloqueando porta 80/443"
    echo "3. Nginx não está rodando"
    echo "4. Domínio inválido ou não acessível"
    echo ""
    echo "Tente novamente após verificar os itens acima"
    exit 1
fi

# ============= CONFIGURAR RENOVAÇÃO AUTOMÁTICA =============
echo "⚙️  Configurando renovação automática..."

# Certbot já configura cron automaticamente, mas vamos verificar
if systemctl list-timers | grep -q certbot; then
    echo "✅ Timer de renovação já configurado (systemd)"
elif [ -f "/etc/cron.d/certbot" ]; then
    echo "✅ Renovação já configurada (cron)"
else
    # Adicionar cron job manual
    echo "0 3 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-rhnet
    echo "✅ Renovação configurada (cron manual)"
fi

# ============= TESTAR RENOVAÇÃO =============
echo ""
echo "🧪 Testando renovação (dry-run)..."

if certbot renew --dry-run > /dev/null 2>&1; then
    echo "✅ Teste de renovação passou!"
else
    echo "⚠️  Teste de renovação falhou, mas certificado está instalado"
fi

# ============= RECARREGAR NGINX =============
echo ""
echo "🔄 Recarregando Nginx..."
systemctl reload nginx
echo "✅ Nginx recarregado"

# ============= VERIFICAR CERTIFICADO =============
echo ""
echo "🔍 Verificando certificado instalado..."

if openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo "✅ Certificado válido e instalado corretamente!"
else
    echo "⚠️  Não foi possível verificar o certificado"
fi

# ============= INFORMAÇÕES FINAIS =============
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 INFORMAÇÕES DO CERTIFICADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

certbot certificates | grep -A 10 "$DOMAIN"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 COMANDOS ÚTEIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Listar certificados:"
echo "  certbot certificates"
echo ""
echo "Renovar manualmente:"
echo "  certbot renew"
echo ""
echo "Renovar e recarregar Nginx:"
echo "  certbot renew --post-hook 'systemctl reload nginx'"
echo ""
echo "Revogar certificado:"
echo "  certbot revoke --cert-name $DOMAIN"
echo ""
echo "Verificar renovação automática:"
echo "  systemctl list-timers | grep certbot"
echo ""
echo "Testar configuração SSL:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Configuração SSL concluída!"
echo ""
