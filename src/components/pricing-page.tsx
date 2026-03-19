'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, CreditCard, Smartphone, Building2, Shield, Check, X,
  ChevronRight, ArrowLeft, Globe, Clock, Zap, Crown, Star,
  Loader2, AlertCircle, CheckCircle, Wallet, MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  COUNTRY_CONFIGS,
  PLAN_PRICING,
  MOBILE_MONEY_PROVIDERS,
  getCountryConfig,
  formatPrice,
  getMobileMoneyProviders,
  getSupportedCountries,
  type PaymentProvider,
  type PaymentMethod,
  type CountryPaymentConfig,
} from '@/lib/payment-config'

// Types
type PlanId = 'free' | 'premium' | 'family'
type BillingCycle = 'monthly' | 'yearly'

interface PaymentState {
  country: string
  plan: PlanId
  billingCycle: BillingCycle
  paymentMethod: PaymentMethod | null
  mobileMoneyProvider: string | null
  phoneNumber: string
  email: string
  isLoading: boolean
  step: 'plan' | 'payment' | 'processing' | 'success' | 'error'
}

// Detect user country from browser
function detectUserCountry(): string {
  if (typeof window === 'undefined') return 'FR'
  
  // Try to get from localStorage
  const saved = localStorage.getItem('carecircle_country')
  if (saved && COUNTRY_CONFIGS[saved]) return saved
  
  // Try timezone detection
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const tzToCountry: Record<string, string> = {
    'Europe/Paris': 'FR',
    'Africa/Dakar': 'SN',
    'Africa/Abidjan': 'CI',
    'Africa/Bamako': 'ML',
    'Africa/Ouagadougou': 'BF',
    'Africa/Lagos': 'NG',
    'Africa/Nairobi': 'KE',
    'Europe/Brussels': 'BE',
    'Europe/Zurich': 'CH',
    'Europe/London': 'GB',
  }
  
  return tzToCountry[timezone] || 'FR'
}

// Payment Method Icons
const PAYMENT_ICONS: Record<string, React.ElementType> = {
  card: CreditCard,
  mobile_money: Smartphone,
  bank_transfer: Building2,
  ussd: MessageSquare,
  apple_pay: Smartphone,
  google_pay: Smartphone,
  sepa: Building2,
}

