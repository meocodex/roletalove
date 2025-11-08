import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sistema de Planos SaaS
export const planTypeEnum = pgEnum('plan_type', ['basico', 'intermediario', 'completo']);

// Sistema de Pagamentos
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing'
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', 'paid', 'failed', 'refunded', 'canceled'
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'stripe_card', 'stripe_pix', 'mercado_pago', 'pagseguro', 'asaas', 'boleto'
]);

// Sistema de Roles de Usuário
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'super_admin']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  planType: planTypeEnum("plan_type").default('basico').notNull(),
  userRole: userRoleEnum("user_role").default('user').notNull(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Controle de Features por Plano
export const features = pgTable("features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  planType: planTypeEnum("plan_type").notNull(),
  isActive: boolean("is_active").default(true),
});

// Sessões de análise por usuário
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionName: varchar("session_name"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rouletteResults = pgTable("roulette_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: integer("number").notNull(),
  color: text("color").notNull(), // 'red', 'black', 'green'
  dozen: integer("dozen"), // 1, 2, 3
  column: integer("column"), // 1, 2, 3
  half: text("half"), // 'low' (1-18), 'high' (19-36)
  parity: text("parity"), // 'even', 'odd', null (for 0)
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: varchar("session_id").notNull(),
  source: text("source").notNull().default("manual") // 'manual', 'api', 'websocket'
});

