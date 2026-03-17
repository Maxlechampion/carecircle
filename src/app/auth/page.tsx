'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight,
  Chrome, Facebook, Apple, Loader2, CheckCircle,
  AlertCircle, ArrowLeft, Shield, Stethoscope,
  Users, MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

// ============================================
// TYPES
// ============================================

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'
type UserRole = 'caregiver' | 'doctor' | 'recipient' | 'family'

interface AuthFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone: string
  countryCode: string
  role: UserRole
  acceptTerms: boolean
}

// ============================================
// CONSTANTS
// ============================================

const COUNTRIES = [
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', dialCode: '+41', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
]

const USER_ROLES = [
  { 
    id: 'caregiver' as UserRole, 
    label: 'Aidant Familial', 
    description: 'Vous accompagnez un proche au quotidien',
    icon: Heart,
    color: 'teal'
  },
  { 
    id: 'doctor' as UserRole, 
    label: 'Professionnel de Santé', 
    description: 'Médecin, infirmier, kiné...',
    icon: Stethoscope,
    color: 'blue'
  },
  { 
    id: 'recipient' as UserRole, 
    label: 'Personne Aidée', 
    description: 'Vous êtes accompagné par un aidant',
    icon: User,
    color: 'purple'
  },
  { 
    id: 'family' as UserRole, 
    label: 'Membre de la Famille', 
    description: 'Vous partagez l\'aidance en famille',
    icon: Users,
    color: 'orange'
  },
]

const APP_CONFIG = {
  name: 'CareCircle',
  tagline: 'Soutien Intelligent pour Aidants Familiaux',
}

