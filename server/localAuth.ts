import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { z } from 'zod';
import { sendPasswordResetEmail } from './emailService';
import { Router } from 'express';
import { storage } from './storage';
import { insertUserSchema } from '../shared/schema';

// Rate limiting simple em memória (produção usaria Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

// Configurações do Argon2 (seguras para produção)
const argon2Config = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,
  parallelism: 1,
};

// Schemas de validação
const loginSchema = z.object({
  email: z.string().min(1, 'Email ou CPF é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const setPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

const adminResetPasswordSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  temporaryPassword: z.string().min(6, 'Senha temporária deve ter pelo menos 6 caracteres'),
});

// Função para hash de senha
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, argon2Config);
}

// Função para verificar senha
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// Função para gerar token de reset seguro
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Função para verificar se token de reset é válido (não expirou)
function isResetTokenValid(expires: Date | null): boolean {
  if (!expires) return false;
  return new Date() < expires;
}

// Rate limiting para login
function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(email);
  
  if (!attempts) return true;
  
  // Reset se passou do tempo de lockout
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(email);
    return true;
  }
  
  return attempts.count < MAX_LOGIN_ATTEMPTS;
}

function recordFailedAttempt(email: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: now };
  
  attempts.count += 1;
  attempts.lastAttempt = now;
  loginAttempts.set(email, attempts);
}

function clearFailedAttempts(email: string): void {
  loginAttempts.delete(email);
}

