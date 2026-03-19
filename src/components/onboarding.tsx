'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Users, Bot, Bell, CreditCard, ChevronRight, ChevronLeft,
  Check, Sparkles, User, Mail, Phone, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void
  onSkip: () => void
}

export interface OnboardingData {
  userName: string
  userEmail: string
  recipientName: string
  recipientAge: number
  recipientRelationship: string
  conditions: string[]
  notifications: {
    email: boolean
    push: boolean
    reminders: boolean
  }
  plan: 'free' | 'premium' | 'family'
}

const STEPS = [
  { id: 'welcome', title: 'Bienvenue', icon: Heart },
  { id: 'profile', title: 'Votre profil', icon: User },
  { id: 'recipient', title: 'Votre proche', icon: Users },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'plan', title: 'Votre plan', icon: CreditCard },
]

const CONDITIONS_LIST = [
  'Maladie d\'Alzheimer',
  'Parkinson',
  'Cancer',
  'Diabète',
  'Hypertension',
  'Arthrose',
  'Démence',
  ' AVC',
  'Autre',
]

export function OnboardingWizard({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    userName: '',
    userEmail: '',
    recipientName: '',
    recipientAge: 70,
    recipientRelationship: '',
    conditions: [],
    notifications: {
      email: true,
      push: true,
      reminders: true,
    },
    plan: 'free',
  })

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete(data)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const toggleCondition = (condition: string) => {
    setData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }))
  }

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl"
            >
              <Heart className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Bienvenue sur CareCircle
              </h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Vous êtes sur le point de rejoindre une communauté d'aidants familiaux soutenus par l'intelligence artificielle.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { icon: Bot, label: 'Assistant IA' },
                { icon: Calendar, label: 'Suivi médical' },
                { icon: Users, label: 'Communauté' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-slate-50 rounded-xl"
                >
                  <item.icon className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Votre profil</h2>
              <p className="text-slate-600">Comment pouvons-nous vous appeler ?</p>
            </div>
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="userName">Votre prénom</Label>
                <Input
                  id="userName"
                  placeholder="Marie"
                  value={data.userName}
                  onChange={(e) => setData(prev => ({ ...prev, userName: e.target.value }))}
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Votre email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="marie@email.fr"
                    value={data.userEmail}
                    onChange={(e) => setData(prev => ({ ...prev, userEmail: e.target.value }))}
                    className="bg-slate-50 pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'recipient':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Votre proche</h2>
              <p className="text-slate-600">Parlez-nous de la personne que vous accompagnez</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Son prénom</Label>
                  <Input
                    id="recipientName"
                    placeholder="Jean"
                    value={data.recipientName}
                    onChange={(e) => setData(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientAge">Son âge</Label>
                  <Input
                    id="recipientAge"
                    type="number"
                    placeholder="75"
                    value={data.recipientAge}
                    onChange={(e) => setData(prev => ({ ...prev, recipientAge: parseInt(e.target.value) || 0 }))}
                    className="bg-slate-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Votre relation</Label>
                <select
                  id="relationship"
                  value={data.recipientRelationship}
                  onChange={(e) => setData(prev => ({ ...prev, recipientRelationship: e.target.value }))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Conjoint(e)">Conjoint(e)</option>
                  <option value="Frère/Sœur">Frère/Sœur</option>
                  <option value="Grand-parent">Grand-parent</option>
                  <option value="Ami(e)">Ami(e)</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Pathologies (optionnel)</Label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS_LIST.map((condition) => (
                    <Badge
                      key={condition}
                      variant={data.conditions.includes(condition) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        data.conditions.includes(condition)
                          ? 'bg-teal-600 hover:bg-teal-700'
                          : 'hover:bg-slate-50'
                      )}
                      onClick={() => toggleCondition(condition)}
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Notifications</h2>
              <p className="text-slate-600">Choisissez comment vous souhaitez être notifié(e)</p>
            </div>
            <div className="space-y-4 max-w-sm mx-auto">
              {[
                {
                  key: 'email',
                  title: 'Notifications email',
                  description: 'Recevez des résumés et conseils par email',
                  icon: Mail,
                },
                {
                  key: 'push',
                  title: 'Notifications push',
                  description: 'Alertes en temps réel sur votre appareil',
                  icon: Bell,
                },
                {
                  key: 'reminders',
                  title: 'Rappels',
                  description: 'Rappels de médicaments et rendez-vous',
                  icon: Calendar,
                },
              ].map((notif) => (
                <div
                  key={notif.key}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <notif.icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{notif.title}</p>
                      <p className="text-sm text-slate-500">{notif.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.notifications[notif.key as keyof typeof data.notifications]}
                    onCheckedChange={(checked) =>
                      setData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, [notif.key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 'plan':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Choisissez votre plan</h2>
              <p className="text-slate-600">Commencez gratuitement, évoluez selon vos besoins</p>
            </div>
            <div className="grid gap-4 max-w-2xl mx-auto">
              {[
                {
                  id: 'free',
                  name: 'Gratuit',
                  price: '0€',
                  period: 'pour toujours',
                  features: ['Assistant IA (10 msg/jour)', '1 proche suivi', 'Communauté'],
                  popular: false,
                },
                {
                  id: 'premium',
                  name: 'Premium',
                  price: '9,99€',
                  period: '/mois',
                  features: ['Assistant IA illimité', '5 proches suivis', 'Export PDF', 'Support prioritaire'],
                  popular: true,
                },
              ].map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    data.plan === plan.id
                      ? 'ring-2 ring-teal-500 border-teal-500'
                      : 'hover:border-teal-200',
                    plan.popular && 'relative'
                  )}
                  onClick={() => setData(prev => ({ ...prev, plan: plan.id as 'free' | 'premium' }))}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Badge className="bg-teal-600 text-white">
                        <Sparkles className="w-3 h-3 mr-1" /> Populaire
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{plan.name}</h3>
                          {data.plan === plan.id && (
                            <Check className="w-5 h-5 text-teal-600" />
                          )}
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {plan.price}
                          <span className="text-sm font-normal text-slate-500">{plan.period}</span>
                        </p>
                      </div>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-teal-600" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-xl border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  i < currentStep
                    ? 'bg-teal-600 text-white'
                    : i === currentStep
                    ? 'bg-teal-100 text-teal-600 border-2 border-teal-600'
                    : 'bg-slate-100 text-slate-400'
                )}
              >
                {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </CardHeader>
        
        <CardContent className="py-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? onSkip : handleBack}
            className="text-slate-500"
          >
            {currentStep === 0 ? 'Passer' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </>
            )}
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
          >
            {currentStep === STEPS.length - 1 ? (
              <>
                Commencer
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continuer
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