// ============================================
// MAIN AUTH PAGE COMPONENT
// ============================================

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    countryCode: 'FR',
    role: 'caregiver',
    acceptTerms: false,
  })

  // Check for invitation token
  const resetToken = searchParams.get('token')
  const defaultRole = searchParams.get('role') as UserRole | null

  useEffect(() => {
    setMounted(true)
    if (resetToken) {
      setMode('reset-password')
    }
    if (defaultRole && USER_ROLES.find(r => r.id === defaultRole)) {
      setFormData(prev => ({ ...prev, role: defaultRole }))
    }
  }, [resetToken, defaultRole])

  const updateForm = (field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (mode === 'register') {
      if (step === 1) {
        if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
        if (!formData.email.trim()) {
          newErrors.email = 'L\'email est requis'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Email invalide'
        }
      } else if (step === 2) {
        if (!formData.password) {
          newErrors.password = 'Le mot de passe est requis'
        } else if (formData.password.length < 8) {
          newErrors.password = 'Minimum 8 caractères'
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
        }
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'Vous devez accepter les conditions'
        }
      }
    }

    if (mode === 'login') {
      if (authMethod === 'email') {
        if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
        if (!formData.password) newErrors.password = 'Le mot de passe est requis'
      } else {
        if (!formData.phone.trim()) newErrors.phone = 'Le numéro est requis'
      }
    }

    if (mode === 'forgot-password' || mode === 'reset-password') {
      if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
      if (mode === 'reset-password') {
        if (!formData.password) newErrors.password = 'Le mot de passe est requis'
        else if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères'
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (mode === 'register' && step < 2) {
        setStep(step + 1)
        setIsLoading(false)
        return
      }

      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (mode === 'login') {
        toast({ title: 'Connexion réussie!', description: 'Bienvenue sur CareCircle' })
        router.push('/dashboard')
      } else if (mode === 'register') {
        toast({ title: 'Compte créé!', description: 'Vérifiez votre email pour activer votre compte' })
        setMode('verify-email')
      } else if (mode === 'forgot-password') {
        toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail' })
      } else if (mode === 'reset-password') {
        toast({ title: 'Mot de passe modifié', description: 'Vous pouvez maintenant vous connecter' })
        setMode('login')
      }
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true)
    // Simulate OAuth
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast({ title: `Connexion via ${provider}`, description: 'Redirection...' })
    router.push('/dashboard')
  }

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderLoginForm = () => (
    <div className="space-y-4">
      {/* Auth Method Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <Button
          variant="ghost"
          className={cn('flex-1 rounded-md', authMethod === 'email' && 'bg-white shadow-sm')}
          onClick={() => setAuthMethod('email')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        <Button
          variant="ghost"
          className={cn('flex-1 rounded-md', authMethod === 'phone' && 'bg-white shadow-sm')}
          onClick={() => setAuthMethod('phone')}
        >
          <Phone className="w-4 h-4 mr-2" />
          SMS
        </Button>
      </div>

      {authMethod === 'email' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="marie@email.fr"
              value={formData.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Mot de passe</Label>
              <Button variant="link" className="p-0 text-xs text-teal-600" onClick={() => setMode('forgot-password')}>
                Oublié ?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateForm('password', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <div className="flex gap-2">
            <select
              className="w-24 h-10 px-2 border rounded-lg text-sm"
              value={formData.countryCode}
              onChange={(e) => updateForm('countryCode', e.target.value)}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.dialCode}</option>
              ))}
            </select>
            <Input
              id="phone"
              type="tel"
              placeholder="6 00 00 00 00"
              value={formData.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              className="flex-1"
            />
          </div>
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
      )}
    </div>
  )

  const renderRegisterStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Votre profil</Label>
        <div className="grid grid-cols-2 gap-3">
          {USER_ROLES.map(role => {
            const Icon = role.icon
            return (
              <motion.div
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={cn(
                    'cursor-pointer transition-all h-full',
                    formData.role === role.id ? 'ring-2 ring-teal-500 border-teal-500' : 'hover:border-slate-300'
                  )}
                  onClick={() => updateForm('role', role.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2',
                      role.color === 'teal' && 'bg-teal-100',
                      role.color === 'blue' && 'bg-blue-100',
                      role.color === 'purple' && 'bg-purple-100',
                      role.color === 'orange' && 'bg-orange-100',
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        role.color === 'teal' && 'text-teal-600',
                        role.color === 'blue' && 'text-blue-600',
                        role.color === 'purple' && 'text-purple-600',
                        role.color === 'orange' && 'text-orange-600',
                      )} />
                    </div>
                    <p className="font-medium text-sm">{role.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="name"
            placeholder="Marie Dupont"
            value={formData.name}
            onChange={(e) => updateForm('name', e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="reg-email"
            type="email"
            placeholder="marie@email.fr"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
    </div>
  )

  const renderRegisterStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
        <Badge variant="secondary">Étape 2/2</Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => updateForm('password', e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        {formData.password.length > 0 && (
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={cn(
                  'h-1 flex-1 rounded-full',
                  formData.password.length >= i * 2 ? 'bg-green-500' : 'bg-slate-200'
                )} 
              />
            ))}
          </div>
        )}
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmer</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => updateForm('confirmPassword', e.target.value)}
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={formData.acceptTerms}
          onChange={(e) => updateForm('acceptTerms', e.target.checked)}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm font-normal">
          J'accepte les{' '}
          <a href="#" className="text-teal-600 hover:underline">conditions d'utilisation</a>
          {' '}et la{' '}
          <a href="#" className="text-teal-600 hover:underline">politique de confidentialité</a>
        </Label>
      </div>
      {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}
    </div>
  )

  const renderForgotPassword = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <p className="text-slate-600">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="forgot-email"
            type="email"
            placeholder="marie@email.fr"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
    </div>
  )

  const renderResetPassword = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Shield className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <p className="text-slate-600">Choisissez un nouveau mot de passe</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reset-password">Nouveau mot de passe</Label>
        <Input
          id="reset-password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => updateForm('password', e.target.value)}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reset-confirm">Confirmer</Label>
        <Input
          id="reset-confirm"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => updateForm('confirmPassword', e.target.value)}
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>
    </div>
  )

  const renderOAuthButtons = () => (
    <div className="space-y-3">
      <Separator className="my-4" />
      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('google')} disabled={isLoading}>
          <Chrome className="w-4 h-4 mr-2" /> Google
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('facebook')} disabled={isLoading}>
          <Facebook className="w-4 h-4 mr-2" /> Facebook
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('apple')} disabled={isLoading}>
          <Apple className="w-4 h-4 mr-2" /> Apple
        </Button>
      </div>
    </div>
  )

  const renderVerifyEmail = () => (
    <div className="text-center space-y-4">
      <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
        <Mail className="w-10 h-10 text-teal-600" />
      </div>
      <h2 className="text-xl font-bold">Vérifiez votre email</h2>
      <p className="text-slate-600">
        Nous avons envoyé un lien de vérification à<br />
        <strong>{formData.email}</strong>
      </p>
      <Button variant="outline" onClick={() => setMode('login')}>
        Retour à la connexion
      </Button>
    </div>
  )

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Connexion'
      case 'register': return 'Créer un compte'
      case 'forgot-password': return 'Mot de passe oublié'
      case 'reset-password': return 'Nouveau mot de passe'
      default: return 'Authentification'
    }
  }

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Accédez à votre espace CareCircle'
      case 'register': return 'Rejoignez la communauté CareCircle'
      case 'forgot-password': return 'Récupérez l\'accès à votre compte'
      case 'reset-password': return 'Sécurisez votre compte'
      default: return ''
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">{APP_CONFIG.name}</h1>
          <p className="text-slate-600">{APP_CONFIG.tagline}</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {mode === 'verify-email' ? (
              renderVerifyEmail()
            ) : (
              <>
                {mode === 'login' && renderLoginForm()}
                {mode === 'register' && (
                  <>
                    {step === 1 && renderRegisterStep1()}
                    {step === 2 && renderRegisterStep2()}
                  </>
                )}
                {mode === 'forgot-password' && renderForgotPassword()}
                {mode === 'reset-password' && renderResetPassword()}

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.submit}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {mode === 'login' && 'Se connecter'}
                  {mode === 'register' && (step === 1 ? 'Continuer' : 'Créer mon compte')}
                  {mode === 'forgot-password' && 'Envoyer le lien'}
                  {mode === 'reset-password' && 'Réinitialiser'}
                </Button>

                {(mode === 'login' || mode === 'register') && renderOAuthButtons()}
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t pt-4">
            {mode === 'login' && (
              <p className="text-sm text-slate-500 text-center">
                Pas encore de compte ?{' '}
                <Button variant="link" className="p-0 text-teal-600" onClick={() => { setMode('register'); setStep(1) }}>
                  Créer un compte
                </Button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-sm text-slate-500 text-center">
                Déjà inscrit ?{' '}
                <Button variant="link" className="p-0 text-teal-600" onClick={() => setMode('login')}>
                  Se connecter
                </Button>
              </p>
            )}
            {mode === 'forgot-password' && (
              <Button variant="ghost" className="w-full" onClick={() => setMode('login')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la connexion
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Connexion sécurisée • Données chiffrées</span>
        </div>

        {/* Back to Landing */}
        <Button variant="ghost" className="w-full mt-2" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au site
        </Button>
      </motion.div>
    </div>
  )
}

// ============================================
// EXPORT WITH SUSPENSE
// ============================================

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
