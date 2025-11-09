-- ============================================
-- FASE 1: SCHEMA COMPLETO + RLS POLICIES (CORRIGIDO)
-- ============================================

-- Criar ENUMS necessários
CREATE TYPE plan_type AS ENUM ('basico', 'intermediario', 'completo');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'canceled');
CREATE TYPE payment_method AS ENUM ('stripe_card', 'stripe_pix', 'mercado_pago', 'pagseguro', 'asaas', 'boleto');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- ============================================
-- TABELA: users (perfis de usuários)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  plan_type plan_type DEFAULT 'basico' NOT NULL,
  user_role user_role DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid()
      AND user_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage all users"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid()
      AND user_role = 'super_admin'
    )
  );

-- ============================================
-- TABELA: password_reset_tokens
-- ============================================
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: features
-- ============================================
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  display_name VARCHAR NOT NULL,
  description TEXT,
  plan_type plan_type NOT NULL,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Features are viewable by everyone"
  ON public.features FOR SELECT
  USING (true);

-- ============================================
-- TABELA: user_sessions
-- ============================================
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  session_name VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================
-- TABELA: roulette_results (corrigido com "column" entre aspas)
-- ============================================
CREATE TABLE public.roulette_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  color TEXT NOT NULL,
  dozen INTEGER,
  "column" INTEGER,
  half TEXT,
  parity TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  session_id VARCHAR NOT NULL,
  source TEXT DEFAULT 'manual' NOT NULL
);

CREATE INDEX idx_roulette_results_session ON public.roulette_results(session_id);
CREATE INDEX idx_roulette_results_timestamp ON public.roulette_results(timestamp DESC);

ALTER TABLE public.roulette_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view results for their sessions"
  ON public.roulette_results FOR SELECT
  USING (true);

CREATE POLICY "Users can create results"
  ON public.roulette_results FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: patterns
-- ============================================
CREATE TABLE public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence JSONB NOT NULL,
  type TEXT NOT NULL,
  outcomes JSONB NOT NULL,
  probability REAL NOT NULL,
  confidence REAL NOT NULL,
  total_occurrences INTEGER NOT NULL,
  success_count INTEGER NOT NULL,
  last_triggered TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patterns are viewable by authenticated users"
  ON public.patterns FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: strategies
-- ============================================
CREATE TABLE public.strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  numbers JSONB NOT NULL,
  max_attempts INTEGER DEFAULT 5,
  current_attempts INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  success_rate REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Strategies are viewable by authenticated users"
  ON public.strategies FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: alerts
-- ============================================
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alerts are viewable by authenticated users"
  ON public.alerts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: sessions
-- ============================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  total_spins INTEGER DEFAULT 0,
  patterns_detected INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions are viewable by authenticated users"
  ON public.sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: betting_preferences
-- ============================================
CREATE TABLE public.betting_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  description TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.betting_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Betting preferences are viewable by authenticated users"
  ON public.betting_preferences FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELAS DE PAGAMENTO
-- ============================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  plan_type plan_type NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  price_monthly REAL NOT NULL,
  currency VARCHAR DEFAULT 'BRL' NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id VARCHAR,
  mercado_pago_subscription_id VARCHAR,
  asaas_subscription_id VARCHAR,
  trial_days INTEGER DEFAULT 7,
  is_trial_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount REAL NOT NULL,
  currency VARCHAR DEFAULT 'BRL' NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  payment_method payment_method NOT NULL,
  stripe_payment_intent_id VARCHAR,
  mercado_pago_payment_id VARCHAR,
  asaas_payment_id VARCHAR,
  description TEXT,
  metadata JSONB,
  paid_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type payment_method NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  card_last4 VARCHAR,
  card_brand VARCHAR,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  stripe_payment_method_id VARCHAR,
  mercado_pago_card_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE TABLE public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id),
  payment_id UUID REFERENCES public.payments(id),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  data JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TRIGGER: Auto-criar perfil ao registrar usuário
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, name, phone, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'planType')::plan_type, 'basico')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();