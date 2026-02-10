# 🧪 Checklist de Testes Pós-Deploy - RHNet

## 📋 Testes de Infraestrutura

### ✅ Servidor & Serviços

- [ ] **VPS acessível via SSH**
  ```bash
  ssh root@SEU_IP_VPS
  ```

- [ ] **Node.js instalado e versão correta**
  ```bash
  node -v  # Deve ser v18+ ou v20+
  npm -v
  ```

- [ ] **PostgreSQL rodando**
  ```bash
  systemctl status postgresql
  # Status: active (running)
  ```

- [ ] **Nginx rodando**
  ```bash
  systemctl status nginx
  # Status: active (running)
  nginx -t  # Deve retornar: test is successful
  ```

- [ ] **PM2 gerenciando aplicação**
  ```bash
  pm2 list
  # rhnet deve estar "online" em verde
  ```

- [ ] **Firewall configurado**
  ```bash
  ufw status
  # Deve mostrar: 22, 80, 443 ALLOW
  ```

---

## ✅ Banco de Dados

- [ ] **Conexão com banco funciona**
  ```bash
  psql $DATABASE_URL -c "SELECT version();"
  ```

- [ ] **Todas as tabelas foram importadas**
  ```bash
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
  # Deve retornar: 56+
  ```

- [ ] **Tabelas críticas existem**
  ```bash
  psql $DATABASE_URL -c "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'departments', 'time_entries', 
    'shifts', 'messages', 'candidates', 'leads'
  );"
  ```

- [ ] **Dados importados corretamente**
  ```bash
  # Verificar se há usuários
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
  
  # Verificar se há departamentos
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM departments;"
  ```

---

## ✅ HTTPS & SSL

- [ ] **Certificado SSL instalado**
  ```bash
  certbot certificates
  # Deve listar certificado para seu domínio
  ```

- [ ] **HTTPS funciona no navegador**
  - Acesse: https://www.rhnet.online
  - Verificar: Cadeado verde aparece
  - Não deve ter aviso de segurança

- [ ] **HTTP redireciona para HTTPS**
  - Acesse: http://www.rhnet.online
  - Deve redirecionar automaticamente para https://

- [ ] **Teste SSL Labs**
  - Acesse: https://www.ssllabs.com/ssltest/analyze.html?d=www.rhnet.online
  - Meta: Nota **A** ou **A+**

---

## ✅ Aplicação - Frontend

### Carregamento Inicial
- [ ] **Home page carrega**
  - Acesse: https://www.rhnet.online
  - Página deve carregar sem erros 404/502
  - Não deve aparecer "Cannot GET /"

- [ ] **Assets estáticos carregam**
  - F12 → Aba Network
  - Verificar: JS, CSS, imagens carregam (status 200)
  - Não deve ter erros 404 em assets

- [ ] **Favicon aparece**
  - Verificar ícone na aba do navegador

### Navegação
- [ ] **Rotas funcionam**
  - Teste: `/login`, `/admin`, `/dashboard`
  - Não deve dar erro 404
  - React Router deve funcionar

- [ ] **Navegação entre páginas**
  - Clicar em links do menu
  - Não deve dar refresh da página (SPA)

---

## ✅ Aplicação - Backend (API)

### Health Check
- [ ] **Health endpoint responde**
  ```bash
  curl https://www.rhnet.online/health
  # Deve retornar: OK
  ```

- [ ] **API endpoints acessíveis**
  ```bash
  curl https://www.rhnet.online/api/auth/has-superadmin
  # Deve retornar JSON: {"hasSuperadmin": true/false}
  ```

### Autenticação
- [ ] **Login funciona**
  - Acesse: https://www.rhnet.online/login
  - Entre com credenciais válidas
  - Deve redirecionar para dashboard

- [ ] **Sessão persiste**
  - Fechar e reabrir navegador
  - Ainda deve estar logado (cookies)

- [ ] **Logout funciona**
  - Clicar em logout
  - Deve deslogar e redirecionar

- [ ] **Proteção de rotas**
  - Acesse `/admin` sem estar logado
  - Deve redirecionar para `/login`

---

## ✅ Funcionalidades Principais

### Time Tracking (Registro de Ponto)
- [ ] **Clock in funciona**
  - Registrar ponto de entrada
  - Deve salvar no banco

- [ ] **Geolocalização ativa**
  - Navegador solicita permissão de localização
  - Coordenadas são capturadas

- [ ] **Reconhecimento facial**
  - Câmera ativa
  - Foto é capturada
  - Upload funciona

- [ ] **Clock out funciona**
  - Registrar ponto de saída
  - Deve calcular horas trabalhadas

