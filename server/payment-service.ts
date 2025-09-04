import Stripe from 'stripe';
import { storage } from './storage';
import { PLAN_CONFIG, type PlanType } from '@shared/schema';

// Configurar Stripe (opcional durante desenvolvimento)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
}) : null;

export interface PaymentProvider {
  createSubscription(userId: string, planType: PlanType): Promise<any>;
  createPayment(amount: number, currency: string, metadata?: any): Promise<any>;
  handleWebhook(payload: any, signature?: string): Promise<void>;
  cancelSubscription(subscriptionId: string): Promise<any>;
}

export class StripePaymentProvider implements PaymentProvider {
  async createSubscription(userId: string, planType: PlanType) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente.');
    }
    
    try {
      const user = await storage.getUserById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const planConfig = PLAN_CONFIG[planType];
      
      // Criar cliente no Stripe se não existir
      let stripeCustomer;
      try {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          stripeCustomer = customers.data[0];
        } else {
          stripeCustomer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
              userId: user.id,
              planType: planType
            }
          });
        }
      } catch (error) {
        console.error('Erro ao criar/buscar cliente no Stripe:', error);
        throw new Error('Erro na integração com gateway de pagamento');
      }

      // Criar produto no Stripe se não existir
      let stripeProduct;
      try {
        const products = await stripe.products.list({
          active: true,
          limit: 10
        });
        
        stripeProduct = products.data.find(p => p.metadata?.planType === planType);
        
        if (!stripeProduct) {
          stripeProduct = await stripe.products.create({
            name: `Plano ${planConfig.name}`,
            description: `Acesso completo ao sistema de análise de roleta - ${planConfig.name}`,
            metadata: {
              planType: planType
            }
          });
        }
      } catch (error) {
        console.error('Erro ao criar produto no Stripe:', error);
        throw new Error('Erro na configuração do plano');
      }

      // Criar preço no Stripe
      let stripePrice;
      try {
        const prices = await stripe.prices.list({
          product: stripeProduct.id,
          active: true,
          type: 'recurring'
        });
        
        stripePrice = prices.data.find(p => 
          p.unit_amount === Math.round(planConfig.price * 100) &&
          p.currency === 'brl' &&
          p.recurring?.interval === 'month'
        );
        
        if (!stripePrice) {
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(planConfig.price * 100), // Converter para centavos
            currency: 'brl',
            recurring: {
              interval: 'month'
            },
            metadata: {
              planType: planType
            }
          });
        }
      } catch (error) {
        console.error('Erro ao criar preço no Stripe:', error);
        throw new Error('Erro na configuração de preços');
      }

      // Criar assinatura no Stripe
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: stripePrice.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: 7, // 7 dias de trial
        metadata: {
          userId: user.id,
          planType: planType
        }
      });

      // Salvar assinatura no banco
      const subscription = await storage.createSubscription({
        userId: user.id,
        planType: planType,
        status: 'trialing',
        priceMonthly: planConfig.price,
        currency: 'BRL',
        stripeSubscriptionId: stripeSubscription.id,
        nextBillingDate: new Date((stripeSubscription as any).current_period_end * 1000),
        trialDays: 7,
        isTrialUsed: false
      });

      return {
        subscription,
        clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret,
        subscriptionId: stripeSubscription.id
      };
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }

  async createPayment(amount: number, currency: string = 'brl', metadata: any = {}) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente.');
    }
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Converter para centavos
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, signature?: string) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente.');
    }
    
    try {
      let event;
      
      if (signature && process.env.STRIPE_WEBHOOK_SECRET) {
        try {
          event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } catch (err) {
          console.error('Webhook signature verification failed:', err);
          throw new Error('Webhook signature verification failed');
        }
      } else {
        event = payload;
      }

      // Processar diferentes tipos de eventos
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
          
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object);
          break;
          
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
          
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
          
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
          
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
          
        default:
          console.log(`Evento não tratado: ${event.type}`);
      }

      // Registrar evento de billing
      await storage.createBillingEvent({
        userId: event.data.object.metadata?.userId || 'unknown',
        eventType: event.type,
        source: 'stripe',
        data: event.data.object,
        processed: true
      });
    } catch (error) {
      console.error('Erro no processamento do webhook:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente.');
    }
    
    try {
      const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      // Atualizar assinatura no banco
      const subscriptions = await storage.getSubscriptions();
      const subscription = subscriptions.find(s => s.stripeSubscriptionId === subscriptionId);
      
      if (subscription) {
        await storage.updateSubscription(subscription.id, {
          status: 'canceled',
          canceledAt: new Date(),
          endDate: new Date((stripeSubscription as any).current_period_end * 1000)
        });
      }

      return stripeSubscription;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  private async handleSubscriptionCreated(subscription: any) {
    console.log('Assinatura criada:', subscription.id);
    // Lógica adicional se necessário
  }

  private async handleSubscriptionUpdated(subscription: any) {
    console.log('Assinatura atualizada:', subscription.id);
    
    const subscriptions = await storage.getSubscriptions();
    const localSubscription = subscriptions.find(s => s.stripeSubscriptionId === subscription.id);
    
    if (localSubscription) {
      let status: any = 'active';
      
      switch (subscription.status) {
        case 'active': status = 'active'; break;
        case 'canceled': status = 'canceled'; break;
        case 'past_due': status = 'past_due'; break;
        case 'unpaid': status = 'unpaid'; break;
        case 'incomplete': status = 'incomplete'; break;
        case 'trialing': status = 'trialing'; break;
        default: status = 'active';
      }
      
      await storage.updateSubscription(localSubscription.id, {
        status,
        nextBillingDate: new Date(subscription.current_period_end * 1000)
      });
    }
  }

  private async handleSubscriptionCanceled(subscription: any) {
    console.log('Assinatura cancelada:', subscription.id);
    
    const subscriptions = await storage.getSubscriptions();
    const localSubscription = subscriptions.find(s => s.stripeSubscriptionId === subscription.id);
    
    if (localSubscription) {
      await storage.updateSubscription(localSubscription.id, {
        status: 'canceled',
        canceledAt: new Date(),
        endDate: new Date(subscription.current_period_end * 1000)
      });
    }
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    console.log('Pagamento bem-sucedido:', paymentIntent.id);
    
    // Buscar pagamento no banco e atualizar status
    const payments = await storage.getPayments();
    const payment = payments.find(p => p.stripePaymentIntentId === paymentIntent.id);
    
    if (payment) {
      await storage.updatePayment(payment.id, {
        status: 'paid',
        paidAt: new Date()
      });
    }
  }

  private async handlePaymentFailed(paymentIntent: any) {
    console.log('Pagamento falhou:', paymentIntent.id);
    
    const payments = await storage.getPayments();
    const payment = payments.find(p => p.stripePaymentIntentId === paymentIntent.id);
    
    if (payment) {
      await storage.updatePayment(payment.id, {
        status: 'failed',
        failedAt: new Date()
      });
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: any) {
    console.log('Pagamento de fatura bem-sucedido:', invoice.id);
    // Lógica adicional para faturas pagas
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    console.log('Pagamento de fatura falhou:', invoice.id);
    // Lógica adicional para faturas com falha
  }
}

// Classe para futura integração com gateways brasileiros
export class BrazilianPaymentProvider implements PaymentProvider {
  async createSubscription(userId: string, planType: PlanType) {
    // TODO: Implementar Mercado Pago, PagSeguro, Asaas
    throw new Error('Gateway brasileiro ainda não implementado');
  }

  async createPayment(amount: number, currency: string, metadata?: any) {
    // TODO: Implementar pagamentos via PIX, boleto, etc
    throw new Error('Pagamentos brasileiros ainda não implementados');
  }

  async handleWebhook(payload: any, signature?: string) {
    // TODO: Implementar webhooks dos gateways brasileiros
    throw new Error('Webhooks brasileiros ainda não implementados');
  }

  async cancelSubscription(subscriptionId: string) {
    // TODO: Implementar cancelamento nos gateways brasileiros
    throw new Error('Cancelamento brasileiro ainda não implementado');
  }
}

// Factory para escolher o provedor de pagamento
export class PaymentService {
  private static getProvider(type: 'stripe' | 'brazilian' = 'stripe'): PaymentProvider {
    switch (type) {
      case 'stripe':
        return new StripePaymentProvider();
      case 'brazilian':
        return new BrazilianPaymentProvider();
      default:
        return new StripePaymentProvider();
    }
  }

  static async createSubscription(userId: string, planType: PlanType, provider: 'stripe' | 'brazilian' = 'stripe') {
    const paymentProvider = this.getProvider(provider);
    return await paymentProvider.createSubscription(userId, planType);
  }

  static async createPayment(amount: number, currency: string = 'brl', metadata: any = {}, provider: 'stripe' | 'brazilian' = 'stripe') {
    const paymentProvider = this.getProvider(provider);
    return await paymentProvider.createPayment(amount, currency, metadata);
  }

  static async handleWebhook(payload: any, signature?: string, provider: 'stripe' | 'brazilian' = 'stripe') {
    const paymentProvider = this.getProvider(provider);
    return await paymentProvider.handleWebhook(payload, signature);
  }

  static async cancelSubscription(subscriptionId: string, provider: 'stripe' | 'brazilian' = 'stripe') {
    const paymentProvider = this.getProvider(provider);
    return await paymentProvider.cancelSubscription(subscriptionId);
  }
}