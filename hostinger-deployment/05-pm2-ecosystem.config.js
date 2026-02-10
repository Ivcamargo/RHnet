// =========================================
// PM2 Ecosystem Configuration - RHNet
// Gerenciamento de Processo Node.js
// =========================================
//
// INSTALAÇÃO:
// 1. Copie este arquivo para: /var/www/rhnet/ecosystem.config.js
// 2. Inicie a aplicação: pm2 start ecosystem.config.js
// 3. Configure auto-start: pm2 startup && pm2 save
//
// COMANDOS ÚTEIS:
// - pm2 list                  - Listar processos
// - pm2 logs rhnet            - Ver logs
// - pm2 restart rhnet         - Reiniciar
// - pm2 stop rhnet            - Parar
// - pm2 delete rhnet          - Remover
// - pm2 monit                 - Monitor em tempo real
// - pm2 save                  - Salvar configuração atual
//
// =========================================

module.exports = {
  apps: [
    {
      // ============= APLICAÇÃO PRINCIPAL =============
      name: 'rhnet',
      
      // Script de entrada (após build)
      script: './dist/index.js',
      
      // Diretório da aplicação
      cwd: '/var/www/rhnet',
      
      // ============= MODO DE EXECUÇÃO =============
      // 'cluster' = múltiplas instâncias (escala horizontal)
      // 'fork' = processo único (mais simples, recomendado inicialmente)
      exec_mode: 'fork',
      
      // Número de instâncias
      // 0 = auto (detecta número de CPUs)
      // 1 = processo único
      // 2+ = cluster mode
      instances: 1,
      
      // ============= VARIÁVEIS DE AMBIENTE =============
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // Carregar .env file
      env_file: '/var/www/rhnet/.env',
      
      // ============= AUTO-RESTART =============
      // Reiniciar em caso de crash
      autorestart: true,
      
      // Máximo de reinícios em 1 minuto antes de desistir
      max_restarts: 10,
      
      // Tempo mínimo de uptime para considerar "estável" (30 segundos)
      min_uptime: '30s',
      
      // Delay entre restarts
      restart_delay: 4000,
      
      // ============= WATCH MODE (Desenvolvimento) =============
      // Não usar em produção! Reinicia ao detectar mudanças em arquivos
      watch: false,
      
      // ============= LOGS =============
      // Arquivo de log de saída padrão
      out_file: '/var/log/rhnet/pm2-out.log',
      
      // Arquivo de log de erros
      error_file: '/var/log/rhnet/pm2-error.log',
      
      // Combinar logs em um único arquivo
      combine_logs: true,
      
      // Formato de timestamp nos logs
      time: true,
      
      // Rotação de logs (previne arquivos muito grandes)
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // ============= MEMORY MANAGEMENT =============
      // Reiniciar se memória exceder 1GB (previne memory leaks)
      max_memory_restart: '1G',
      
      // ============= GRACEFUL SHUTDOWN =============
      // Tempo para graceful shutdown antes de forçar (SIGKILL)
      kill_timeout: 5000,
      
      // Aguardar servidor estar pronto antes de considerar "online"
      listen_timeout: 10000,
      
      // ============= HEALTH MONITORING =============
      // PM2 Plus (opcional - serviço pago de monitoramento)
      // Descomente se quiser usar: https://pm2.io/
      // pmx: true,
      // instance_var: 'INSTANCE_ID',
      
      // ============= CRON RESTART (Opcional) =============
      // Reiniciar automaticamente a cada dia às 3h da manhã
      // Útil para liberar memória e aplicar patches
      // cron_restart: '0 3 * * *',
      
      // ============= INTERPRETER =============
      // Usar Node.js padrão (não babel, coffee, etc)
      interpreter: 'node',
      
      // ============= NODE ARGS (Otimizações) =============
      // Argumentos do Node.js
      node_args: [
        '--max-old-space-size=1024',  // Limite de heap: 1GB
        '--max-http-header-size=16384' // Tamanho máximo de header HTTP
      ],
      
      // ============= SOURCE MAP SUPPORT =============
      // Habilitar source maps para melhor debugging
      source_map_support: true,
      
      // ============= POST-DEPLOY HOOKS =============
      // Scripts para executar após deploy
      post_update: [
        'npm install',
        'npm run build',
        'pm2 reload ecosystem.config.js --update-env'
      ].join(' && ')
    },
    
    // ============= WORKER ADICIONAL (Opcional) =============
    // Descomente se precisar de um worker separado para tarefas background
    // {
    //   name: 'rhnet-worker',
    //   script: './dist/worker.js',
    //   cwd: '/var/www/rhnet',
    //   exec_mode: 'fork',
    //   instances: 1,
    //   autorestart: true,
    //   env: {
    //     NODE_ENV: 'production',
    //   },
    //   env_file: '/var/www/rhnet/.env',
    //   out_file: '/var/log/rhnet/worker-out.log',
    //   error_file: '/var/log/rhnet/worker-error.log',
    // }
  ],
  
  // ============= DEPLOY CONFIGURATION (Opcional) =============
  // Permite fazer deploy via: pm2 deploy production
  deploy: {
    production: {
      // Usuário SSH
      user: 'root',
      
      // Host do servidor
      host: 'SEU_IP_HOSTINGER',
      
      // Branch do Git
      ref: 'origin/main',
      
      // Repositório Git
      repo: 'git@github.com:seu-usuario/rhnet.git',
      
      // Caminho no servidor
      path: '/var/www/rhnet',
      
      // Comandos pós-deploy
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --update-env',
      
      // Variáveis de ambiente
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};

// =========================================
// NOTAS ADICIONAIS
// =========================================
//
// 1. LOGS ROTATION (Configurar separadamente):
//    pm2 install pm2-logrotate
//    pm2 set pm2-logrotate:max_size 10M
//    pm2 set pm2-logrotate:retain 7
//    pm2 set pm2-logrotate:compress true
//
// 2. MONITORING (Dashboard Web):
//    pm2 web
//    Acesse: http://localhost:9615
//
// 3. STARTUP SCRIPT (Auto-start no boot):
//    pm2 startup
//    (Execute o comando que aparecer)
//    pm2 save
//
// 4. UPDATE PM2:
//    npm install -g pm2@latest
//    pm2 update
//
// 5. CLUSTER MODE (Para alta carga):
//    Mude: exec_mode: 'cluster', instances: 0
//    PM2 vai criar uma instância por CPU
//
// =========================================
