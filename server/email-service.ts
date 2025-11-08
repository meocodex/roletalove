/**
 * Serviço de Email - RouletteAI
 *
 * Para produção, configure uma das seguintes variáveis de ambiente:
 * - RESEND_API_KEY (recomendado) - https://resend.com
 * - SENDGRID_API_KEY - https://sendgrid.com
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (servidor SMTP genérico)
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private from = process.env.EMAIL_FROM || 'noreply@roletaia.com';
  private apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

  /**
   * Envia email usando Resend (preferencial)
   */
  private async sendWithResend(params: SendEmailParams): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text
      })
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }
  }

  /**
   * Envia email usando SendGrid
   */
  private async sendWithSendGrid(params: SendEmailParams): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: params.to }]
        }],
        from: { email: this.from },
        subject: params.subject,
        content: [
          { type: 'text/plain', value: params.text || '' },
          { type: 'text/html', value: params.html }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }
  }

  /**
   * Método principal de envio de email
   */
  async send(params: SendEmailParams): Promise<void> {
    if (!this.apiKey) {
      console.warn('⚠️ Email não enviado: Nenhuma API key configurada');
      console.log('📧 [MODO DEV] Email que seria enviado:', {
        to: params.to,
        subject: params.subject,
        preview: params.text?.substring(0, 100)
      });
      return;
    }

    try {
      if (process.env.RESEND_API_KEY) {
        await this.sendWithResend(params);
      } else if (process.env.SENDGRID_API_KEY) {
        await this.sendWithSendGrid(params);
      }

      console.log(`✅ Email enviado para ${params.to}: ${params.subject}`);
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Template: Trial acabando em 3 dias
   */
  getTrialEndingSoonTemplate(userName: string, daysLeft: number): EmailTemplate {
    return {
      subject: `⏰ Seu trial acaba em ${daysLeft} dias - RouletteAI`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; }
              .button { display: inline-block; background: #22C55E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Trial Acabando!</h1>
              </div>
              <div class="content">
                <p>Olá ${userName},</p>
                <p>Seu período de trial gratuito de 7 dias está acabando!</p>
                <p><strong>Você tem apenas ${daysLeft} dias restantes</strong> para aproveitar todos os recursos do RouletteAI.</p>
                <p>Para continuar aproveitando:</p>
                <ul>
                  <li>✅ Análise de padrões em tempo real</li>
                  <li>✅ Estratégias inteligentes</li>
                  <li>✅ Machine Learning avançado</li>
                  <li>✅ Suporte prioritário</li>
                </ul>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.APP_URL || 'http://localhost:5000'}/plans" class="button">
                    Ver Planos e Assinar
                  </a>
                </p>
                <p>Qualquer dúvida, estamos à disposição!</p>
                <p>Equipe RouletteAI</p>
              </div>
              <div class="footer">
                <p>RouletteAI - Sistema Inteligente de Análise de Roleta</p>
                <p>Você recebeu este email porque se cadastrou em nossa plataforma.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Olá ${userName},

        Seu período de trial gratuito de 7 dias está acabando!

        Você tem apenas ${daysLeft} dias restantes para aproveitar todos os recursos do RouletteAI.

        Acesse ${process.env.APP_URL || 'http://localhost:5000'}/plans para ver nossos planos e continuar aproveitando.

        Equipe RouletteAI
      `
    };
  }

  /**
   * Template: Trial expirou
   */
  getTrialExpiredTemplate(userName: string): EmailTemplate {
    return {
      subject: '❌ Seu trial expirou - RouletteAI',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; }
              .button { display: inline-block; background: #22C55E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>❌ Trial Expirado</h1>
              </div>
              <div class="content">
                <p>Olá ${userName},</p>
                <p>Seu período de trial gratuito de 7 dias expirou.</p>
                <p><strong>Uma fatura foi gerada</strong> e está aguardando pagamento.</p>
                <p>Assim que o pagamento for confirmado, seu acesso será liberado imediatamente!</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.APP_URL || 'http://localhost:5000'}/invoices" class="button">
                    Ver Fatura e Pagar
                  </a>
                </p>
                <p>Não perca o acesso aos melhores recursos de análise de roleta!</p>
                <p>Equipe RouletteAI</p>
              </div>
              <div class="footer">
                <p>RouletteAI - Sistema Inteligente de Análise de Roleta</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Olá ${userName},

        Seu período de trial gratuito de 7 dias expirou.

        Uma fatura foi gerada e está aguardando pagamento.

        Acesse ${process.env.APP_URL || 'http://localhost:5000'}/invoices para ver sua fatura e fazer o pagamento.

        Equipe RouletteAI
      `
    };
  }

  /**
   * Template: Fatura gerada
   */
  getInvoiceGeneratedTemplate(userName: string, amount: number, invoiceUrl: string): EmailTemplate {
    return {
      subject: '💳 Nova fatura disponível - RouletteAI',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; }
              .invoice-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #22C55E; }
              .button { display: inline-block; background: #22C55E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💳 Nova Fatura</h1>
              </div>
              <div class="content">
                <p>Olá ${userName},</p>
                <p>Uma nova fatura foi gerada para sua assinatura RouletteAI.</p>
                <div class="invoice-box">
                  <h2 style="margin-top: 0; color: #22C55E;">R$ ${amount.toFixed(2).replace('.', ',')}</h2>
                  <p>Assinatura Mensal - RouletteAI</p>
                </div>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${invoiceUrl}" class="button">
                    Pagar Agora
                  </a>
                </p>
                <p><strong>Métodos de pagamento disponíveis:</strong></p>
                <ul>
                  <li>💳 Cartão de Crédito</li>
                  <li>🎫 Boleto Bancário</li>
                  <li>📱 Pix</li>
                </ul>
                <p>Equipe RouletteAI</p>
              </div>
              <div class="footer">
                <p>RouletteAI - Sistema Inteligente de Análise de Roleta</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Olá ${userName},

        Uma nova fatura foi gerada para sua assinatura RouletteAI.

        Valor: R$ ${amount.toFixed(2).replace('.', ',')}

        Acesse ${invoiceUrl} para fazer o pagamento.

        Métodos disponíveis: Cartão de Crédito, Boleto, Pix

        Equipe RouletteAI
      `
    };
  }

  /**
   * Enviar email de trial acabando
   */
  async sendTrialEndingEmail(userEmail: string, userName: string, daysLeft: number): Promise<void> {
    const template = this.getTrialEndingSoonTemplate(userName, daysLeft);
    await this.send({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Enviar email de trial expirado
   */
  async sendTrialExpiredEmail(userEmail: string, userName: string): Promise<void> {
    const template = this.getTrialExpiredTemplate(userName);
    await this.send({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Enviar email de fatura gerada
   */
  async sendInvoiceEmail(userEmail: string, userName: string, amount: number): Promise<void> {
    const invoiceUrl = `${process.env.APP_URL || 'http://localhost:5000'}/invoices`;
    const template = this.getInvoiceGeneratedTemplate(userName, amount, invoiceUrl);
    await this.send({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }
}

export const emailService = new EmailService();