// Middleware de autenticação híbrido
export function isAuthenticatedHybrid(req: any, res: any, next: any) {
  // Primeiro verifica se tem autenticação OIDC (compatibilidade)
  if (req.user?.claims?.sub) {
    return next();
  }
  
  // Verifica autenticação local via sessão
  if (req.session?.userId) {
    // Carrega usuário da sessão local (async) - RETORNA a promise para evitar double response
    return storage.getUser(req.session.userId)
      .then(user => {
        if (user && user.isActive) {
          // Simula a estrutura OIDC para compatibilidade
          req.user = {
            claims: {
              sub: user.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
              role: user.role,
              companyId: user.companyId,
            }
          };
          return next();
        } else {
          // Usuário não encontrado ou inativo, limpa sessão
          req.session.destroy(() => {
            return res.status(401).json({ message: "Unauthorized" });
          });
        }
      })
      .catch(error => {
        console.error('Error loading user from session:', error);
        return res.status(401).json({ message: "Unauthorized" });
      });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Endpoints de autenticação
export function setupLocalAuth(app: any) {
  const authRouter = Router();

  // Login
  authRouter.post('/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Verifica rate limiting
      if (!checkRateLimit(email)) {
        return res.status(429).json({ 
          message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' 
        });
      }

      // Busca usuário por email ou CPF
      const users = await storage.getAllUsers();
      const emailOrCpfInput = email.toLowerCase();
      const cpfInputClean = email.replace(/\D/g, ''); // Remove caracteres não numéricos do input
      
      const user = users.find(u => {
        const emailMatch = u.email?.toLowerCase() === emailOrCpfInput;
        const cpfMatch = u.cpf && (
          u.cpf === email || // Match exato (com formatação)
          u.cpf.replace(/\D/g, '') === cpfInputClean // Match sem formatação
        );
        return emailMatch || cpfMatch;
      });
      
      if (!user || !user.passwordHash) {
        recordFailedAttempt(email);
        return res.status(401).json({ message: 'Email/CPF ou senha inválidos' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Usuário inativo' });
      }

      // Verifica senha
      const isValidPassword = await verifyPassword(user.passwordHash, password);
      if (!isValidPassword) {
        recordFailedAttempt(email);
        return res.status(401).json({ message: 'Email/CPF ou senha inválidos' });
      }

      // Login bem-sucedido
      clearFailedAttempts(email);
      
      // Cria sessão
      req.session.userId = user.id;
      req.session.save((err: any) => {
        if (err) {
          console.error('Erro ao salvar sessão:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        
        res.json({
          message: 'Login realizado com sucesso',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
          }
        });
      });

    } catch (error) {
      console.error('Erro no login:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Logout - GET route for redirects
  authRouter.get('/logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      res.redirect('/landing');
    });
  });

  // Logout - POST route for API calls
  authRouter.post('/logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });

  // Registro (apenas se não houver superadmin ou se for superadmin)
  authRouter.post('/register', async (req, res) => {
    try {
      const { email, firstName, lastName, password } = registerSchema.parse(req.body);
      
      // Verifica se já existe um superadmin
      const users = await storage.getAllUsers();
      const hasSuperadmin = users.some(u => u.role === 'superadmin');
      
      // Se já existe superadmin, apenas superadmin pode criar novos usuários
      if (hasSuperadmin) {
        // Verifica se o usuário atual está logado e é superadmin
        if (!req.session?.userId) {
          return res.status(401).json({ message: 'É necessário fazer login para criar usuários' });
        }
        
        const currentUser = users.find(u => u.id === req.session.userId);
        if (!currentUser || currentUser.role !== 'superadmin') {
          return res.status(403).json({ message: 'Apenas superadmins podem criar usuários' });
        }
      }
      // Se não há superadmin, permite registro público (primeiro usuário)

      // Verifica se email já existe
      const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Hash da senha
      const passwordHash = await hashPassword(password);
      
      // Cria usuário
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const role = hasSuperadmin ? 'employee' : 'superadmin'; // Primeiro usuário é superadmin
      
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        mustChangePassword: false,
        isActive: true,
      });

      // Se é o primeiro usuário (superadmin), faz login automático
      if (!hasSuperadmin) {
        req.session.userId = newUser.id;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          mustChangePassword: newUser.mustChangePassword,
        }
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Definir senha (para usuários que devem trocar senha)
  authRouter.post('/set-password', isAuthenticatedHybrid, async (req, res) => {
    try {
      const { newPassword } = setPasswordSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Hash da nova senha
      const passwordHash = await hashPassword(newPassword);
      
      // Atualiza usuário
      await storage.updateUser(userId, {
        passwordHash,
        mustChangePassword: false,
      });

      res.json({ message: 'Senha atualizada com sucesso' });

    } catch (error) {
      console.error('Erro ao definir senha:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Alterar senha (usuário muda sua própria senha)
  authRouter.post('/change-password', isAuthenticatedHybrid, async (req, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verifica se usuário tem senha definida (necessário para autenticação local)
      if (!user.passwordHash) {
        return res.status(400).json({ 
          message: 'Usuário deve definir uma senha antes de alterá-la' 
        });
      }

      // Verifica senha atual
      const isCurrentPasswordValid = await verifyPassword(user.passwordHash, currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ 
          message: 'Senha atual incorreta' 
        });
      }

      // Hash da nova senha
      const passwordHash = await hashPassword(newPassword);
      
      // Atualiza usuário
      await storage.updateUser(userId, {
        passwordHash,
        mustChangePassword: false,
      });

      res.json({ message: 'Senha alterada com sucesso' });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Status da autenticação (compatibilidade com /api/auth/user)
  authRouter.get('/user', isAuthenticatedHybrid, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Buscar dados mínimos da empresa (apenas campos não-sensíveis)
      let company = null;
      if (user.companyId) {
        const companyData = await storage.getCompany(user.companyId);
        if (companyData) {
          company = {
            id: companyData.id,
            name: companyData.name,
            logoUrl: companyData.logoUrl,
          };
        }
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        departmentId: user.departmentId,
        mustChangePassword: user.mustChangePassword,
        isActive: user.isActive,
        company: company,
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Verifica se tem superadmin (compatibilidade)
  authRouter.get('/has-superadmin', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const hasSuperadmin = users.some(u => u.role === 'superadmin');
      res.json({ hasSuperadmin });
    } catch (error) {
      console.error('Erro ao verificar superadmin:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Esqueci minha senha - solicita reset
  authRouter.post('/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Busca usuário por email
      const users = await storage.getAllUsers();
      const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
      
      // Sempre retorna sucesso (não revela se email existe - segurança)
      if (!user || !user.isActive) {
        return res.json({ 
          message: 'Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha.' 
        });
      }
      
      // Gera token de reset válido por 1 hora
      const resetToken = generateResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      
      // Atualiza usuário com token de reset
      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      // Tenta enviar email de reset
      try {
        const emailSent = await sendPasswordResetEmail(
          user.email!, 
          resetToken, 
          user.firstName
        );
        
        if (emailSent) {
          console.log(`Password reset email sent to: ${email}`);
        } else {
          console.error(`Failed to send password reset email to: ${email}`);
          // Log para desenvolvimento
          console.log(`Reset password link for ${email}: /reset-password?token=${resetToken}`);
        }
      } catch (error) {
        console.error('Error sending password reset email:', error);
        // Log para desenvolvimento se email falhar
        console.log(`Reset password link for ${email}: /reset-password?token=${resetToken}`);
      }
      
      res.json({ 
        message: 'Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha.'
      });

    } catch (error) {
      console.error('Erro ao solicitar reset:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Email inválido', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Reset de senha com token
  authRouter.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      
      // Busca usuário pelo token
      const users = await storage.getAllUsers();
      const user = users.find(u => u.passwordResetToken === token);
      
      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }
      
      // Verifica se token não expirou
      if (!isResetTokenValid(user.passwordResetExpires)) {
        return res.status(400).json({ message: 'Token expirado' });
      }
      
      // Hash da nova senha
      const passwordHash = await hashPassword(newPassword);
      
      // Atualiza usuário com nova senha e limpa token
      await storage.updateUser(user.id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        mustChangePassword: false,
      });
      
      res.json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Admin reseta senha de usuário (cria senha temporária)
  authRouter.post('/admin/reset-password', isAuthenticatedHybrid, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      // Verifica se é admin ou superadmin
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
        return res.status(403).json({ message: 'Acesso negado. Apenas admins podem resetar senhas.' });
      }
      
      const { userId, temporaryPassword } = adminResetPasswordSchema.parse(req.body);
      
      // Busca usuário alvo
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verifica autorização: admin só pode resetar senha de funcionários da mesma empresa
      if (currentUser.role === 'admin') {
        if (!currentUser.companyId) {
          return res.status(400).json({ message: 'Admin deve estar vinculado a uma empresa' });
        }
        if (targetUser.companyId !== currentUser.companyId) {
          return res.status(403).json({ message: 'Admin só pode resetar senhas de funcionários da mesma empresa' });
        }
        if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
          return res.status(403).json({ message: 'Admin não pode resetar senha de outros administradores' });
        }
      }
      
      // Hash da senha temporária
      const passwordHash = await hashPassword(temporaryPassword);
      
      // Atualiza usuário com senha temporária e força troca
      await storage.updateUser(userId, {
        passwordHash,
        mustChangePassword: true,
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      
      res.json({ 
        message: `Senha temporária definida para ${targetUser.firstName} ${targetUser.lastName}. O usuário deverá alterar a senha no próximo login.` 
      });

    } catch (error) {
      console.error('Erro ao resetar senha pelo admin:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Alterar senha do próprio usuário
  authRouter.post('/change-password', isAuthenticatedHybrid, async (req, res) => {
    try {
      const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
        newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
        confirmPassword: z.string(),
      }).refine(data => data.newPassword === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
      });

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      const user = await storage.getUser(req.user.claims.sub);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (!user.passwordHash) {
        return res.status(400).json({ message: 'Usuário não possui senha configurada' });
      }

      // Verifica senha atual
      const isValidPassword = await verifyPassword(user.passwordHash, currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const passwordHash = await hashPassword(newPassword);
      
      // Atualiza senha
      await storage.updateUser(user.id, {
        passwordHash,
        mustChangePassword: false,
      });
      
      res.json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.use('/api/auth', authRouter);
}