### Mensagens
- [ ] **Enviar mensagem**
  - Admin envia mensagem para usuário/departamento
  - Mensagem salva no banco
  - Notificação aparece para destinatário

### Relatórios
- [ ] **Gerar relatório mensal**
  - Selecionar mês e exportar
  - PDF/Excel é gerado
  - Download funciona

### Administração
- [ ] **CRUD de usuários**
  - Criar novo usuário
  - Editar usuário existente
  - Desativar usuário

- [ ] **CRUD de departamentos**
  - Criar departamento
  - Atribuir usuários

- [ ] **CRUD de turnos**
  - Criar turno
  - Atribuir a funcionários

### Recruitment (Recrutamento)
- [ ] **Criar vaga**
  - Admin cria job opening
  - Salva no banco

- [ ] **Candidate application**
  - Candidato preenche formulário
  - DISC assessment funciona
  - Salva candidatura

### Lead Capture
- [ ] **Formulário de lead**
  - Preencher formulário na landing page
  - Submit funciona

- [ ] **Email de notificação**
  - Lead deve enviar email para `infosis@infosis.com.br`
  - Verificar caixa de entrada (ou logs se SendGrid não configurado)

- [ ] **Admin visualiza leads**
  - Acesse `/admin/leads`
  - Leads aparecem na tabela
  - Status pode ser alterado

---

## ✅ Upload de Arquivos

- [ ] **Pasta de uploads existe**
  ```bash
  ls -la /var/www/rhnet/uploads/
  # Deve existir e ter permissões corretas
  ```

- [ ] **Upload de foto (facial recognition)**
  - Clock in com reconhecimento facial
  - Foto salva em `/var/www/rhnet/uploads/faces/`
  - Arquivo acessível via URL

- [ ] **Upload de documentos**
  - Fazer upload de documento
  - Salva no servidor
  - Download funciona

---

## ✅ Performance & Monitoring

### Tempo de Resposta
- [ ] **Frontend carrega rápido**
  - F12 → Aba Network → Limpar → Reload
  - Tempo total: < 3 segundos (first load)

- [ ] **API responde rápido**
  ```bash
  time curl -s https://www.rhnet.online/api/auth/has-superadmin
  # Deve ser < 500ms
  ```

### Recursos do Servidor
- [ ] **CPU em uso normal**
  ```bash
  htop
  # CPU deve estar < 50% em idle
  ```

- [ ] **Memória disponível**
  ```bash
  free -h
  # Deve ter pelo menos 1GB livre
  ```

- [ ] **Disco com espaço**
  ```bash
  df -h
  # Uso deve estar < 80%
  ```

### Logs Saudáveis
- [ ] **Logs do PM2 sem erros**
  ```bash
  pm2 logs rhnet --lines 50
  # Não deve ter erros recorrentes
  ```

- [ ] **Logs do Nginx sem erros 5xx**
  ```bash
  tail -100 /var/log/nginx/rhnet-error.log
  # Não deve ter erros 500, 502, 503
  ```

---

## ✅ Backups & Segurança

### Backup Automático
- [ ] **Cron job configurado**
  ```bash
  crontab -l | grep rhnet-backup
  # Deve listar o job de backup
  ```

- [ ] **Script de backup funciona**
  ```bash
  /usr/local/bin/rhnet-backup.sh
  # Deve criar backup em /var/backups/rhnet/
  ```

- [ ] **Backups sendo criados**
  ```bash
  ls -lht /var/backups/rhnet/ | head -5
  # Deve listar backups recentes
  ```

### Segurança
- [ ] **Arquivo .env protegido**
  ```bash
  ls -la /var/www/rhnet/.env
  # Permissões: -rw------- (600)
  ```

- [ ] **Senhas não expostas**
  ```bash
  curl https://www.rhnet.online/.env
  # Deve retornar 403 Forbidden
  ```

- [ ] **Headers de segurança configurados**
  ```bash
  curl -I https://www.rhnet.online | grep -E "X-Frame-Options|Strict-Transport-Security"
  # Deve retornar headers de segurança
  ```

- [ ] **Fail2Ban ativo**
  ```bash
  systemctl status fail2ban
  # Status: active (running)
  ```

---

## ✅ Email (SendGrid)

- [ ] **SendGrid API Key configurado**
  ```bash
  grep SENDGRID_API_KEY /var/www/rhnet/.env
  # Deve ter valor (não vazio)
  ```

- [ ] **Email de teste enviado**
  - Submeter formulário de lead
  - Verificar inbox de `infosis@infosis.com.br`
  - Email deve chegar em poucos minutos

