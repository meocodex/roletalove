import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertRouletteResultSchema, 
  insertAlertSchema,
  insertUserSchema,
  insertSubscriptionSchema,
  insertPaymentSchema,
  insertPaymentMethodSchema,
  insertBillingEventSchema
} from "@shared/schema";
import { z } from "zod";
import { AIServices } from "./ai-services";
import { PaymentService } from "./payment-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.post('/api/results', async (req, res) => {
    try {
      const body = insertRouletteResultSchema.parse(req.body);
      const result = await storage.addResult(body);
      res.json(result);
    } catch (error) {
      console.error('Error adding result:', error);
      res.status(400).json({ error: 'Invalid result data' });
    }
  });

  app.get('/api/results', async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });

  // Simplified patterns endpoint - client does analysis
  app.get('/api/patterns', async (req, res) => {
    try {
      const patterns = await storage.getPatterns();
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      res.status(500).json({ error: 'Failed to fetch patterns' });
    }
  });

  app.get('/api/strategies', async (req, res) => {
    try {
      const strategies = await storage.getStrategies();
      res.json(strategies);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      res.status(500).json({ error: 'Failed to fetch strategies' });
    }
  });

  app.put('/api/strategies/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const strategy = await storage.updateStrategy(id, updates);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      res.json(strategy);
    } catch (error) {
      console.error('Error updating strategy:', error);
      res.status(500).json({ error: 'Failed to update strategy' });
    }
  });

  app.get('/api/alerts', async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.post('/api/alerts', async (req, res) => {
    try {
      const body = insertAlertSchema.parse(req.body);
      const alert = await storage.addAlert(body);
      res.json(alert);
    } catch (error) {
      console.error('Error adding alert:', error);
      res.status(400).json({ error: 'Invalid alert data' });
    }
  });

  app.get('/api/session/stats', async (req, res) => {
    try {
      const session = await storage.getCurrentSession();
      const results = await storage.getResults();
      const patterns = await storage.getPatterns();
      
      const stats = {
        session: session || {
          id: 'default',
          name: 'Sessão Principal',
          startTime: new Date(),
          endTime: null,
          totalSpins: 0,
          patternsDetected: 0,
          successRate: 0,
          isActive: true
        },
        totalSpins: results.length,
        patternsDetected: patterns.length,
        lastZero: results.find(r => r.number === 0)?.timestamp || null,
        colorDistribution: results.reduce((acc: any, result) => {
          acc[result.color] = (acc[result.color] || 0) + 1;
          return acc;
        }, {}),
        successRate: patterns.length > 0 ? Math.round((patterns.length / results.length) * 100) : 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching session stats:', error);
      res.status(500).json({ error: 'Failed to fetch session stats' });
    }
  });

  app.get('/api/betting-preferences', async (req, res) => {
    try {
      const preferences = await storage.getBettingPreferences();
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching betting preferences:', error);
      res.status(500).json({ error: 'Failed to fetch betting preferences' });
    }
  });

  app.put('/api/betting-preferences/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const preference = await storage.updateBettingPreference(id, updates);
      
      if (!preference) {
        return res.status(404).json({ error: 'Betting preference not found' });
      }
      
      res.json(preference);
    } catch (error) {
      console.error('Error updating betting preference:', error);
      res.status(500).json({ error: 'Failed to update betting preference' });
    }
  });

  // User Management Routes
  app.post('/api/users', async (req, res) => {
    try {
      const body = insertUserSchema.parse(req.body);
      const user = await storage.createUser(body);
      res.json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Subscription Management Routes
  app.post('/api/subscriptions', async (req, res) => {
    try {
      const body = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(body);
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(400).json({ error: 'Invalid subscription data' });
    }
  });

  app.get('/api/subscriptions', async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  });

  app.get('/api/subscriptions/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      
      res.json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  app.put('/api/subscriptions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const subscription = await storage.updateSubscription(id, updates);
      
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      
      res.json(subscription);
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  });

  // Payment Management Routes
  app.post('/api/payments', async (req, res) => {
    try {
      const body = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(body);
      res.json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(400).json({ error: 'Invalid payment data' });
    }
  });

  app.get('/api/payments', async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  app.get('/api/payments/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const payments = await storage.getPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching user payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  app.put('/api/payments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const payment = await storage.updatePayment(id, updates);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ error: 'Failed to update payment' });
    }
  });

  // Payment Method Routes
  app.post('/api/payment-methods', async (req, res) => {
    try {
      const body = insertPaymentMethodSchema.parse(req.body);
      const paymentMethod = await storage.createPaymentMethod(body);
      res.json(paymentMethod);
    } catch (error) {
      console.error('Error creating payment method:', error);
      res.status(400).json({ error: 'Invalid payment method data' });
    }
  });

  app.get('/api/payment-methods/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const paymentMethods = await storage.getPaymentMethodsByUserId(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
  });

  app.put('/api/payment-methods/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const paymentMethod = await storage.updatePaymentMethod(id, updates);
      
      if (!paymentMethod) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      res.json(paymentMethod);
    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({ error: 'Failed to update payment method' });
    }
  });

  app.delete('/api/payment-methods/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePaymentMethod(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      res.json({ message: 'Payment method deleted successfully' });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({ error: 'Failed to delete payment method' });
    }
  });

  // Billing Events Routes
  app.post('/api/billing-events', async (req, res) => {
    try {
      const body = insertBillingEventSchema.parse(req.body);
      const billingEvent = await storage.createBillingEvent(body);
      res.json(billingEvent);
    } catch (error) {
      console.error('Error creating billing event:', error);
      res.status(400).json({ error: 'Invalid billing event data' });
    }
  });

  app.get('/api/billing-events', async (req, res) => {
    try {
      const billingEvents = await storage.getBillingEvents();
      res.json(billingEvents);
    } catch (error) {
      console.error('Error fetching billing events:', error);
      res.status(500).json({ error: 'Failed to fetch billing events' });
    }
  });

  app.get('/api/billing-events/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const billingEvents = await storage.getBillingEventsByUserId(userId);
      res.json(billingEvents);
    } catch (error) {
      console.error('Error fetching user billing events:', error);
      res.status(500).json({ error: 'Failed to fetch billing events' });
    }
  });

  app.put('/api/billing-events/:id/process', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markBillingEventProcessed(id);
      res.json({ message: 'Billing event marked as processed' });
    } catch (error) {
      console.error('Error processing billing event:', error);
      res.status(500).json({ error: 'Failed to process billing event' });
    }
  });

  // Payment Service Routes (Checkout & Webhooks)
  app.post('/api/checkout/create-subscription', async (req, res) => {
    try {
      const { userId, planType, provider = 'stripe' } = req.body;
      
      if (!userId || !planType) {
        return res.status(400).json({ error: 'userId and planType are required' });
      }

      const result = await PaymentService.createSubscription(userId, planType, provider);
      res.json(result);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ 
        error: 'Failed to create subscription', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post('/api/checkout/create-payment', async (req, res) => {
    try {
      const { amount, currency = 'brl', metadata = {}, provider = 'stripe' } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: 'amount is required' });
      }

      const result = await PaymentService.createPayment(amount, currency, metadata, provider);
      res.json(result);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ 
        error: 'Failed to create payment', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post('/api/checkout/cancel-subscription', async (req, res) => {
    try {
      const { subscriptionId, provider = 'stripe' } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ error: 'subscriptionId is required' });
      }

      const result = await PaymentService.cancelSubscription(subscriptionId, provider);
      res.json({ message: 'Subscription canceled successfully', result });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ 
        error: 'Failed to cancel subscription', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Stripe Webhook endpoint
  app.post('/api/webhooks/stripe', async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      await PaymentService.handleWebhook(req.body, signature, 'stripe');
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing Stripe webhook:', error);
      res.status(400).json({ 
        error: 'Webhook processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Brazilian Gateway Webhook (future implementation)
  app.post('/api/webhooks/brazilian', async (req, res) => {
    try {
      await PaymentService.handleWebhook(req.body, undefined, 'brazilian');
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing Brazilian gateway webhook:', error);
      res.status(400).json({ 
        error: 'Webhook processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Admin statistics endpoint
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const users = await storage.getUsers();
      const results = await storage.getResults();
      
      // Calcular estatísticas
      const activeUsers = users.filter(user => user.isActive).length;
      const totalUsers = users.length;
      
      // Receita mensal estimada (baseada nos planos dos usuários ativos)
      const monthlyRevenue = users
        .filter(user => user.isActive)
        .reduce((total, user) => {
          const planPrices = { basico: 29.90, intermediario: 59.90, completo: 99.90 };
          return total + (planPrices[user.planType] || 0);
        }, 0);
      
      // Sessões hoje (resultados das últimas 24h)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessionsToday = results.filter(result => 
        new Date(result.timestamp) >= today
      ).length;
      
      // Taxa de conversão (usuários ativos vs total)
      const conversionRate = totalUsers > 0 ? (activeUsers / totalUsers * 100) : 0;
      
      const stats = {
        activeUsers: {
          value: activeUsers,
          total: totalUsers,
          change: '+12%', // Placeholder - poderia ser calculado comparando com período anterior
          trend: 'up'
        },
        monthlyRevenue: {
          value: monthlyRevenue,
          change: '+8%', // Placeholder
          trend: 'up'
        },
        sessionsToday: {
          value: sessionsToday,
          change: '+23%', // Placeholder  
          trend: 'up'
        },
        conversionRate: {
          value: conversionRate,
          change: '+2.1%', // Placeholder
          trend: 'up'
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
  });

  // Plan information endpoint
  app.get('/api/plans', async (req, res) => {
    try {
      // Import PLAN_CONFIG here to avoid circular dependency
      const { PLAN_CONFIG } = await import('@shared/schema');
      
      const plans = Object.entries(PLAN_CONFIG).map(([key, config]) => ({
        id: key,
        name: config.name,
        price: config.price,
        features: config.features,
        limits: config.limits
      }));
      
      res.json(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  });

  // AI Analysis endpoints
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { results, provider = 'openai' } = req.body;
      
      if (!results || !Array.isArray(results)) {
        return res.status(400).json({ error: 'Results array is required' });
      }

      if (results.length < 15) {
        return res.status(400).json({ error: 'Minimum 15 results required for AI analysis' });
      }

      // Convert results to sequence string
      const sequence = results.map(r => r.number).join(',');
      
      let analysis;
      if (provider === 'anthropic') {
        analysis = await AIServices.analyzeWithClaude(sequence, results);
      } else {
        analysis = await AIServices.analyzeWithOpenAI(sequence, results);
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error in AI analysis:', error);
      res.status(500).json({ error: 'AI analysis failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // WebSocket server
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);

        // Handle different message types
        switch (message.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          
          case 'subscribe':
            // Handle subscription logic
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              channel: message.channel 
            }));
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'welcome', 
        message: 'Connected to Roulette Analysis System' 
      }));
    }
  });

  return httpServer;
}