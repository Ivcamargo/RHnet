import { MailService } from '@sendgrid/mail';
import type { Lead } from '@shared/schema';

// Graceful fallback if SendGrid is not configured
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SALES_EMAIL = process.env.SALES_EMAIL || 'infosis@infosis.com.br';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@rhnet.com';

const mailService = new MailService();
if (SENDGRID_API_KEY) {
  mailService.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API key not configured. Email sending will be logged only.');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    
    await mailService.send(emailData);
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
    from: FROM_EMAIL,
    subject,
    text,
    html,
  });
}

export async function sendLeadNotificationEmail(lead: Lead): Promise<boolean> {
  // If SendGrid is not configured, log and return gracefully
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid not configured. Lead notification email not sent.');
    console.log('New lead received:', {
      name: lead.name,
      email: lead.email,
      company: lead.companyName || 'N/A',
      phone: lead.phone || 'N/A',
      message: lead.message || 'N/A',
    });
    return false;
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e3a5f; border-bottom: 3px solid #2dd4bf; padding-bottom: 10px;">
        Novo Lead Capturado - RHNet
      </h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e3a5f; margin-top: 0;">Informações do Contato</h3>
        
        <p><strong>Nome:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
        <p><strong>Telefone:</strong> ${lead.phone || 'Não informado'}</p>
        <p><strong>Empresa:</strong> ${lead.companyName || 'Não informada'}</p>
        
        ${lead.message ? `
          <div style="margin-top: 15px; padding: 15px; background-color: white; border-left: 4px solid #2dd4bf;">
            <strong>Mensagem:</strong>
            <p style="margin: 5px 0 0 0;">${lead.message}</p>
          </div>
        ` : ''}
      </div>
      
      <div style="background-color: #e7f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e3a5f; margin-top: 0;">Próximos Passos</h3>
        <ol style="margin: 0; padding-left: 20px;">
          <li>Entre em contato com o lead em até 24 horas</li>
          <li>Agende uma reunião de apresentação</li>
          <li>Prepare proposta comercial personalizada</li>
        </ol>
      </div>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        Lead recebido em: ${new Date(lead.createdAt!).toLocaleString('pt-BR')}
        <br>
        Fonte: ${lead.sourceChannel}
      </p>
    </div>
  `;

  const emailText = `
NOVO LEAD CAPTURADO - RHNET

INFORMAÇÕES DO CONTATO:
Nome: ${lead.name}
Email: ${lead.email}
Telefone: ${lead.phone || 'Não informado'}
Empresa: ${lead.companyName || 'Não informada'}

${lead.message ? `MENSAGEM:\n${lead.message}` : ''}

PRÓXIMOS PASSOS:
1. Entre em contato com o lead em até 24 horas
2. Agende uma reunião de apresentação
3. Prepare proposta comercial personalizada

Lead recebido em: ${new Date(lead.createdAt!).toLocaleString('pt-BR')}
Fonte: ${lead.sourceChannel}
  `;

  return await sendEmail({
    to: SALES_EMAIL,
    from: FROM_EMAIL,
    subject: `🎯 Novo Lead: ${lead.name} - ${lead.companyName || 'Empresa não informada'}`,
    text: emailText,
    html: emailHtml,
  });
}