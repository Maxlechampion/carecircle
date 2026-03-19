'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight,
  Chrome, Facebook, Apple, MessageSquare, Loader2, CheckCircle,
  AlertCircle, ArrowLeft, Shield, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getSupportedCountries } from '@/lib/payment-config'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-phone' | 'reset-password'

interface AuthFormData {
  email: string
  password: string
  name: string
  phone: string
  countryCode: string
  otpCode: string
}

interface AuthPageProps {
  onLogin: (data: AuthFormData) => Promise<void>
  onRegister: (data: AuthFormData) => Promise<void>
  onOAuthLogin: (provider: 'google' | 'facebook' | 'apple') => Promise<void>
  onPhoneLogin: (phone: string) => Promise<void>
  onVerifyOTP: (phone: string, code: string) => Promise<void>
  onForgotPassword: (email: string) => Promise<void>
  onBack: () => void
  isLoading?: boolean
}

const COUNTRIES = getSupportedCountries()

export function AuthPage({
  onLogin,
  onRegister,
  onOAuthLogin,
  onPhoneLogin,
  onVerifyOTP,
  onForgotPassword,
  onBack,
  isLoading = false,
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    countryCode: 'FR',
    otpCode: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [acceptTerms, setAcceptTerms] = useState(false)

  const updateForm = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Le nom est requis'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email invalide'
      }
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Minimum 8 caractères'
      }
      if (!acceptTerms) {
        newErrors.terms = 'Vous devez accepter les conditions'
      }
    }

    if (mode === 'login') {
      if (authMethod === 'email') {
        if (!formData.email.trim()) {
          newErrors.email = 'L\'email est requis'
        }
        if (!formData.password) {
          newErrors.password = 'Le mot de passe est requis'
        }
      } else {
        if (!formData.phone.trim()) {
          newErrors.phone = 'Le numéro est requis'
        }
      }
    }

    if (mode === 'forgot-password') {
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis'
      }
    }

    if (mode === 'verify-phone') {
      if (!formData.otpCode.trim() || formData.otpCode.length !== 6) {
        newErrors.otpCode = 'Code invalide'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      switch (mode) {
        case 'login':
          if (authMethod === 'email') {
            await onLogin(formData)
          } else {
            await onPhoneLogin(formData.phone)
            setMode('verify-phone')
          }
          break
        case 'register':
          await onRegister(formData)
          break
        case 'forgot-password':
          await onForgotPassword(formData.email)
          break
        case 'verify-phone':
          await onVerifyOTP(formData.phone, formData.otpCode)
          break
      }
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  const renderLoginForm = () => (
    <div className="space-y-4">
      {/* Auth Method Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <Button
          variant="ghost"
          className={cn('flex-1', authMethod === 'email' && 'bg-white shadow-sm')}
          onClick={() => setAuthMethod('email')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        <Button
          variant="ghost"
          className={cn('flex-1', authMethod === 'phone' && 'bg-white shadow-sm')}
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
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.fr"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="pl-10"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateForm('password', e.target.value)}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <Button
              variant="link"
              className="text-sm text-teal-600 p-0"
              onClick={() => setMode('forgot-password')}
            >
              Mot de passe oublié ?
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Numéro de téléphone</Label>
            <div className="flex gap-2">
              <Select value={formData.countryCode} onValueChange={(v) => updateForm('countryCode', v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.slice(0, 10).map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="tel"
                placeholder="6 00 00 00 00"
                value={formData.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="flex-1"
              />
            </div>
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            <p className="text-xs text-slate-500">Vous recevrez un code de vérification par SMS</p>
          </div>
        </>
      )}
    </div>
  )

  const renderRegisterForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="name"
            type="text"
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
            placeholder="votre@email.fr"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Pays de résidence</Label>
        <Select value={formData.countryCode} onValueChange={(v) => updateForm('countryCode', v)}>
          <SelectTrigger>
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sélectionner votre pays" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map(c => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimum 8 caractères"
            value={formData.password}
            onChange={(e) => updateForm('password', e.target.value)}
            className="pl-10 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        <div className="flex items-center gap-2 mt-2">
          {formData.password.length >= 8 && <CheckCircle className="w-4 h-4 text-green-500" />}
          <span className={cn('text-xs', formData.password.length >= 8 ? 'text-green-600' : 'text-slate-400')}>
            8 caractères minimum
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm font-normal">
          J'accepte les <a href="#" className="text-teal-600 hover:underline">conditions d'utilisation</a> et la{' '}
          <a href="#" className="text-teal-600 hover:underline">politique de confidentialité</a>
        </Label>
      </div>
      {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
    </div>
  )

  const renderForgotPassword = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>
      <div className="space-y-2">
        <Label htmlFor="fp-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="fp-email"
            type="email"
            placeholder="votre@email.fr"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
    </div>
  )

  const renderVerifyPhone = () => (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="font-semibold text-slate-800">Vérification par SMS</h3>
        <p className="text-sm text-slate-500 mt-1">
          Un code a été envoyé au {formData.phone}
        </p>
      </div>
      <div className="space-y-2">
        <Label>Code de vérification</Label>
        <Input
          type="text"
          placeholder="000000"
          value={formData.otpCode}
          onChange={(e) => updateForm('otpCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-2xl tracking-widest"
          maxLength={6}
        />
        {errors.otpCode && <p className="text-sm text-red-500">{errors.otpCode}</p>}
        <Button variant="link" className="w-full text-sm" onClick={() => onPhoneLogin(formData.phone)}>
          Renvoyer le code
        </Button>
      </div>
    </div>
  )

  const renderOAuthButtons = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Ou continuer avec</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOAuthLogin('google')}
          disabled={isLoading}
        >
          <Chrome className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOAuthLogin('facebook')}
          disabled={isLoading}
        >
          <Facebook className="w-5 h-5 text-blue-600" />
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOAuthLogin('apple')}
          disabled={isLoading}
        >
          <Apple className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{APP_CONFIG.name}</h1>
          <p className="text-slate-500">{APP_CONFIG.tagline}</p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle>
              {mode === 'login' && 'Connexion'}
              {mode === 'register' && 'Créer un compte'}
              {mode === 'forgot-password' && 'Mot de passe oublié'}
              {mode === 'verify-phone' && 'Vérification'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Accédez à votre espace aidant'}
              {mode === 'register' && 'Rejoignez la communauté CareCircle'}
              {mode === 'forgot-password' && 'Nous allons vous aider'}
              {mode === 'verify-phone' && 'Entrez le code reçu'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {mode === 'login' && renderLoginForm()}
                {mode === 'register' && renderRegisterForm()}
                {mode === 'forgot-password' && renderForgotPassword()}
                {mode === 'verify-phone' && renderVerifyPhone()}
              </motion.div>
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Se connecter'}
                  {mode === 'register' && 'Créer mon compte'}
                  {mode === 'forgot-password' && 'Envoyer le lien'}
                  {mode === 'verify-phone' && 'Vérifier'}
                </>
              )}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>

            {/* OAuth for login/register */}
            {(mode === 'login' || mode === 'register') && renderOAuthButtons()}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-0">
            {mode === 'login' && (
              <p className="text-sm text-slate-500 text-center">
                Pas encore de compte ?{' '}
                <Button variant="link" className="p-0 text-teal-600" onClick={() => setMode('register')}>
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
            {mode !== 'login' && mode !== 'register' && (
              <Button variant="ghost" className="w-full" onClick={() => setMode('login')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
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
        <Button variant="ghost" className="w-full mt-2" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au site
        </Button>
      </motion.div>
    </div>
  )
}

const APP_CONFIG = {
  name: 'CareCircle',
  tagline: 'Soutien Intelligent pour Aidants Familiaux',
}
