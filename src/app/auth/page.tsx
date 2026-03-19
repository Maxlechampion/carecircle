'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight,
  Chrome, Facebook, Apple, Loader2, CheckCircle,
  AlertCircle, ArrowLeft, Shield, Stethoscope,
  Users, MessageSquare, Info
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
import { useAuth, UserRole, ROLE_CONFIG } from '@/lib/auth-context'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'verify-phone'

interface AuthFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone: string
  countryCode: string
  role: UserRole
  acceptTerms: boolean
  otpCode: string
}

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
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
]

const USER_ROLES: { id: UserRole; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { id: 'caregiver', label: 'Aidant Familial', description: 'Vous accompagnez un proche au quotidien', icon: Heart, color: 'teal' },
  { id: 'doctor', label: 'Professionnel de Santé', description: 'Médecin, infirmier, kiné...', icon: Stethoscope, color: 'blue' },
  { id: 'recipient', label: 'Personne Aidée', description: 'Vous êtes accompagné par un aidant', icon: User, color: 'purple' },
  { id: 'family', label: 'Membre de la Famille', description: 'Vous partagez l\'aidance en famille', icon: Users, color: 'orange' },
]

const APP_CONFIG = { name: 'CareCircle', tagline: 'Soutien Intelligent pour Aidants Familiaux' }

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, register, loginWithOAuth, loginWithPhone, verifyOTP, forgotPassword, isLoading, isAuthenticated } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [pendingPhone, setPendingPhone] = useState('')

  const [formData, setFormData] = useState<AuthFormData>({
    email: '', password: '', confirmPassword: '', name: '', phone: '',
    countryCode: 'FR', role: 'caregiver', acceptTerms: false, otpCode: '',
  })

  useEffect(() => {
    setMounted(true)
    const resetToken = searchParams.get('token')
    const defaultRole = searchParams.get('role') as UserRole | null
    if (resetToken) setMode('reset-password')
    if (defaultRole && USER_ROLES.find(r => r.id === defaultRole)) {
      setFormData(prev => ({ ...prev, role: defaultRole }))
    }
  }, [searchParams])

  useEffect(() => {
    if (isAuthenticated && mounted) router.push('/')
  }, [isAuthenticated, mounted, router])

  const updateForm = (field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (mode === 'register') {
      if (step === 1) {
        if (!formData.name.trim()) e.name = 'Le nom est requis'
        if (!formData.email.trim()) e.email = 'L\'email est requis'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email invalide'
      } else {
        if (!formData.password) e.password = 'Requis'
        else if (formData.password.length < 8) e.password = 'Minimum 8 caractères'
        if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Ne correspondent pas'
        if (!formData.acceptTerms) e.acceptTerms = 'Vous devez accepter les conditions'
      }
    }
    if (mode === 'login') {
      if (authMethod === 'email') {
        if (!formData.email.trim()) e.email = 'Requis'
        if (!formData.password) e.password = 'Requis'
      } else if (!formData.phone.trim()) e.phone = 'Requis'
    }
    if (mode === 'forgot-password' && !formData.email.trim()) e.email = 'Requis'
    if (mode === 'reset-password') {
      if (!formData.password || formData.password.length < 8) e.password = 'Minimum 8 caractères'
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Ne correspondent pas'
    }
    if (mode === 'verify-phone' && formData.otpCode.length !== 6) e.otpCode = 'Code à 6 chiffres requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      if (mode === 'register' && step === 1) { setStep(2); return }
      if (mode === 'login') {
        if (authMethod === 'email') {
          await login(formData.email, formData.password)
          toast({ title: 'Connexion réussie !', description: 'Bienvenue sur CareCircle' })
          router.push('/')
        } else {
          const country = COUNTRIES.find(c => c.code === formData.countryCode)
          const fullPhone = `${country?.dialCode || ''}${formData.phone}`
          await loginWithPhone(fullPhone, formData.countryCode)
          setPendingPhone(fullPhone)
          setMode('verify-phone')
          toast({ title: 'Code envoyé', description: `SMS envoyé au ${fullPhone}` })
        }
      } else if (mode === 'register') {
        await register({ name: formData.name, email: formData.email, password: formData.password, role: formData.role, countryCode: formData.countryCode })
        toast({ title: 'Compte créé !', description: `Bienvenue ${formData.name} !` })
        router.push('/')
      } else if (mode === 'forgot-password') {
        await forgotPassword(formData.email)
        toast({ title: 'Email envoyé', description: 'Consultez votre boîte mail.' })
        setMode('verify-email')
      } else if (mode === 'reset-password') {
        toast({ title: 'Mot de passe modifié', description: 'Vous pouvez maintenant vous connecter.' })
        setMode('login')
      } else if (mode === 'verify-phone') {
        await verifyOTP(pendingPhone, formData.otpCode)
        toast({ title: 'Vérification réussie !' })
        router.push('/')
      }
    } catch {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' })
    }
  }

  const handleOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await loginWithOAuth(provider)
      toast({ title: `Connexion via ${provider} réussie !` })
      router.push('/')
    } catch {
      toast({ title: 'Erreur de connexion', variant: 'destructive' })
    }
  }

  if (!mounted) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  )

  const getTitle = () => ({ login: 'Connexion', register: 'Créer un compte', 'forgot-password': 'Mot de passe oublié', 'reset-password': 'Nouveau mot de passe', 'verify-email': 'Vérification email', 'verify-phone': 'Vérification SMS' }[mode])
  const getDesc = () => ({ login: 'Accédez à votre espace CareCircle', register: 'Rejoignez la communauté CareCircle', 'forgot-password': 'Récupérez l\'accès à votre compte', 'reset-password': 'Sécurisez votre compte', 'verify-email': 'Consultez votre boîte mail', 'verify-phone': 'Entrez le code reçu' }[mode])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg" whileHover={{ scale: 1.05 }}>
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">{APP_CONFIG.name}</h1>
          <p className="text-slate-600">{APP_CONFIG.tagline}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>{getDesc()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div key={`${mode}-${step}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                
                {/* LOGIN */}
                {mode === 'login' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2">
                      <Info className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-teal-700">
                        <strong>Démo :</strong> aidant@demo.fr / demo1234 &nbsp;|&nbsp; medecin@demo.fr / demo1234
                      </div>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                      <Button variant="ghost" className={cn('flex-1 rounded-md', authMethod === 'email' && 'bg-white shadow-sm')} onClick={() => setAuthMethod('email')}>
                        <Mail className="w-4 h-4 mr-2" />Email
                      </Button>
                      <Button variant="ghost" className={cn('flex-1 rounded-md', authMethod === 'phone' && 'bg-white shadow-sm')} onClick={() => setAuthMethod('phone')}>
                        <Phone className="w-4 h-4 mr-2" />SMS
                      </Button>
                    </div>
                    {authMethod === 'email' ? (
                      <>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input type="email" placeholder="marie@email.fr" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="pl-10" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                          </div>
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Mot de passe</Label>
                            <Button variant="link" className="p-0 text-xs text-teal-600 h-auto" onClick={() => setMode('forgot-password')}>Oublié ?</Button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={e => updateForm('password', e.target.value)} className="pl-10 pr-10" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label>Numéro de téléphone</Label>
                        <div className="flex gap-2">
                          <select className="w-28 h-10 px-2 border rounded-lg text-sm bg-white" value={formData.countryCode} onChange={e => updateForm('countryCode', e.target.value)}>
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dialCode}</option>)}
                          </select>
                          <Input type="tel" placeholder="6 00 00 00 00" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="flex-1" />
                        </div>
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                      </div>
                    )}
                  </div>
                )}

                {/* REGISTER STEP 1 */}
                {mode === 'register' && step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Votre profil</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {USER_ROLES.map(role => {
                          const Icon = role.icon
                          return (
                            <motion.div key={role.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Card className={cn('cursor-pointer transition-all h-full', formData.role === role.id ? 'ring-2 ring-teal-500 border-teal-500' : 'hover:border-slate-300')} onClick={() => updateForm('role', role.id)}>
                                <CardContent className="p-4 text-center">
                                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2', role.color === 'teal' && 'bg-teal-100', role.color === 'blue' && 'bg-blue-100', role.color === 'purple' && 'bg-purple-100', role.color === 'orange' && 'bg-orange-100')}>
                                    <Icon className={cn('w-5 h-5', role.color === 'teal' && 'text-teal-600', role.color === 'blue' && 'text-blue-600', role.color === 'purple' && 'text-purple-600', role.color === 'orange' && 'text-orange-600')} />
                                  </div>
                                  <p className="font-medium text-xs">{role.label}</p>
                                  <p className="text-[10px] text-slate-500 mt-1">{role.description}</p>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Marie Dupont" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="pl-10" />
                      </div>
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="email" placeholder="marie@email.fr" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="pl-10" />
                      </div>
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Pays</Label>
                      <select className="w-full h-10 px-3 border rounded-lg text-sm bg-white" value={formData.countryCode} onChange={e => updateForm('countryCode', e.target.value)}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* REGISTER STEP 2 */}
                {mode === 'register' && step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="ghost" size="sm" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-1" />Retour</Button>
                      <Badge variant="secondary">Étape 2/2 – {ROLE_CONFIG[formData.role].label}</Badge>
                    </div>
                    <div className="space-y-2">
                      <Label>Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 caractères" value={formData.password} onChange={e => updateForm('password', e.target.value)} className="pl-10 pr-10" />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {formData.password.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {[2,4,6,8].map((t, i) => <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', formData.password.length >= t ? 'bg-green-500' : 'bg-slate-200')} />)}
                        </div>
                      )}
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} className="pl-10 pr-10" />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {formData.password && formData.confirmPassword && (
                        <div className="flex items-center gap-1 text-xs">
                          {formData.password === formData.confirmPassword
                            ? <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-green-600">Les mots de passe correspondent</span></>
                            : <><AlertCircle className="w-3 h-3 text-red-500" /><span className="text-red-500">Ne correspondent pas</span></>}
                        </div>
                      )}
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" id="terms" checked={formData.acceptTerms} onChange={e => updateForm('acceptTerms', e.target.checked)} className="mt-1" />
                      <Label htmlFor="terms" className="text-sm font-normal">
                        J'accepte les <button className="text-teal-600 hover:underline" type="button">conditions d'utilisation</button> et la <button className="text-teal-600 hover:underline" type="button">politique de confidentialité</button>
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}
                  </div>
                )}

                {/* FORGOT PASSWORD */}
                {mode === 'forgot-password' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-7 h-7 text-teal-600" />
                      </div>
                      <p className="text-slate-600 text-sm">Entrez votre email pour recevoir un lien de réinitialisation</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="email" placeholder="marie@email.fr" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="pl-10" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                      </div>
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>
                )}

                {/* RESET PASSWORD */}
                {mode === 'reset-password' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Shield className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <p className="text-slate-600 text-sm">Choisissez un nouveau mot de passe</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={e => updateForm('password', e.target.value)} className="pr-10" />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmer</Label>
                      <Input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}

                {/* VERIFY EMAIL */}
                {mode === 'verify-email' && (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-10 h-10 text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold">Vérifiez votre email</h2>
                    <p className="text-slate-600">Nous avons envoyé un lien à <strong>{formData.email}</strong></p>
                    <Button variant="outline" onClick={() => forgotPassword(formData.email)}>Renvoyer l'email</Button>
                  </div>
                )}

                {/* VERIFY PHONE */}
                {mode === 'verify-phone' && (
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-8 h-8 text-teal-600" />
                      </div>
                      <h3 className="font-semibold">Vérification SMS</h3>
                      <p className="text-sm text-slate-500 mt-1">Code envoyé au <strong>{pendingPhone}</strong></p>
                    </div>
                    <div className="space-y-2">
                      <Label>Code de vérification</Label>
                      <Input type="text" placeholder="000000" value={formData.otpCode} onChange={e => updateForm('otpCode', e.target.value.replace(/\D/g,'').slice(0,6))} className="text-center text-2xl tracking-widest" maxLength={6} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                      {errors.otpCode && <p className="text-sm text-red-500">{errors.otpCode}</p>}
                      <p className="text-xs text-slate-500 text-center">Mode démo : entrez n'importe quel code à 6 chiffres</p>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-600">{errors.submit}</span>
              </div>
            )}

            {mode !== 'verify-email' && (
              <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                {!isLoading && ({ login: authMethod === 'email' ? 'Se connecter' : 'Recevoir le code', register: step === 1 ? 'Continuer' : 'Créer mon compte', 'forgot-password': 'Envoyer le lien', 'reset-password': 'Réinitialiser', 'verify-phone': 'Vérifier', 'verify-email': '' }[mode])}
              </Button>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Ou continuer avec</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="w-full" onClick={() => handleOAuth('google')} disabled={isLoading}><Chrome className="w-4 h-4 mr-1" />Google</Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuth('facebook')} disabled={isLoading}><Facebook className="w-4 h-4 mr-1 text-blue-600" />Facebook</Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuth('apple')} disabled={isLoading}><Apple className="w-4 h-4 mr-1" />Apple</Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t pt-4">
            {mode === 'login' && (
              <p className="text-sm text-slate-500 text-center">
                Pas encore de compte ?{' '}
                <Button variant="link" className="p-0 text-teal-600 h-auto" onClick={() => { setMode('register'); setStep(1) }}>Créer un compte</Button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-sm text-slate-500 text-center">
                Déjà inscrit ?{' '}
                <Button variant="link" className="p-0 text-teal-600 h-auto" onClick={() => setMode('login')}>Se connecter</Button>
              </p>
            )}
            {(mode === 'forgot-password' || mode === 'reset-password' || mode === 'verify-email') && (
              <Button variant="ghost" className="w-full" onClick={() => setMode('login')}>
                <ArrowLeft className="w-4 h-4 mr-2" />Retour à la connexion
              </Button>
            )}
            {mode === 'verify-phone' && (
              <Button variant="ghost" className="w-full" onClick={() => { setMode('login'); setAuthMethod('phone') }}>
                <ArrowLeft className="w-4 h-4 mr-2" />Changer le numéro
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Connexion sécurisée • Données chiffrées</span>
        </div>
        <Button variant="ghost" className="w-full mt-2" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Retour au site
        </Button>
      </motion.div>
    </div>
  )
}

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
