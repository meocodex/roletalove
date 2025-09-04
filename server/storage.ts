import { 
  type RouletteResult, type InsertRouletteResult, 
  type Pattern, type InsertPattern, 
  type Strategy, type InsertStrategy, 
  type Alert, type InsertAlert, 
  type Session, type InsertSession, 
  type BettingPreference, type InsertBettingPreference,
  type User, type InsertUser,
  type Subscription, type InsertSubscription,
  type Payment, type InsertPayment,
  type PaymentMethod, type InsertPaymentMethod,
  type BillingEvent, type InsertBillingEvent
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Roulette Results
  addResult(result: InsertRouletteResult): Promise<RouletteResult>;
  getResults(sessionId?: string, limit?: number): Promise<RouletteResult[]>;
  getRecentResults(limit: number): Promise<RouletteResult[]>;
  
  // Patterns
  savePattern(pattern: InsertPattern): Promise<Pattern>;
  getPatterns(): Promise<Pattern[]>;
  getActivePatterns(): Promise<Pattern[]>;
  getPatternById(id: string): Promise<Pattern | undefined>;
  updatePattern(id: string, updates: Partial<Pattern>): Promise<Pattern | undefined>;
  
  // Strategies
  saveStrategy(strategy: InsertStrategy): Promise<Strategy>;
  getStrategies(): Promise<Strategy[]>;
  getActiveStrategies(): Promise<Strategy[]>;
  updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | undefined>;
  
  // Alerts
  addAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(): Promise<Alert[]>;
  getRecentAlerts(limit: number): Promise<Alert[]>;
  markAlertAsRead(id: string): Promise<void>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getCurrentSession(): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
  
  // Betting Preferences
  getBettingPreferences(): Promise<BettingPreference[]>;
  updateBettingPreference(id: string, updates: Partial<BettingPreference>): Promise<BettingPreference | undefined>;
  saveBettingPreference(preference: InsertBettingPreference): Promise<BettingPreference>;
  
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Subscriptions
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionById(id: string): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  getSubscriptions(): Promise<Subscription[]>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  getPaymentsBySubscriptionId(subscriptionId: string): Promise<Payment[]>;
  getPayments(): Promise<Payment[]>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
  
  // Payment Methods
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  getPaymentMethodsByUserId(userId: string): Promise<PaymentMethod[]>;
  getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | undefined>;
  updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: string): Promise<boolean>;
  
  // Billing Events
  createBillingEvent(event: InsertBillingEvent): Promise<BillingEvent>;
  getBillingEvents(): Promise<BillingEvent[]>;
  getBillingEventsByUserId(userId: string): Promise<BillingEvent[]>;
  markBillingEventProcessed(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private results: Map<string, RouletteResult> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private strategies: Map<string, Strategy> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private sessions: Map<string, Session> = new Map();
  private bettingPreferences: Map<string, BettingPreference> = new Map();
  private users: Map<string, User> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private payments: Map<string, Payment> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private billingEvents: Map<string, BillingEvent> = new Map();
  private currentSessionId: string | null = null;

  constructor() {
    // Initialize with default data
    this.initializeDefaultUsers();
    this.initializeDefaultSession();
    this.initializeDefaultStrategies();
    this.initializeDefaultBettingPreferences();
  }

  private async initializeDefaultUsers() {
    // Usuário padrão para desenvolvimento
    const defaultUser: User = {
      id: 'user-default-id',
      email: 'usuario@exemplo.com',
      name: 'Usuário Teste',
      planType: 'basico',
      userRole: 'user',
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Usuário admin para testes
    const adminUser: User = {
      id: 'admin-default-id',
      email: 'admin@exemplo.com',
      name: 'Admin Teste',
      planType: 'completo',
      userRole: 'admin',
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(defaultUser.id, defaultUser);
    this.users.set(adminUser.id, adminUser);
    
    // Criar assinatura padrão
    const defaultSubscription: Subscription = {
      id: 'sub-default-id',
      userId: defaultUser.id,
      planType: 'basico',
      status: 'active',
      priceMonthly: 29.90,
      currency: 'BRL',
      startDate: new Date(),
      endDate: null,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      canceledAt: null,
      stripeSubscriptionId: null,
      mercadoPagoSubscriptionId: null,
      asaasSubscriptionId: null,
      trialDays: 7,
      isTrialUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.subscriptions.set(defaultSubscription.id, defaultSubscription);
  }

  private async initializeDefaultSession() {
    const session: Session = {
      id: randomUUID(),
      name: "Sessão Principal",
      startTime: new Date(),
      endTime: null,
      totalSpins: 0,
      patternsDetected: 0,
      successRate: 0,
      isActive: true
    };
    this.sessions.set(session.id, session);
    this.currentSessionId = session.id;
  }

  private async initializeDefaultStrategies() {
    // Straight-up numbers strategy (max 7 numbers as requested)
    const straightUpStrategy: Strategy = {
      id: randomUUID(),
      name: "Números Plenos",
      type: "straight_up",
      numbers: [17, 32, 19, 4, 21, 7, 14], // Max 7 numbers
      maxAttempts: 5,
      currentAttempts: 0,
      isActive: true,
      lastUsed: null,
      successRate: 0,
      createdAt: new Date()
    };

    // Neighbors strategy (up to 21 numbers as requested)
    const neighborsStrategy: Strategy = {
      id: randomUUID(),
      name: "Vizinhos do 17",
      type: "neighbors",
      numbers: [2, 25, 4, 21, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20], // 21 numbers
      maxAttempts: 5, // Max 5 attempts as requested
      currentAttempts: 0,
      isActive: false,
      lastUsed: null,
      successRate: 0,
      createdAt: new Date()
    };

    this.strategies.set(straightUpStrategy.id, straightUpStrategy);
    this.strategies.set(neighborsStrategy.id, neighborsStrategy);
  }

  private async initializeDefaultBettingPreferences() {
    const preferences: BettingPreference[] = [
      {
        id: randomUUID(),
        name: "Números Plenos",
        type: "straight_up",
        enabled: true,
        description: "Apostas em números únicos (0-36) com pagamento 35:1",
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Vizinhos",
        type: "neighbors",
        enabled: true,
        description: "Apostas em grupos de números vizinhos na roda",
        priority: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Dúzias",
        type: "dozens",
        enabled: true,
        description: "Apostas nas dúzias (1-12, 13-24, 25-36) com pagamento 2:1",
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Colunas",
        type: "columns",
        enabled: false,
        description: "Apostas nas colunas verticais com pagamento 2:1",
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Cores",
        type: "colors",
        enabled: false,
        description: "Apostas em vermelho/preto com pagamento 1:1",
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Par/Ímpar", 
        type: "parity",
        enabled: false,
        description: "Apostas em números pares/ímpares com pagamento 1:1",
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    preferences.forEach(pref => {
      this.bettingPreferences.set(pref.id, pref);
    });
  }

  async addResult(insertResult: InsertRouletteResult): Promise<RouletteResult> {
    const id = randomUUID();
    
    // Calculate number properties
    const numberProps = {
      color: insertResult.number === 0 ? 'green' : 
             [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(insertResult.number) ? 'red' : 'black',
      dozen: insertResult.number === 0 ? null : Math.ceil(insertResult.number / 12),
      column: insertResult.number === 0 ? null : ((insertResult.number - 1) % 3) + 1,
      half: insertResult.number === 0 ? null : insertResult.number <= 18 ? 'low' : 'high',
      parity: insertResult.number === 0 ? null : insertResult.number % 2 === 0 ? 'even' : 'odd'
    };
    
    const result: RouletteResult = {
      ...insertResult,
      ...numberProps,
      id,
      source: insertResult.source || 'manual',
      timestamp: new Date()
    };
    
    this.results.set(id, result);
    
    // Update current session
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session && session.totalSpins !== null) {
        session.totalSpins += 1;
        session.patternsDetected = (session.patternsDetected || 0) + 1;
        this.sessions.set(this.currentSessionId, session);
      }
    }
    
    return result;
  }

  async getResults(sessionId?: string, limit = 100): Promise<RouletteResult[]> {
    const results = Array.from(this.results.values());
    
    if (sessionId) {
      return results
        .filter(r => r.sessionId === sessionId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    }
    
    return results
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRecentResults(limit: number): Promise<RouletteResult[]> {
    return Array.from(this.results.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async savePattern(insertPattern: InsertPattern): Promise<Pattern> {
    const id = randomUUID();
    const pattern: Pattern = {
      ...insertPattern,
      id,
      isActive: insertPattern.isActive ?? true,
      lastTriggered: insertPattern.lastTriggered ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.patterns.set(id, pattern);
    return pattern;
  }

  async getPatterns(): Promise<Pattern[]> {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.probability - a.probability);
  }

  async getActivePatterns(): Promise<Pattern[]> {
    return Array.from(this.patterns.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.probability - a.probability);
  }

  async getPatternById(id: string): Promise<Pattern | undefined> {
    return this.patterns.get(id);
  }

  async updatePattern(id: string, updates: Partial<Pattern>): Promise<Pattern | undefined> {
    const pattern = this.patterns.get(id);
    if (!pattern) return undefined;
    
    const updatedPattern = { ...pattern, ...updates, updatedAt: new Date() };
    this.patterns.set(id, updatedPattern);
    return updatedPattern;
  }

  async saveStrategy(insertStrategy: InsertStrategy): Promise<Strategy> {
    const id = randomUUID();
    const strategy: Strategy = {
      ...insertStrategy,
      id,
      isActive: insertStrategy.isActive ?? true,
      maxAttempts: insertStrategy.maxAttempts ?? 5,
      currentAttempts: insertStrategy.currentAttempts ?? 0,
      lastUsed: insertStrategy.lastUsed ?? null,
      successRate: insertStrategy.successRate ?? null,
      createdAt: new Date()
    };
    
    this.strategies.set(id, strategy);
    return strategy;
  }

  async getStrategies(): Promise<Strategy[]> {
    return Array.from(this.strategies.values());
  }

  async getActiveStrategies(): Promise<Strategy[]> {
    return Array.from(this.strategies.values())
      .filter(s => s.isActive);
  }

  async updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | undefined> {
    const strategy = this.strategies.get(id);
    if (!strategy) return undefined;
    
    const updatedStrategy = { ...strategy, ...updates };
    this.strategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  async addAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      data: insertAlert.data || {},
      read: insertAlert.read ?? null,
      timestamp: new Date()
    };
    
    this.alerts.set(id, alert);
    return alert;
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentAlerts(limit: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async markAlertAsRead(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.read = true;
      this.alerts.set(id, alert);
    }
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      name: insertSession.name ?? null,
      isActive: insertSession.isActive ?? true,
      successRate: insertSession.successRate ?? null,
      endTime: insertSession.endTime ?? null,
      totalSpins: insertSession.totalSpins ?? 0,
      patternsDetected: insertSession.patternsDetected ?? 0,
      startTime: new Date()
    };
    
    this.sessions.set(id, session);
    this.currentSessionId = id;
    return session;
  }

  async getCurrentSession(): Promise<Session | undefined> {
    if (!this.currentSessionId) return undefined;
    return this.sessions.get(this.currentSessionId);
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getBettingPreferences(): Promise<BettingPreference[]> {
    return Array.from(this.bettingPreferences.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async updateBettingPreference(id: string, updates: Partial<BettingPreference>): Promise<BettingPreference | undefined> {
    const preference = this.bettingPreferences.get(id);
    if (!preference) return undefined;
    
    const updatedPreference = { ...preference, ...updates, updatedAt: new Date() };
    this.bettingPreferences.set(id, updatedPreference);
    return updatedPreference;
  }

  async saveBettingPreference(insertPreference: InsertBettingPreference): Promise<BettingPreference> {
    const id = randomUUID();
    const preference: BettingPreference = {
      ...insertPreference,
      id,
      enabled: insertPreference.enabled ?? true,
      description: insertPreference.description ?? null,
      priority: insertPreference.priority ?? 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.bettingPreferences.set(id, preference);
    return preference;
  }
  
  // User management methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      planType: insertUser.planType ?? 'basico',
      userRole: insertUser.userRole ?? 'user',
      isActive: insertUser.isActive ?? true,
      lastLoginAt: insertUser.lastLoginAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Subscription management methods
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      status: insertSubscription.status ?? 'active',
      currency: insertSubscription.currency ?? 'BRL',
      startDate: insertSubscription.startDate ?? new Date(),
      endDate: insertSubscription.endDate ?? null,
      nextBillingDate: insertSubscription.nextBillingDate ?? null,
      canceledAt: insertSubscription.canceledAt ?? null,
      stripeSubscriptionId: insertSubscription.stripeSubscriptionId ?? null,
      mercadoPagoSubscriptionId: insertSubscription.mercadoPagoSubscriptionId ?? null,
      asaasSubscriptionId: insertSubscription.asaasSubscriptionId ?? null,
      trialDays: insertSubscription.trialDays ?? 7,
      isTrialUsed: insertSubscription.isTrialUsed ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  async getSubscriptionById(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values())
      .find(s => s.userId === userId && s.status === 'active');
  }
  
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
  
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, ...updates, updatedAt: new Date() };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // Payment management methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      currency: insertPayment.currency ?? 'BRL',
      status: insertPayment.status ?? 'pending',
      description: insertPayment.description ?? null,
      metadata: insertPayment.metadata ?? null,
      stripePaymentIntentId: insertPayment.stripePaymentIntentId ?? null,
      mercadoPagoPaymentId: insertPayment.mercadoPagoPaymentId ?? null,
      asaasPaymentId: insertPayment.asaasPaymentId ?? null,
      paidAt: insertPayment.paidAt ?? null,
      failedAt: insertPayment.failedAt ?? null,
      refundedAt: insertPayment.refundedAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.payments.set(id, payment);
    return payment;
  }
  
  async getPaymentById(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
  
  async getPaymentsBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(p => p.subscriptionId === subscriptionId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
  
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
  
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Payment Method management methods
  async createPaymentMethod(insertPaymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = randomUUID();
    const paymentMethod: PaymentMethod = {
      ...insertPaymentMethod,
      id,
      isDefault: insertPaymentMethod.isDefault ?? false,
      isActive: insertPaymentMethod.isActive ?? true,
      cardLast4: insertPaymentMethod.cardLast4 ?? null,
      cardBrand: insertPaymentMethod.cardBrand ?? null,
      cardExpMonth: insertPaymentMethod.cardExpMonth ?? null,
      cardExpYear: insertPaymentMethod.cardExpYear ?? null,
      stripePaymentMethodId: insertPaymentMethod.stripePaymentMethodId ?? null,
      mercadoPagoCardId: insertPaymentMethod.mercadoPagoCardId ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.paymentMethods.set(id, paymentMethod);
    return paymentMethod;
  }
  
  async getPaymentMethodsByUserId(userId: string): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values())
      .filter(pm => pm.userId === userId && pm.isActive)
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }
  
  async getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | undefined> {
    return Array.from(this.paymentMethods.values())
      .find(pm => pm.userId === userId && pm.isDefault && pm.isActive);
  }
  
  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const paymentMethod = this.paymentMethods.get(id);
    if (!paymentMethod) return undefined;
    
    const updatedPaymentMethod = { ...paymentMethod, ...updates, updatedAt: new Date() };
    this.paymentMethods.set(id, updatedPaymentMethod);
    return updatedPaymentMethod;
  }
  
  async deletePaymentMethod(id: string): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }
  
  // Billing Event management methods
  async createBillingEvent(insertBillingEvent: InsertBillingEvent): Promise<BillingEvent> {
    const id = randomUUID();
    const billingEvent: BillingEvent = {
      ...insertBillingEvent,
      id,
      subscriptionId: insertBillingEvent.subscriptionId ?? null,
      paymentId: insertBillingEvent.paymentId ?? null,
      data: insertBillingEvent.data ?? {},
      processed: insertBillingEvent.processed ?? false,
      createdAt: new Date()
    };
    
    this.billingEvents.set(id, billingEvent);
    return billingEvent;
  }
  
  async getBillingEvents(): Promise<BillingEvent[]> {
    return Array.from(this.billingEvents.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
  
  async getBillingEventsByUserId(userId: string): Promise<BillingEvent[]> {
    return Array.from(this.billingEvents.values())
      .filter(be => be.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
  
  async markBillingEventProcessed(id: string): Promise<void> {
    const billingEvent = this.billingEvents.get(id);
    if (billingEvent) {
      billingEvent.processed = true;
      this.billingEvents.set(id, billingEvent);
    }
  }
}

export const storage = new MemStorage();
