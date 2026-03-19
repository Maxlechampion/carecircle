'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, X, Sparkles, Zap, Crown, Heart, 
  HelpCircle, ChevronDown, Shield, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PRICING_PLANS, PlanId, formatPrice } from '@/lib/stripe'
import { useSubscription } from '@/lib/subscription-context'

// ============================================
// PRICING PAGE COMPONENT
// ============================================

interface PricingPageProps {
  onSelectPlan?: (planId: PlanId) => void
  showAnnualToggle?: boolean
  compact?: boolean
}

export function PricingPage({ onSelectPlan, showAnnualToggle = true, compact = false }: PricingPageProps) {
  const [isAnnual, setIsAnnual] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [mounted, setMounted] = useState(false)
  const { plan: currentPlan, selectPlan, isActive } = useSubscription()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSelectPlan = async (planId: PlanId) => {
    setLoadingPlan(planId)
    try {
      if (onSelectPlan) {
        onSelectPlan(planId)
      } else {
        await selectPlan(planId)
      }
    } catch (error) {
      console.error('Failed to select plan:', error)
    } finally {
      setLoadingPlan(null)
    }
  }

  const getAnnualPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 * 0.8
  }

  const getAnnualSavings = (monthlyPrice: number) => {
    return monthlyPrice * 12 - getAnnualPrice(monthlyPrice)
  }

  // Don't render dynamic content until mounted
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-teal-100 text-teal-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Tarifs transparents
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Choisissez le plan adapté à vos besoins
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tous les plans incluent un essai gratuit de 14 jours. Annulez à tout moment.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-slate-200 animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2 w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-teal-100 text-teal-700">
          <Sparkles className="w-3 h-3 mr-1" />
          Tarifs transparents
        </Badge>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Choisissez le plan adapté à vos besoins
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Tous les plans incluent un essai gratuit de 14 jours. Annulez à tout moment.
        </p>
      </div>

      {/* Annual Toggle */}
      {showAnnualToggle && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <Label className={cn('text-sm', !isAnnual && 'text-slate-900 font-medium')}>
            Mensuel
          </Label>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-teal-600"
          />
          <Label className={cn('text-sm', isAnnual && 'text-slate-900 font-medium')}>
            Annuel
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-xs">
              -20%
            </Badge>
          </Label>
        </div>
      )}

      {/* Plans Grid */}
      <div className={cn(
        'grid gap-6',
        compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'
      )}>
        {Object.entries(PRICING_PLANS).map(([planId, plan]) => {
          const isCurrentPlan = currentPlan === planId
          const isLoading = loadingPlan === planId
          const price = isAnnual && plan.price > 0 
            ? getAnnualPrice(plan.price) / 12 
            : plan.price
          const originalPrice = plan.price

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={cn(
                  'relative h-full transition-all duration-300',
                  plan.popular 
                    ? 'border-teal-500 shadow-lg shadow-teal-200/50 ring-2 ring-teal-500' 
                    : 'border-slate-200 hover:border-teal-300 hover:shadow-md',
                  isCurrentPlan && 'ring-2 ring-green-500 border-green-500'
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 px-4">
                      <Zap className="w-3 h-3 mr-1" />
                      Le plus populaire
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white border-0">
                      <Check className="w-3 h-3 mr-1" />
                      Actuel
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3',
                    planId === 'free' && 'bg-slate-100',
                    planId === 'premium' && 'bg-teal-100',
                    planId === 'family' && 'bg-purple-100'
                  )}>
                    {planId === 'free' && <Heart className="w-6 h-6 text-slate-600" />}
                    {planId === 'premium' && <Zap className="w-6 h-6 text-teal-600" />}
                    {planId === 'family' && <Crown className="w-6 h-6 text-purple-600" />}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-4">
                  {/* Price */}
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-slate-900">Gratuit</div>
                    ) : (
                      <div className="flex items-end justify-center gap-1">
                        {isAnnual && originalPrice > price && (
                          <span className="text-lg text-slate-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                        <span className="text-4xl font-bold text-slate-900">
                          {formatPrice(price)}
                        </span>
                        <span className="text-slate-500 mb-1">/mois</span>
                      </div>
                    )}
                    {isAnnual && plan.price > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Économisez {formatPrice(getAnnualSavings(plan.price))}/an
                      </p>
                    )}
                    {plan.price > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        14 jours d'essai gratuit
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations?.map((limitation, i) => (
                      <li key={`limit-${i}`} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-400">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(planId as PlanId)}
                    disabled={isLoading || isCurrentPlan}
                    className={cn(
                      'w-full',
                      plan.popular 
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700' 
                        : '',
                      isCurrentPlan && 'bg-green-600 hover:bg-green-600'
                    )}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Clock className="w-4 h-4" />
                        </motion.div>
                        Chargement...
                      </span>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Plan actuel
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Trust Badges */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" />
          Paiement sécurisé par Stripe
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          Annulez à tout moment
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-teal-600" />
          Support inclus
        </div>
      </div>

      {/* FAQ Link */}
      <div className="mt-8 text-center">
        <p className="text-slate-500">
          Des questions ?{' '}
          <a href="#faq" className="text-teal-600 hover:underline font-medium">
            Consultez notre FAQ
          </a>
          {' '}ou{' '}
          <a href="mailto:support@carecircle.fr" className="text-teal-600 hover:underline font-medium">
            contactez-nous
          </a>
        </p>
      </div>
    </div>
  )
}

// ============================================
// SUBSCRIPTION MANAGEMENT COMPONENT
// ============================================

export function SubscriptionManager() {
  const {
    plan,
    status,
    isActive,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    selectPlan,
    cancelSubscription,
    reactivateSubscription,
    openPortal,
  } = useSubscription()

  const currentPlanData = PRICING_PLANS[plan]

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-teal-600" />
          Mon Abonnement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="font-medium text-slate-800">{currentPlanData?.name}</p>
            <p className="text-sm text-slate-500">
              {currentPlanData?.price === 0 
                ? 'Accès gratuit' 
                : `${formatPrice(currentPlanData?.price || 0)}/mois`
              }
            </p>
          </div>
          <Badge className={cn(
            isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          )}>
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        {/* Subscription Details */}
        {currentPeriodEnd && (
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Prochaine facturation</p>
              <p className="text-sm font-medium text-slate-700">
                {currentPeriodEnd.toLocaleDateString('fr-FR')}
              </p>
            </div>
            {cancelAtPeriodEnd && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                L'abonnement sera annulé à cette date
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {plan !== 'free' && (
            <>
              {cancelAtPeriodEnd ? (
                <Button 
                  onClick={reactivateSubscription}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  Réactiver l'abonnement
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={cancelSubscription}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  Annuler l'abonnement
                </Button>
              )}
              <Button variant="outline" onClick={openPortal}>
                Gérer le paiement
              </Button>
            </>
          )}
          {plan === 'free' && (
            <Button 
              onClick={() => selectPlan('premium')}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              Passer à Premium
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PRICING COMPARISON TABLE
// ============================================

export function PricingComparison() {
  const allFeatures = [
    { name: 'Assistant IA Cleo', free: '10 msg/jour', premium: 'Illimité', family: 'Illimité' },
    { name: 'Personnes aidées', free: '1', premium: '5', family: 'Illimité' },
    { name: 'Calendrier médical', free: 'Basique', premium: 'Avancé', family: 'Avancé' },
    { name: 'Journal de santé', free: '✗', premium: '✓', family: '✓' },
    { name: 'Export PDF', free: '✗', premium: '✓', family: '✓' },
    { name: 'Alertes intelligentes', free: '✗', premium: '✓', family: '✓' },
    { name: 'Comptes famille', free: '✗', premium: '✗', family: '5 comptes' },
    { name: 'Ligne d\'écoute 24/7', free: '✗', premium: '✗', family: 'Prioritaire' },
    { name: 'Support', free: 'Email', premium: 'Email prioritaire', family: 'Téléphone dédié' },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-4 px-4 font-medium text-slate-600">Fonctionnalité</th>
            <th className="text-center py-4 px-4 font-medium text-slate-600">Gratuit</th>
            <th className="text-center py-4 px-4 font-medium text-teal-600">Premium</th>
            <th className="text-center py-4 px-4 font-medium text-purple-600">Famille</th>
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, index) => (
            <tr 
              key={feature.name}
              className={cn(
                'border-b border-slate-100',
                index % 2 === 0 && 'bg-slate-50'
              )}
            >
              <td className="py-3 px-4 text-slate-700">{feature.name}</td>
              <td className="py-3 px-4 text-center text-slate-500">{feature.free}</td>
              <td className="py-3 px-4 text-center text-teal-700 font-medium">{feature.premium}</td>
              <td className="py-3 px-4 text-center text-purple-700 font-medium">{feature.family}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// FEATURE GATE COMPONENT
// ============================================

interface FeatureGateProps {
  feature: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function FeatureGate({ feature, fallback, children }: FeatureGateProps) {
  const { plan, isActive } = useSubscription()
  
  const features: Record<PlanId, string[]> = {
    free: ['ai_limited', 'calendar_basic', 'care_recipient_1', 'community', 'resources'],
    premium: ['ai_unlimited', 'calendar_advanced', 'care_recipients_5', 'health_journal', 'export_pdf', 'smart_alerts', 'webinars_priority', 'email_support'],
    family: ['ai_unlimited', 'calendar_advanced', 'care_recipients_unlimited', 'health_journal', 'export_pdf', 'smart_alerts', 'webinars_priority', 'phone_support', 'family_accounts_5', 'coordination_shared', 'priority_hotline', 'personal_coach'],
  }

  const hasAccess = isActive && (features[plan]?.includes(feature) ?? false)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Default upgrade prompt
  return (
    <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
      <CardContent className="p-6 text-center">
        <Crown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-medium text-slate-800 mb-1">Fonctionnalité Premium</h3>
        <p className="text-sm text-slate-500 mb-4">
          Passez à Premium pour accéder à cette fonctionnalité
        </p>
        <Button 
          onClick={() => selectPlan('premium')}
          className="bg-gradient-to-r from-teal-600 to-cyan-600"
        >
          Découvrir les plans
        </Button>
      </CardContent>
    </Card>
  )
}
