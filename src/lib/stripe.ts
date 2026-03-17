import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})

// ============================================
// PRICING CONFIGURATION
// ============================================

// Pricing plans with Stripe Price IDs
// IMPORTANT: Replace these with your actual Stripe Price IDs from your Stripe Dashboard
// Go to: https://dashboard.stripe.com/products
export const PRICING_PLANS: Record<string, {
  id: string
  name: string
  description: string
  price: number
  priceId: string | null
  currency: string
  interval: string | null
  features: string[]
  limitations: string[]
  cta: string
  popular: boolean
}> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    description: 'Pour découvrir CareCircle',
    price: 0,
    priceId: null, // Free plan doesn't need a Stripe Price ID
    currency: 'EUR',
    interval: null,
    features: [
      'Assistant IA Cleo (limité à 10 messages/jour)',
      'Calendrier médical basique',
      'Suivi de 1 personne aidée',
      'Accès à la communauté',
      'Ressources éducatives',
    ],
    limitations: [
      '10 messages/jour avec Cleo',
      '1 personne aidée',
      'Export limité',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Pour les aidants au quotidien',
    price: 9.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
    currency: 'EUR',
    interval: 'month',
    features: [
      'Assistant IA Cleo illimité',
      'Calendrier médical avancé avec rappels',
      'Suivi de 5 personnes aidées',
      'Journal de santé détaillé',
      'Export PDF des données médicales',
      'Alertes et notifications intelligentes',
      'Accès prioritaire aux webinaires',
      'Support par email',
    ],
    limitations: [],
    cta: 'Essayer 14 jours gratuit',
    popular: true,
  },
  family: {
    id: 'family',
    name: 'Famille',
    description: 'Pour partager l\'aidance en famille',
    price: 19.99,
    priceId: process.env.STRIPE_FAMILY_PRICE_ID || 'price_family_monthly',
    currency: 'EUR',
    interval: 'month',
    features: [
      'Tout Premium inclus',
      'Comptes familiales (jusqu\'à 5)',
      'Coordination partagée des soins',
      'Suivi illimité de personnes aidées',
      'Historique médical complet',
      'Vidéos avec professionnels',
      'Ligne d\'écoute prioritaire 24/7',
      'Support téléphonique dédié',
      'Accompagnement personnalisé',
    ],
    limitations: [],
    cta: 'Choisir Famille',
    popular: false,
  },
} as const

export type PlanId = keyof typeof PRICING_PLANS
export type Plan = typeof PRICING_PLANS[PlanId]

// ============================================
// SUBSCRIPTION STATUSES
// ============================================

export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid'

export interface UserSubscription {
  id: string
  planId: PlanId
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPlanByPriceId(priceId: string): Plan | null {
  for (const plan of Object.values(PRICING_PLANS)) {
    if (plan.priceId === priceId) {
      return plan
    }
  }
  return null
}

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return ['active', 'trialing'].includes(status)
}

export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(price)
}

// ============================================
// STRIPE CHECKOUT SESSION
// ============================================

export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  priceId: string
  customerId?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    ...(customerId && { customer: customerId }),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      trial_period_days: 14, // 14 jours d'essai gratuit
      metadata,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
  })

  return session
}

// ============================================
// CUSTOMER PORTAL
// ============================================

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
