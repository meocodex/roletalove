import { supabase } from '@/integrations/supabase/client';

/**
 * Get active subscription for a user
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get all subscriptions for a user
 */
export async function getAllUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get pending payments for a user
 */
export async function getPendingPayments(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, subscriptions(*)')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get all payments for a user
 */
export async function getUserPayments(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, subscriptions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Check if user has access to the system
 * Returns access status, trial info, and subscription details
 */
export async function checkSubscriptionAccess(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      hasAccess: false,
      daysLeft: 0,
      trialActive: false,
      status: 'no_subscription' as const,
      message: 'Nenhuma assinatura encontrada'
    };
  }

  const now = new Date();
  const startDate = new Date(subscription.start_date);
  const trialEndDate = new Date(startDate);
  trialEndDate.setDate(trialEndDate.getDate() + (subscription.trial_days || 0));

  const isInTrialPeriod = now < trialEndDate && !subscription.is_trial_used;
  const daysLeftInTrial = isInTrialPeriod 
    ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // User has access if:
  // 1. They're in trial period, OR
  // 2. Their subscription is active (paid)
  const hasAccess = isInTrialPeriod || subscription.status === 'active';

  return {
    hasAccess,
    daysLeft: daysLeftInTrial,
    trialActive: isInTrialPeriod,
    status: subscription.status,
    planType: subscription.plan_type,
    nextBillingDate: subscription.next_billing_date,
    message: hasAccess 
      ? (isInTrialPeriod ? `${daysLeftInTrial} dias restantes no trial` : 'Assinatura ativa')
      : 'Acesso expirado'
  };
}

/**
 * Get billing events for a user
 */
export async function getUserBillingEvents(userId: string) {
  const { data, error } = await supabase
    .from('billing_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*, subscriptions(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Update user data
 */
export async function updateUser(userId: string, updates: {
  name?: string;
  email?: string;
  phone?: string;
  plan_type?: string;
  user_role?: string;
  is_active?: boolean;
}) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: {
  user_id: string;
  plan_type: string;
  price_monthly: number;
  trial_days?: number;
  status?: string;
}) {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      ...data,
      status: data.status || 'trialing',
      start_date: new Date().toISOString(),
      next_billing_date: new Date(Date.now() + (data.trial_days || 7) * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return subscription;
}