- [ ] **Logs de email (se falhar)**
  ```bash
  pm2 logs rhnet | grep -i sendgrid
  # Ver se há erros de SendGrid
  ```

---

## ✅ Mobile & Cross-Browser

### Mobile Responsivo
- [ ] **Chrome DevTools - Mobile**
  - F12 → Toggle device toolbar
  - Testar: iPhone 12, Samsung Galaxy
  - Interface deve adaptar

- [ ] **Funciona em dispositivo real**
  - Acesse de smartphone: https://www.rhnet.online
  - Login, clock in, navegação funcionam

### Navegadores
- [ ] **Chrome**
  - Todas as funcionalidades funcionam
  
- [ ] **Firefox**
  - Todas as funcionalidades funcionam

- [ ] **Safari (se disponível)**
  - Todas as funcionalidades funcionam

- [ ] **Edge**
  - Todas as funcionalidades funcionam

---

## ✅ PWA (Progressive Web App)

- [ ] **Manifest disponível**
  ```bash
  curl https://www.rhnet.online/manifest.json
  # Deve retornar JSON do manifest
  ```

- [ ] **Service Worker registrado**
  - F12 → Application → Service Workers
  - Deve mostrar SW ativo

- [ ] **Instalável**
  - Chrome deve mostrar ícone de "Instalar app"
  - Clicar e instalar no desktop

- [ ] **Funciona offline (básico)**
  - Instalar PWA
  - Desconectar internet
  - Alguns assets devem carregar do cache

---

## 📊 Testes de Carga (Opcional)

### Teste com ApacheBench
```bash
# 100 requisições, 10 concorrentes
ab -n 100 -c 10 https://www.rhnet.online/

# Ver:
# - Requests per second: > 50
# - Failed requests: 0
```

### Teste com curl-loader (Opcional)
```bash
# Simular 50 usuários simultâneos
# Instalar: apt install curl-loader
```

---

## 🎯 Checklist de Aceitação Final

- [ ] ✅ Infraestrutura: Todos os serviços rodando
- [ ] ✅ Banco de dados: Importado e funcional
- [ ] ✅ HTTPS: SSL ativo e renovação automática
- [ ] ✅ Frontend: Todas as páginas carregam
- [ ] ✅ Backend: Todas as APIs respondem
- [ ] ✅ Autenticação: Login/logout funcionam
- [ ] ✅ Time tracking: Clock in/out funcionam
- [ ] ✅ Geolocalização: Captura coordenadas
- [ ] ✅ Facial recognition: Câmera funciona
- [ ] ✅ Mensagens: Envio funciona
- [ ] ✅ Relatórios: Exportação funciona
- [ ] ✅ Admin: CRUD completo funciona
- [ ] ✅ Recruitment: Vagas e candidaturas funcionam
- [ ] ✅ Lead capture: Formulário e email funcionam
- [ ] ✅ Uploads: Fotos e documentos sobem
- [ ] ✅ Performance: Tempos de resposta aceitáveis
- [ ] ✅ Backups: Automáticos e funcionando
- [ ] ✅ Segurança: Firewall, SSL, headers
- [ ] ✅ Email: SendGrid enviando
- [ ] ✅ Mobile: Interface responsiva
- [ ] ✅ Cross-browser: Funciona em todos navegadores

---

## 🚨 Ações em Caso de Falha

### Se um teste falhar:

1. **Verificar logs**
   ```bash
   pm2 logs rhnet --lines 100
   tail -f /var/log/nginx/rhnet-error.log
   ```

2. **Verificar variáveis de ambiente**
   ```bash
   cat /var/www/rhnet/.env | grep -v "PASSWORD"
   ```

3. **Reiniciar serviços**
   ```bash
   pm2 restart rhnet
   systemctl restart nginx
   ```

4. **Verificar conectividade**
   ```bash
   ping -c 3 google.com
   psql $DATABASE_URL -c "SELECT 1;"
   ```

5. **Consultar troubleshooting do guia principal**
   - Ver arquivo `09-deploy-guide.md` seção "Troubleshooting"

---

## 📝 Registro de Testes

**Data:** ___________  
**Responsável:** ___________  
**VPS IP:** ___________  
**Domínio:** www.rhnet.online  

**Testes Passaram:** _____ / _____  
**Testes Falharam:** _____ / _____  

**Observações:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

**Status Final:** 
- [ ] ✅ APROVADO - Sistema pronto para produção
- [ ] ⚠️  APROVADO COM RESSALVAS - Listar ressalvas
- [ ] ❌ REPROVADO - Necessita correções

---

**Última atualização:** 16/11/2025  
**Versão:** 1.0  