export const patterns = pgTable("patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequence: json("sequence").notNull(), // Array of numbers or pattern identifiers
  type: text("type").notNull(), // 'exact', 'color', 'dozen', 'mixed', 'positional'
  outcomes: json("outcomes").notNull(), // Map of results to frequency
  probability: real("probability").notNull(),
  confidence: real("confidence").notNull(),
  totalOccurrences: integer("total_occurrences").notNull(),
  successCount: integer("success_count").notNull(),
  lastTriggered: timestamp("last_triggered"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const strategies = pgTable("strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'neighbors', 'straight_up'
  numbers: json("numbers").notNull(), // Array of numbers to bet on
  maxAttempts: integer("max_attempts").default(5),
  currentAttempts: integer("current_attempts").default(0),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  successRate: real("success_rate").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'pattern_detected', 'strategy_hit', 'system_info'
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'info', 'warning', 'success', 'error'
  data: json("data"), // Additional context data
  read: boolean("read").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  totalSpins: integer("total_spins").default(0),
  patternsDetected: integer("patterns_detected").default(0),
  successRate: real("success_rate").default(0),
  isActive: boolean("is_active").default(true)
});

export const bettingPreferences = pgTable("betting_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'straight_up', 'neighbors', 'dozens', 'columns', 'colors', 'parity'
  enabled: boolean("enabled").default(true),
  description: text("description"),
  priority: integer("priority").default(1), // 1-5, higher = more priority
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Tabelas do Sistema de Pagamentos
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planType: planTypeEnum("plan_type").notNull(),
  status: subscriptionStatusEnum("status").default('active').notNull(),
  priceMonthly: real("price_monthly").notNull(), // Preço mensal em reais
  currency: varchar("currency").default('BRL').notNull(),
  
  // Datas importantes
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  canceledAt: timestamp("canceled_at"),
  
  // Integração com gateways
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  mercadoPagoSubscriptionId: varchar("mercado_pago_subscription_id"),
  asaasSubscriptionId: varchar("asaas_subscription_id"),
  
  // Controle interno
  trialDays: integer("trial_days").default(7),
  isTrialUsed: boolean("is_trial_used").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Detalhes do pagamento
  amount: real("amount").notNull(), // Valor em reais
  currency: varchar("currency").default('BRL').notNull(),
  status: paymentStatusEnum("status").default('pending').notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  
  // IDs dos gateways
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  mercadoPagoPaymentId: varchar("mercado_pago_payment_id"),
  asaasPaymentId: varchar("asaas_payment_id"),
  
  // Metadados
  description: text("description"),
  metadata: json("metadata"), // Dados adicionais do gateway
  
  // Controle temporal
  paidAt: timestamp("paid_at"),
  failedAt: timestamp("failed_at"),
  refundedAt: timestamp("refunded_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  type: paymentMethodEnum("type").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  
  // Dados do cartão (últimos 4 dígitos, bandeira)
  cardLast4: varchar("card_last4"),
  cardBrand: varchar("card_brand"), // visa, mastercard, etc
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  
  // IDs dos gateways
  stripePaymentMethodId: varchar("stripe_payment_method_id"),
  mercadoPagoCardId: varchar("mercado_pago_card_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const billingEvents = pgTable("billing_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  paymentId: varchar("payment_id").references(() => payments.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Tipo do evento
  eventType: text("event_type").notNull(), // 'subscription_created', 'payment_success', 'payment_failed', etc
  source: text("source").notNull(), // 'stripe', 'mercado_pago', 'asaas', 'manual'
  
  // Dados do evento
  data: json("data"), // Payload completo do webhook
  processed: boolean("processed").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schemas
export const insertRouletteResultSchema = createInsertSchema(rouletteResults).omit({
  id: true,
  timestamp: true,
  color: true,
  dozen: true,
  column: true,
  half: true,
  parity: true
});

export const insertPatternSchema = createInsertSchema(patterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startTime: true
});

export const insertBettingPreferenceSchema = createInsertSchema(bettingPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Schema de inserção para usuários
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Schema para password reset
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token obrigatório"),
  newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// Schemas de inserção para pagamentos
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBillingEventSchema = createInsertSchema(billingEvents).omit({
  id: true,
  createdAt: true
});

// Types
export type RouletteResult = typeof rouletteResults.$inferSelect;
export type InsertRouletteResult = z.infer<typeof insertRouletteResultSchema>;

export type Pattern = typeof patterns.$inferSelect;
export type InsertPattern = z.infer<typeof insertPatternSchema>;

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type BettingPreference = typeof bettingPreferences.$inferSelect;
export type InsertBettingPreference = z.infer<typeof insertBettingPreferenceSchema>;

// Tipos do sistema de pagamentos
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type BillingEvent = typeof billingEvents.$inferSelect;
export type InsertBillingEvent = z.infer<typeof insertBillingEventSchema>;

// Tipos auxiliares
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';
export type PaymentMethodType = 'stripe_card' | 'stripe_pix' | 'mercado_pago' | 'pagseguro' | 'asaas' | 'boleto';

// Novos tipos para sistema SaaS
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Feature = typeof features.$inferSelect;
export type InsertFeature = typeof features.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

// Tipos de planos
export type PlanType = 'basico' | 'intermediario' | 'completo';

// Tipos de roles de usuário
export type UserRole = 'user' | 'admin' | 'super_admin';

// Configuração de planos com preços (em reais) - NOVO SISTEMA
export const PLAN_CONFIG = {
  basico: {
    name: 'Plano Básico',
    price: 29.90,
    description: 'Funcionalidades básicas para iniciantes',
    features: [
      'Mesa de roleta visual',
      'Entrada manual de números',
      'Histórico de resultados recentes (últimos 50)',
      'Estatísticas básicas (cores, dúzias, colunas)',
      'Análise de padrões simples'
    ],
    strategies: [
      'basic_patterns',        // Padrões básicos de cores
      'color_analysis',        // Análise de sequências de cores
      'simple_recommendations' // Recomendações simples
    ],
    maxStrategies: 3,
    aiAnalysis: false,
    limits: {
      sessionsPerMonth: 10,
      resultsPerSession: 100
    }
  },
  intermediario: {
    name: 'Plano Intermediário',
    price: 59.90,
    description: 'Análises avançadas e múltiplas estratégias',
    features: [
      'Tudo do Plano Básico',
      'Análise de padrões avançados (dúzias, colunas)',
      'Estratégias tradicionais (Martingale, Fibonacci)',
      'Machine Learning Analyzer (predições inteligentes)',
      'Gráficos básicos de tendências',
      'Números quentes e frios',
      'Alertas de padrões detectados',
      'Histórico estendido (últimos 200 resultados)'
    ],
    strategies: [
      'basic_patterns',
      'color_analysis',
      'simple_recommendations',
      'dozen_patterns',        // Análise de dúzias
      'column_patterns',       // Análise de colunas
      'hot_cold_numbers',      // Números quentes/frios
      'neighbor_strategies',   // Estratégias de vizinhos
      'ml_predictions',        // Predições ML
      'pattern_alerts'         // Alertas de padrões
    ],
    maxStrategies: 9,
    aiAnalysis: false,
    limits: {
      sessionsPerMonth: 50,
      resultsPerSession: 500
    }
  },
  completo: {
    name: 'Plano Completo',
    price: 99.90,
    description: 'Acesso completo com IA externa e personalização',
    features: [
      'Tudo dos Planos Anteriores',
      'Análise com IA Externa (ChatGPT-4)',
      'Análise com IA Externa (Claude 3.5)',
      'Estratégias combinadas avançadas',
      'Gráficos avançados e interativos',
      'Dashboard customizável',
      'Exportação de dados (CSV, JSON)',
      'Histórico ilimitado de sessões',
      'Algoritmos personalizados',
      'Análise múltiplas mesas simultâneas',
      'Engine de probabilidades avançado',
      'Suporte prioritário'
    ],
    strategies: [
      // Todas as estratégias dos planos anteriores +
      'basic_patterns',
      'color_analysis',
      'simple_recommendations',
      'dozen_patterns',
      'column_patterns',
      'hot_cold_numbers',
      'neighbor_strategies',
      'ml_predictions',
      'pattern_alerts',
      // Estratégias exclusivas do plano completo:
      'ai_external_gpt',       // Análise GPT-4
      'ai_external_claude',    // Análise Claude-4
      'combined_strategies',   // Estratégias combinadas
      'custom_algorithms',     // Algoritmos personalizados
      'advanced_predictions',  // Predições avançadas
      'multi_table_analysis',  // Análise múltiplas mesas
      'probability_engine'     // Engine de probabilidades
    ],
    maxStrategies: -1, // Ilimitado
    aiAnalysis: true,
    limits: {
      sessionsPerMonth: -1,   // Ilimitado
      resultsPerSession: -1   // Ilimitado
    }
  }
} as const;

// Manter compatibilidade com código existente
export const PLAN_FEATURES = {
  basico: PLAN_CONFIG.basico.features,
  intermediario: PLAN_CONFIG.intermediario.features,
  completo: PLAN_CONFIG.completo.features
} as const;

// Funcionalidades administrativas por role
export const ADMIN_FEATURES = {
  admin: [
    'user_management',
    'system_stats',
    'feature_control',
    'activity_logs',
    'subscription_management'
  ],
  super_admin: [
    'user_management',
    'system_stats', 
    'feature_control',
    'activity_logs',
    'subscription_management',
    'system_config',
    'billing_management',
    'payment_config',
    'advanced_analytics',
    'financial_reports'
  ]
} as const;
