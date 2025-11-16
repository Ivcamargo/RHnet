# 🚀 RHNet - Migração Replit → Hostinger VPS

## 📁 Conteúdo do Pacote de Deploy

Este pacote contém todos os scripts e configurações necessárias para migrar o sistema RHNet do Replit para um VPS Hostinger.

### 📋 Arquivos Incluídos

| Arquivo | Descrição |
|---------|-----------|
| `01-export-database.sh` | Script para exportar banco de dados do Replit |
| `02-environment-variables.env.example` | Template de variáveis de ambiente |
| `03-hostinger-vps-setup.sh` | Setup automático do VPS (Node, PostgreSQL, Nginx, etc) |
| `04-nginx-config.conf` | Configuração do Nginx (reverse proxy + SSL) |
| `05-pm2-ecosystem.config.js` | Configuração do PM2 (gerenciador de processos) |
| `06-import-database.sh` | Script para importar banco de dados no VPS |
| `07-automatic-backup.sh` | Script de backup automático diário |
| `08-ssl-setup.sh` | Configuração automática de SSL (Let's Encrypt) |
| `09-deploy-guide.md` | **Guia completo passo a passo** |
| `10-testing-checklist.md` | Checklist de testes pós-deploy |
| `README.md` | Este arquivo |

---

## 🎯 Início Rápido

### Pré-requisitos
- [ ] VPS Hostinger contratado (Ubuntu 22.04)
- [ ] Domínio www.rhnet.online configurado
- [ ] Acesso SSH ao VPS
- [ ] Cliente SFTP/SCP para transferir arquivos

### Ordem de Execução

1. **Exportar do Replit** (execute no Replit)
   ```bash
   ./01-export-database.sh
   ```

2. **Setup do VPS** (execute no VPS como root)
   ```bash
   ./03-hostinger-vps-setup.sh
   ```

3. **Importar Banco de Dados** (execute no VPS)
   ```bash
   ./06-import-database.sh /caminho/do/backup.sql
   ```

4. **Deploy da Aplicação**
   - Fazer upload do código
   - Configurar `.env` (usar template `02-environment-variables.env.example`)
   - `npm install && npm run build`
   - Copiar `05-pm2-ecosystem.config.js` e executar `pm2 start`

5. **Configurar Nginx**
   - Copiar `04-nginx-config.conf` para `/etc/nginx/sites-available/rhnet`
   - Criar link simbólico e recarregar Nginx

6. **Configurar SSL**
   ```bash
   ./08-ssl-setup.sh
   ```

7. **Configurar Backup Automático**
   - Copiar `07-automatic-backup.sh` para `/usr/local/bin/`
   - Adicionar cron job

8. **Testes Finais**
   - Seguir checklist em `10-testing-checklist.md`

---

## 📚 Documentação Completa

Para instruções detalhadas, **leia o guia principal:**

**→ [`09-deploy-guide.md`](09-deploy-guide.md)**

Este guia contém:
- Explicação detalhada de cada passo
- Comandos exatos a executar
- Troubleshooting
- Melhores práticas
- Dicas de manutenção

---

## ⚡ Resumo Técnico

### Stack Final no Hostinger

```
┌─────────────────────────────────────────┐
│   Cliente (Navegador)                   │
│   https://www.rhnet.online              │
└──────────────┬──────────────────────────┘
               │ HTTPS (443)
               ▼
┌─────────────────────────────────────────┐
│   Nginx (Reverse Proxy)                 │
│   - Serve frontend (dist/public/)       │
│   - Proxy /api → Express                │
│   - SSL/TLS (Let's Encrypt)             │
└──────────────┬──────────────────────────┘
               │ HTTP (5000)
               ▼
┌─────────────────────────────────────────┐
│   PM2 → Node.js (Express)               │
│   - API REST                            │
│   - Autenticação                        │
│   - Lógica de negócio                   │
└──────────────┬──────────────────────────┘
               │ PostgreSQL protocol
               ▼
┌─────────────────────────────────────────┐
│   PostgreSQL 16                         │
│   - 56+ tabelas                         │
│   - Dados persistentes                  │
└─────────────────────────────────────────┘
```

### Características

- **Frontend**: React (build estático servido por Nginx)
- **Backend**: Express.js (gerenciado por PM2)
- **Banco de Dados**: PostgreSQL 16 (local no VPS)
- **Web Server**: Nginx (reverse proxy + static files)
- **Process Manager**: PM2 (auto-restart, logs, monitoring)
- **SSL**: Let's Encrypt (renovação automática)
- **Backup**: Diário automático (cron + script)
- **Firewall**: UFW (portas 22, 80, 443)
- **Segurança**: Fail2Ban (proteção SSH)

---

## 🔧 Comandos Úteis

### Gerenciar Aplicação
```bash
pm2 list                    # Listar processos
pm2 logs rhnet              # Ver logs
pm2 restart rhnet           # Reiniciar
pm2 monit                   # Monitor em tempo real
```

### Gerenciar Serviços
```bash
systemctl status nginx      # Status do Nginx
systemctl status postgresql # Status do PostgreSQL
systemctl reload nginx      # Recarregar Nginx
```

### Verificar Saúde
```bash
curl https://www.rhnet.online/health  # Health check
pm2 describe rhnet                    # Detalhes do processo
htop                                  # Monitor de recursos
```

### Atualizar Aplicação
```bash
cd /var/www/rhnet
git pull origin main
npm install
npm run build
pm2 restart rhnet
```

### Backup Manual
```bash
/usr/local/bin/rhnet-backup.sh
```

### Logs
```bash
pm2 logs rhnet --lines 100              # Logs da aplicação
tail -f /var/log/nginx/rhnet-error.log  # Logs do Nginx
journalctl -u postgresql -f             # Logs do PostgreSQL
```

---

## 🆘 Suporte

### Troubleshooting Rápido

**Aplicação não inicia?**
```bash
pm2 logs rhnet --lines 50
# Verificar erros de ambiente
```

**Nginx 502 Bad Gateway?**
```bash
pm2 list  # Backend está rodando?
systemctl status nginx
```

**Banco de dados não conecta?**
```bash
psql $DATABASE_URL -c "SELECT 1;"
systemctl status postgresql
```

**SSL expirado?**
```bash
certbot renew
systemctl reload nginx
```

### Links Úteis

- **PM2 Docs**: https://pm2.keymetrics.io/
- **Nginx Docs**: https://nginx.org/en/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Certbot Docs**: https://certbot.eff.org/
- **Hostinger Help**: https://support.hostinger.com/

---

## 📊 Requisitos de Sistema

### Mínimo (Funcional)
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 80GB SSD
- **Bandwidth**: Ilimitado

### Recomendado (Produção)
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 160GB SSD
- **Bandwidth**: Ilimitado
- **Backup**: Off-site automático

---

## ✅ Checklist de Migração

- [ ] **Fase 1: Preparação**
  - [ ] Contratou VPS Hostinger
  - [ ] Exportou banco de dados do Replit
  - [ ] Documentou variáveis de ambiente
  - [ ] Fez backup completo do Replit

- [ ] **Fase 2: Setup VPS**
  - [ ] Conectou via SSH
  - [ ] Executou script de setup
  - [ ] Anotou credenciais do banco
  - [ ] Configurou firewall

- [ ] **Fase 3: Deploy**
  - [ ] Fez upload do código
  - [ ] Importou banco de dados
  - [ ] Configurou variáveis de ambiente
  - [ ] Fez build da aplicação
  - [ ] Iniciou com PM2

- [ ] **Fase 4: Nginx & SSL**
  - [ ] Configurou Nginx
  - [ ] Apontou DNS para VPS
  - [ ] Instalou certificado SSL
  - [ ] Testou HTTPS

- [ ] **Fase 5: Testes**
  - [ ] Login funciona
  - [ ] Clock in/out funciona
  - [ ] APIs respondem
  - [ ] Uploads funcionam
  - [ ] Emails enviam

- [ ] **Fase 6: Produção**
  - [ ] Configurou backups automáticos
  - [ ] Documentou processos
  - [ ] Treinou equipe
  - [ ] Sistema em produção! 🎉

---

## 📞 Contato

**Projeto:** RHNet - Sistema de Gestão de RH  
**Website:** https://www.rhnet.online  
**Email Comercial:** infosis@infosis.com.br  

---

## 📄 Licença

Este pacote de deploy é parte do sistema RHNet.  
Todos os direitos reservados.

---

**Última atualização:** 16/11/2025  
**Versão do Pacote:** 1.0.0  
**Compatível com:** Ubuntu 22.04 LTS  

---

## 🎓 Notas Finais

Este pacote foi criado para simplificar ao máximo a migração do Replit para Hostinger.

**Tempo estimado de migração completa:** 2-4 horas (depende da experiência com Linux)

**Dificuldade:**
- Para quem tem experiência com Linux/SSH: ⭐⭐☆☆☆ (Fácil)
- Para iniciantes: ⭐⭐⭐⭐☆ (Moderado)

**Recomendação:** 
Se for a primeira vez fazendo deploy de aplicação Node.js, reserve um tempo extra e siga o guia passo a passo com calma. Não pule etapas!

**Boa sorte com o deploy! 🚀**
