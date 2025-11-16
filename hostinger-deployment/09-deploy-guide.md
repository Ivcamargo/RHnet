# 🚀 Guia Completo de Deploy - RHNet para Hostinger VPS

## 📋 Índice
1. [Pré-requisitos](#1-pré-requisitos)
2. [Exportar do Replit](#2-exportar-do-replit)
3. [Configurar VPS Hostinger](#3-configurar-vps-hostinger)
4. [Deploy da Aplicação](#4-deploy-da-aplicação)
5. [Configurar Nginx](#5-configurar-nginx)
6. [Configurar SSL](#6-configurar-ssl)
7. [Testes Finais](#7-testes-finais)
8. [Manutenção](#8-manutenção)

---

## 1. Pré-requisitos

### ✅ Checklist antes de começar:
- [ ] Plano VPS Hostinger contratado (mínimo: VPS KVM 2 - 2 vCPU, 4GB RAM)
- [ ] Domínio www.rhnet.online registrado
- [ ] Acesso SSH ao VPS (usuário root + senha)
- [ ] Cliente SSH instalado (PuTTY no Windows, Terminal no Mac/Linux)
- [ ] Cliente SFTP/SCP para transferir arquivos (FileZilla, WinSCP, ou comando scp)

### 📊 Especificações recomendadas VPS:
- **CPU**: 2+ vCPUs
- **RAM**: 4GB+ 
- **Storage**: 80GB+ SSD
- **Sistema Operacional**: Ubuntu 22.04 LTS
- **Largura de banda**: Ilimitada

---

## 2. Exportar do Replit

### 2.1 Exportar Banco de Dados

No Replit Shell, execute:

```bash
chmod +x hostinger-deployment/01-export-database.sh
./hostinger-deployment/01-export-database.sh
```

Isso criará um arquivo `rhnet_backup_YYYYMMDD_HHMMSS.sql` em `hostinger-deployment/backups/`.

### 2.2 Documentar Variáveis de Ambiente

No Replit, acesse **Tools → Secrets** e anote:
- `DATABASE_URL` (será alterada para o novo banco)
- `SENDGRID_API_KEY`
- `SALES_EMAIL`
- `FROM_EMAIL`
- Qualquer outra variável customizada

### 2.3 Baixar Código-Fonte

Opções:

**A) Via Git (Recomendado):**
```bash
# Se seu código está no GitHub/GitLab
git clone seu-repositorio.git
```

**B) Download direto do Replit:**
1. Menu → Download as ZIP
2. Extrair localmente

---

## 3. Configurar VPS Hostinger

### 3.1 Contratar VPS

1. Acesse [Hostinger](https://www.hostinger.com.br)
2. **Produtos → VPS → Escolher Plano**
3. Recomendado: **VPS KVM 2** ou superior
4. Escolha **Ubuntu 22.04 64-bit** como sistema operacional
5. Complete a compra e anote:
   - **IP do VPS** (ex: 123.45.67.89)
   - **Senha root**

### 3.2 Conectar via SSH

**Windows (PuTTY):**
1. Baixe PuTTY: https://www.putty.org/
2. Host Name: `seu-ip-vps`
3. Port: `22`
4. Connection type: SSH
5. Open → Login: `root` → Senha: [sua senha VPS]

**Mac/Linux:**
```bash
ssh root@seu-ip-vps
# Digite a senha quando solicitado
```

### 3.3 Executar Setup Automático

No VPS, faça upload do script de setup:

```bash
# No seu computador local
scp hostinger-deployment/03-hostinger-vps-setup.sh root@seu-ip-vps:/root/

# No VPS (via SSH)
chmod +x /root/03-hostinger-vps-setup.sh
/root/03-hostinger-vps-setup.sh
```

⏱️ **Tempo estimado:** 10-15 minutos

O script instalará automaticamente:
- Node.js LTS (via NVM)
- PostgreSQL 16
- Nginx
- PM2
- Certbot (SSL)
- Firewall (UFW)
- Fail2Ban (segurança SSH)

**⚠️ IMPORTANTE:** Anote as credenciais do banco de dados que aparecerem no final!

---

## 4. Deploy da Aplicação

### 4.1 Fazer Upload do Código

**Opção A: Via Git (Recomendado)**
```bash
cd /var/www/rhnet
git clone https://github.com/seu-usuario/rhnet.git .
```

**Opção B: Via SFTP/SCP**
```bash
# No seu computador local
scp -r /caminho/local/rhnet root@seu-ip-vps:/var/www/rhnet
```

### 4.2 Importar Banco de Dados

```bash
# Fazer upload do backup
scp hostinger-deployment/backups/rhnet_backup_*.sql root@seu-ip-vps:/root/

# No VPS, fazer upload do script de importação
scp hostinger-deployment/06-import-database.sh root@seu-ip-vps:/root/

# Executar importação
chmod +x /root/06-import-database.sh
/root/06-import-database.sh /root/rhnet_backup_*.sql
```

✅ Validação esperada: ~56+ tabelas importadas

### 4.3 Configurar Variáveis de Ambiente

```bash
cd /var/www/rhnet
nano .env
```

Cole o conteúdo do arquivo `02-environment-variables.env.example` e preencha os valores:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://rhnet_user:SUA_SENHA_DO_BANCO@localhost:5432/rhnet_db
SENDGRID_API_KEY=SG.sua_chave_aqui
FROM_EMAIL=noreply@rhnet.online
SALES_EMAIL=infosis@infosis.com.br
SESSION_SECRET=gere_com_openssl_rand_hex_32
# ... outras variáveis
```

**Gerar SESSION_SECRET:**
```bash
openssl rand -hex 32
```

**Salvar e proteger:**
```bash
chmod 600 .env  # Somente root pode ler
```

### 4.4 Instalar Dependências e Build

```bash
cd /var/www/rhnet

# Instalar dependências
npm install

# Build da aplicação
npm run build
```

✅ Deve criar pasta `dist/` com:
- `dist/public/` (frontend React)
- `dist/index.js` (backend Express)

### 4.5 Configurar PM2

```bash
# Copiar ecosystem config
cp hostinger-deployment/05-pm2-ecosystem.config.js /var/www/rhnet/ecosystem.config.js

# Editar se necessário (ajustar caminhos)
nano ecosystem.config.js

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar auto-start no boot
pm2 startup
# Execute o comando que aparecer (será algo como: sudo env PATH=... )

# Salvar configuração
pm2 save

# Verificar status
pm2 list
pm2 logs rhnet
```

✅ Status esperado: `online` (verde)

---

## 5. Configurar Nginx

### 5.1 Instalar Configuração

```bash
# Copiar configuração
cp hostinger-deployment/04-nginx-config.conf /etc/nginx/sites-available/rhnet

# Editar domínio se necessário
nano /etc/nginx/sites-available/rhnet
# Altere "rhnet.online" para seu domínio real

# Criar link simbólico
ln -s /etc/nginx/sites-available/rhnet /etc/nginx/sites-enabled/

# Remover configuração padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### 5.2 Configurar DNS (Hostinger)

1. Acesse **hPanel → Domínios → www.rhnet.online → DNS**
2. Adicione/edite registros A:

| Tipo | Nome | Aponta Para | TTL |
|------|------|-------------|-----|
| A | @ | SEU_IP_VPS | 14400 |
| A | www | SEU_IP_VPS | 14400 |

⏱️ **Aguarde 5-15 minutos** para propagação DNS

### 5.3 Verificar DNS

```bash
# No VPS
nslookup www.rhnet.online
# Deve retornar seu IP do VPS
```

---

## 6. Configurar SSL

### 6.1 Executar Script SSL

```bash
# Fazer upload do script
scp hostinger-deployment/08-ssl-setup.sh root@seu-ip-vps:/root/

# Executar
chmod +x /root/08-ssl-setup.sh
/root/08-ssl-setup.sh
```

O script solicitará:
- Domínio principal: `rhnet.online`
- Adicionar www? `s`
- Email: `seu-email@exemplo.com`

✅ Certificado instalado automaticamente!

### 6.2 Testar HTTPS

Acesse no navegador:
- https://www.rhnet.online
- https://rhnet.online

Deve mostrar cadeado verde 🔒

### 6.3 Testar Qualidade SSL

Acesse: https://www.ssllabs.com/ssltest/analyze.html?d=www.rhnet.online

Meta: **Nota A ou A+**

---

## 7. Testes Finais

### 7.1 Checklist de Funcionalidades

- [ ] **Login**: Consegue fazer login com usuário existente
- [ ] **Registro de Ponto**: Clock in/out funciona
- [ ] **Geolocalização**: Mapa carrega e valida localização
- [ ] **Reconhecimento Facial**: Câmera ativa e captura foto
- [ ] **Mensagens**: Envio de mensagens funciona
- [ ] **Relatórios**: Exportação de relatórios funciona
- [ ] **Admin**: Painel admin carrega
- [ ] **API**: Endpoints `/api/*` respondem corretamente
- [ ] **Upload**: Upload de fotos/documentos funciona
- [ ] **Email**: Sistema envia emails (teste com lead capture)

### 7.2 Verificar Logs

```bash
# Logs da aplicação
pm2 logs rhnet

# Logs do Nginx
tail -f /var/log/nginx/rhnet-error.log

# Logs do sistema
journalctl -u nginx -f
```

### 7.3 Performance

```bash
# Monitor de recursos
htop

# Status de serviços
systemctl status nginx
systemctl status postgresql
pm2 status
```

---

## 8. Manutenção

### 8.1 Configurar Backups Automáticos

```bash
# Fazer upload do script de backup
scp hostinger-deployment/07-automatic-backup.sh root@seu-ip-vps:/usr/local/bin/rhnet-backup.sh

# Dar permissão
chmod +x /usr/local/bin/rhnet-backup.sh

# Configurar cron (backup diário às 3h)
crontab -e
# Adicione:
0 3 * * * /usr/local/bin/rhnet-backup.sh
```

### 8.2 Atualizar Aplicação

```bash
cd /var/www/rhnet

# Baixar atualizações (se usar Git)
git pull origin main

# Instalar novas dependências
npm install

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart rhnet

# Verificar logs
pm2 logs rhnet --lines 100
```

### 8.3 Comandos Úteis

```bash
# Reiniciar todos os serviços
pm2 restart all
systemctl restart nginx
systemctl restart postgresql

# Verificar uso de disco
df -h

# Verificar uso de memória
free -h

# Limpar logs antigos
pm2 flush

# Atualizar PM2
npm install -g pm2@latest
pm2 update

# Renovar SSL manualmente
certbot renew
systemctl reload nginx
```

### 8.4 Monitoramento

**Instalar PM2 Web Dashboard:**
```bash
pm2 web
# Acesse: http://seu-ip:9615
```

**Logs em tempo real:**
```bash
pm2 monit
```

**Estatísticas:**
```bash
pm2 describe rhnet
```

---

## 📞 Troubleshooting

### Aplicação não inicia (PM2)
```bash
pm2 logs rhnet --lines 50
# Verificar erros de ambiente, banco de dados, etc.
```

### Nginx 502 Bad Gateway
```bash
# Verificar se backend está rodando
pm2 list
# Verificar porta correta em /etc/nginx/sites-available/rhnet
cat /etc/nginx/sites-available/rhnet | grep proxy_pass
# Deve ser: http://127.0.0.1:5000
```

### Banco de dados não conecta
```bash
# Testar conexão
psql "postgresql://rhnet_user:SENHA@localhost:5432/rhnet_db" -c "SELECT version();"

# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Ver logs
tail -f /var/log/postgresql/postgresql-16-main.log
```

### SSL não renova automaticamente
```bash
# Testar renovação
certbot renew --dry-run

# Verificar timer
systemctl list-timers | grep certbot

# Renovar manualmente
certbot renew --force-renewal
systemctl reload nginx
```

### Disco cheio
```bash
# Verificar espaço
df -h

# Limpar logs PM2
pm2 flush

# Limpar logs do sistema
journalctl --vacuum-time=7d

# Limpar cache npm
npm cache clean --force
```

---

## 🎉 Conclusão

Parabéns! Seu sistema RHNet agora está rodando na Hostinger VPS com:

✅ Node.js + Express backend  
✅ React frontend otimizado  
✅ PostgreSQL com todas as tabelas  
✅ Nginx como reverse proxy  
✅ SSL/HTTPS (Let's Encrypt)  
✅ PM2 gerenciando processos  
✅ Backups automáticos diários  
✅ Firewall configurado  
✅ Domínio www.rhnet.online funcionando  

**Próximos passos sugeridos:**
1. Configurar monitoramento (Uptime Robot, New Relic, etc.)
2. Configurar backups off-site (S3, Google Drive, etc.)
3. Implementar CI/CD (GitHub Actions)
4. Configurar alertas por email
5. Documentar processos internos da equipe

**Suporte:**
- Documentação do PM2: https://pm2.keymetrics.io/
- Nginx docs: https://nginx.org/en/docs/
- Certbot docs: https://certbot.eff.org/
- PostgreSQL docs: https://www.postgresql.org/docs/

---

**Arquivo gerado em:** 16/11/2025  
**Versão:** 1.0  
**Projeto:** RHNet - Sistema de Gestão de RH  