// Main Pricing Page Component
export function PricingPageV2({ onSelectPlan }: { onSelectPlan?: (plan: PlanId) => void }) {
  const [country, setCountry] = useState<string>('FR')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setCountry(detectUserCountry())
  }, [])

  const countryConfig = getCountryConfig(country)
  const supportedCountries = getSupportedCountries()

  const getPrice = (planId: PlanId): number => {
    const plan = PLAN_PRICING[planId]
    const price = plan.prices[countryConfig.currency as keyof typeof plan.prices] || plan.prices.USD
    return billingCycle === 'yearly' ? Math.round(price * 12 * 0.8) : price
  }

  const handleSelectPlan = (planId: PlanId) => {
    if (planId === 'free') {
      onSelectPlan?.(planId)
      toast({
        title: 'Plan gratuit activé',
        description: 'Bienvenue sur CareCircle !',
      })
    } else {
      setSelectedPlan(planId)
      setShowCheckout(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-teal-100 text-teal-700">
            <Zap className="w-3 h-3 mr-1" />
            Tarifs transparents
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Choisissez le plan adapté à vos besoins
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tous les plans incluent un essai gratuit de 14 jours. Annulez à tout moment.
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-white rounded-xl border p-2">
            <Globe className="w-5 h-5 text-slate-400" />
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="border-0 shadow-none w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCountries.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name} ({COUNTRY_CONFIGS[c.code]?.currency || 'USD'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{countryConfig.currency}</Badge>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={cn('text-sm', billingCycle === 'monthly' && 'font-medium text-slate-900')}>
            Mensuel
          </span>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'w-12 h-6 p-0 rounded-full',
              billingCycle === 'yearly' && 'bg-teal-600 border-teal-600'
            )}
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
          >
            <motion.div
              className={cn(
                'w-4 h-4 rounded-full',
                billingCycle === 'yearly' ? 'bg-white' : 'bg-slate-400'
              )}
              animate={{ x: billingCycle === 'yearly' ? 16 : 2 }}
            />
          </Button>
          <span className={cn('text-sm', billingCycle === 'yearly' && 'font-medium text-slate-900')}>
            Annuel
            <Badge className="ml-2 bg-green-100 text-green-700">-20%</Badge>
          </span>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(['free', 'premium', 'family'] as PlanId[]).map((planId, index) => {
            const plan = PLAN_PRICING[planId]
            const price = getPrice(planId)
            const isSelected = selectedPlan === planId

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    'relative h-full transition-all cursor-pointer',
                    plan.popular 
                      ? 'border-teal-500 shadow-lg shadow-teal-100 ring-2 ring-teal-500' 
                      : 'hover:border-teal-300 hover:shadow-md',
                    isSelected && 'ring-2 ring-teal-600 border-teal-600'
                  )}
                  onClick={() => setSelectedPlan(planId)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 px-4">
                        <Zap className="w-3 h-3 mr-1" />
                        Le plus populaire
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
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="text-center pb-4">
                    <div className="mb-4">
                      {plan.prices[countryConfig.currency as keyof typeof plan.prices] === 0 ? (
                        <div className="text-4xl font-bold text-slate-900">Gratuit</div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-slate-900">
                            {formatPrice(price, countryConfig.currency)}
                          </span>
                          <span className="text-slate-500">/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                        </div>
                      )}
                      {billingCycle === 'yearly' && price > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Économisez 20%
                        </p>
                      )}
                      {plan.trialDays > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {plan.trialDays} jours d'essai gratuit
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2 text-left">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={cn(
                        'w-full',
                        plan.popular && 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                      )}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectPlan(planId)
                      }}
                    >
                      {planId === 'free' ? 'Commencer gratuitement' : plan.cta}
                      <ChevronRight className="w-4 h-4 ml-2" />
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
            Paiement sécurisé
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
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        plan={selectedPlan || 'premium'}
        country={country}
        billingCycle={billingCycle}
        onComplete={() => {
          setShowCheckout(false)
          toast({
            title: 'Paiement réussi !',
            description: 'Bienvenue sur CareCircle Premium !',
          })
        }}
      />
    </div>
  )
}

