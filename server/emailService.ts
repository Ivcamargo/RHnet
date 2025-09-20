import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  userEmail: string, 
  resetToken: string, 
  userName?: string | null
): Promise<boolean> {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const subject = 'RHNet - Redefinição de Senha';
  
  const text = `
Olá ${userName || ''},

Você solicitou a redefinição de sua senha no RHNet.

Para redefinir sua senha, clique no link abaixo (válido por 1 hora):
${resetUrl}

Se você não solicitou esta redefinição, pode ignorar este email.

Equipe RHNet
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, hsl(210, 100%, 25%) 0%, hsl(180, 60%, 70%) 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">RHNet</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema de Recursos Humanos</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: hsl(210, 100%, 25%); margin-top: 0;">Redefinição de Senha</h2>
        
        <p style="color: #333; line-height: 1.6;">
          Olá <strong>${userName || 'usuário'}</strong>,
        </p>
        
        <p style="color: #333; line-height: 1.6;">
          Você solicitou a redefinição de sua senha no RHNet. Para continuar, clique no botão abaixo:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: hsl(210, 100%, 25%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          <strong>Importante:</strong> Este link é válido por apenas 1 hora. Se expirar, você precisará solicitar um novo reset de senha.
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Se você não solicitou esta redefinição, pode ignorar este email com segurança.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Este é um email automático. Por favor, não responda.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@rhnet.com', // Você pode configurar um domínio verificado no SendGrid
    subject,
    text,
    html,
  });
}