// Checkout Dialog Component
export function CheckoutDialog({
  open,
  onOpenChange,
  plan,
  country,
  billingCycle,
  onComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanId
  country: string
  billingCycle: BillingCycle
  onComplete: () => void
}) {
  const [state, setState] = useState<PaymentState>({
    country,
    plan,
    billingCycle,
    paymentMethod: null,
    mobileMoneyProvider: null,
    phoneNumber: '',
    email: '',
    isLoading: false,
    step: 'payment',
  })

  const countryConfig = getCountryConfig(state.country)
  const planData = PLAN_PRICING[state.plan]
  const price = billingCycle === 'yearly' 
    ? Math.round((planData.prices[countryConfig.currency as keyof typeof planData.prices] || planData.prices.USD) * 12 * 0.8)
    : planData.prices[countryConfig.currency as keyof typeof planData.prices] || planData.prices.USD
  const mobileMoneyProviders = getMobileMoneyProviders(state.country)

  useEffect(() => {
    if (open) {
      setState(prev => ({
        ...prev,
        country,
        plan,
        billingCycle,
        paymentMethod: null,
        mobileMoneyProvider: null,
        step: 'payment',
      }))
    }
  }, [open, country, plan, billingCycle])

  const handleSubmit = async () => {
    if (!state.paymentMethod) return
    
    setState(prev => ({ ...prev, isLoading: true, step: 'processing' }))

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // In production, this would call the Flutterwave/Paystack API
    try {
      const response = await fetch('/api/payments/flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          currency: countryConfig.currency,
          plan: state.plan,
          billingCycle: state.billingCycle,
          paymentMethod: state.paymentMethod,
          phoneNumber: state.phoneNumber,
          email: state.email,
          mobileMoneyProvider: state.mobileMoneyProvider,
        }),
      })

      if (response.ok) {
        setState(prev => ({ ...prev, step: 'success' }))
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        throw new Error('Payment failed')
      }
    } catch (error) {
      setState(prev => ({ ...prev, step: 'error', isLoading: false }))
    }
  }

  const renderStep = () => {
    switch (state.step) {
      case 'payment':
        return (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{planData.name}</span>
                <span className="font-bold">{formatPrice(price, countryConfig.currency)}</span>
              </div>
              <div className="text-sm text-slate-500">
                {billingCycle === 'monthly' ? 'Facturation mensuelle' : 'Facturation annuelle (-20%)'}
              </div>
              {planData.trialDays > 0 && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {planData.trialDays} jours d'essai gratuit
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label className="mb-3 block">Méthode de paiement</Label>
              <RadioGroup
                value={state.paymentMethod || ''}
                onValueChange={(v) => setState(prev => ({ ...prev, paymentMethod: v as PaymentMethod }))}
                className="grid gap-2"
              >
                {countryConfig.methods.map((method) => {
                  const Icon = PAYMENT_ICONS[method] || CreditCard
                  return (
                    <Label
                      key={method}
                      htmlFor={method}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                        state.paymentMethod === method 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'hover:border-slate-300'
                      )}
                    >
                      <RadioGroupItem value={method} id={method} />
                      <Icon className="w-5 h-5 text-slate-600" />
                      <span className="flex-1">{getPaymentMethodLabel(method)}</span>
                    </Label>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Mobile Money Provider Selection */}
            {state.paymentMethod === 'mobile_money' && mobileMoneyProviders.length > 0 && (
              <div>
                <Label className="mb-3 block">Opérateur Mobile Money</Label>
                <RadioGroup
                  value={state.mobileMoneyProvider || ''}
                  onValueChange={(v) => setState(prev => ({ ...prev, mobileMoneyProvider: v }))}
                  className="grid grid-cols-2 gap-2"
                >
                  {mobileMoneyProviders.map((provider) => (
                    <Label
                      key={provider.id}
                      htmlFor={provider.id}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all',
                        state.mobileMoneyProvider === provider.id 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'hover:border-slate-300'
                      )}
                    >
                      <RadioGroupItem value={provider.id} id={provider.id} />
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">{provider.name}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Phone Number for Mobile Money */}
            {state.paymentMethod === 'mobile_money' && (
              <div>
                <Label>Numéro de téléphone</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={state.phoneNumber}
                    onChange={(e) => setState(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="77 123 45 67"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Email for receipt */}
            <div>
              <Label>Email pour la facture</Label>
              <Input
                type="email"
                value={state.email}
                onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.fr"
                className="mt-1.5"
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              onClick={handleSubmit}
              disabled={!state.paymentMethod || !state.email || (state.paymentMethod === 'mobile_money' && !state.phoneNumber)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Payer {formatPrice(price, countryConfig.currency)}
            </Button>

            <p className="text-xs text-center text-slate-400">
              Paiement sécurisé par {countryConfig.provider === 'flutterwave' ? 'Flutterwave' : countryConfig.provider === 'paystack' ? 'Paystack' : 'Stripe'}
            </p>
          </div>
        )

      case 'processing':
        return (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Loader2 className="w-16 h-16 text-teal-600" />
            </motion.div>
            <h3 className="font-semibold text-slate-800 mb-2">Traitement en cours</h3>
            <p className="text-sm text-slate-500">Veuillez patienter...</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="font-semibold text-slate-800 mb-2">Paiement réussi !</h3>
            <p className="text-sm text-slate-500">Bienvenue sur CareCircle Premium !</p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Erreur de paiement</h3>
            <p className="text-sm text-slate-500 mb-4">Une erreur s'est produite. Veuillez réessayer.</p>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, step: 'payment' }))}>
              Réessayer
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-teal-600" />
            Finaliser votre abonnement
          </DialogTitle>
          <DialogDescription>
            Paiement sécurisé • Données chiffrées
          </DialogDescription>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  )
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    card: 'Carte bancaire',
    mobile_money: 'Mobile Money',
    bank_transfer: 'Virement bancaire',
    ussd: 'USSD',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
    sepa: 'Prélèvement SEPA',
  }
  return labels[method] || method
}

export default PricingPageV2
