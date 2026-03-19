'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Heart, MessageSquare, Share2, ThumbsUp, Filter, Search,
  MapPin, Clock, User, ChevronRight, X, CheckCircle, Camera,
  Sparkles, Award, TrendingUp, Globe, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// Types
interface Testimonial {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userLocation: string
  userCountry: string
  relationshipType: string
  careDuration: string
  rating: number
  title: string
  content: string
  photoUrl?: string
  isAnonymous: boolean
  status: 'pending' | 'approved' | 'rejected'
  featured: boolean
  helpful: number
  createdAt: Date
  language: string
}

// Mock Data
const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    userId: 'u1',
    userName: 'Marie L.',
    userLocation: 'Dakar, Sénégal',
    userCountry: 'SN',
    relationshipType: 'Mère',
    careDuration: '3 ans',
    rating: 5,
    title: 'CareCircle a changé ma vie d\'aidante',
    content: 'En tant que fille aidant ma mère atteinte d\'Alzheimer, je me sentais seule et dépassée. Depuis que j\'utilise CareCircle, j\'ai accès à un accompagnement 24h/24 avec l\'assistant Cleo. Les rappels de médicaments m\'ont évité tant d\'erreurs ! La communauté m\'a permis de trouver du soutien moral. Je recommande vivement.',
    photoUrl: null,
    isAnonymous: false,
    status: 'approved',
    featured: true,
    helpful: 156,
    createdAt: new Date(Date.now() - 86400000 * 5),
    language: 'fr',
  },
  {
    id: 't2',
    userId: 'u2',
    userName: 'Jean-Pierre M.',
    userLocation: 'Paris, France',
    userCountry: 'FR',
    relationshipType: 'Père',
    careDuration: '2 ans',
    rating: 5,
    title: 'Indispensable pour suivre les rendez-vous',
    content: 'Mon père a de nombreux rendez-vous médicaux chaque mois. CareCircle me permet de tout centraliser et de ne jamais en manquer un. L\'export PDF pour les médecins est très pratique. L\'application est intuitive et le support est très réactif.',
    photoUrl: null,
    isAnonymous: false,
    status: 'approved',
    featured: true,
    helpful: 89,
    createdAt: new Date(Date.now() - 86400000 * 10),
    language: 'fr',
  },
  {
    id: 't3',
    userId: 'u3',
    userName: 'Aminata D.',
    userLocation: 'Abidjan, Côte d\'Ivoire',
    userCountry: 'CI',
    relationshipType: 'Grand-mère',
    careDuration: '1 an',
    rating: 5,
    title: 'Une aide précieuse au quotidien',
    content: 'Je m\'occupe de ma grand-mère et CareCircle m\'aide énormément. Le suivi des médicaments avec les rappels est excellent. Je peux aussi noter ses symptômes et les partager avec le médecin. L\'application est disponible même avec une connexion internet lente.',
    photoUrl: null,
    isAnonymous: false,
    status: 'approved',
    featured: false,
    helpful: 67,
    createdAt: new Date(Date.now() - 86400000 * 15),
    language: 'fr',
  },
  {
    id: 't4',
    userId: 'u4',
    userName: 'Sophie K.',
    userLocation: 'Lyon, France',
    userCountry: 'FR',
    relationshipType: 'Conjoint',
    careDuration: '4 ans',
    rating: 5,
    title: 'Un réconfort au quotidien',
    content: 'Mon mari est atteint de Parkinson. CareCircle et surtout l\'assistant Cleo me permettent de poser mes questions à toute heure, même la nuit quand l\'angoisse me gagne. Le suivi de bien-être m\'aide à prendre soin de moi aussi.',
    photoUrl: null,
    isAnonymous: false,
    status: 'approved',
    featured: true,
    helpful: 134,
    createdAt: new Date(Date.now() - 86400000 * 20),
    language: 'fr',
  },
  {
    id: 't5',
    userId: 'u5',
    userName: 'Ibrahima S.',
    userLocation: 'Bamako, Mali',
    userCountry: 'ML',
    relationshipType: 'Mère',
    careDuration: '6 mois',
    rating: 4,
    title: 'Très utile pour les nouveaux aidants',
    content: 'Je viens de commencer à m\'occuper de ma mère et CareCircle m\'a guidé dès le début. Les ressources sont très bien faites. J\'apprécie particulièrement la communauté où j\'ai pu poser mes questions sans jugement.',
    photoUrl: null,
    isAnonymous: false,
    status: 'approved',
    featured: false,
    helpful: 45,
    createdAt: new Date(Date.now() - 86400000 * 25),
    language: 'fr',
  },
  {
    id: 't6',
    userId: 'u6',
    userName: 'Claire D.',
    userLocation: 'Bruxelles, Belgique',
    userCountry: 'BE',
    relationshipType: 'Père',
    careDuration: '5 ans',
    rating: 5,
    title: 'Le meilleur outil pour les aidants',
    content: 'J\'ai testé plusieurs applications et CareCircle est de loin la plus complète. L\'interface est claire, les fonctionnalités sont pensées par des aidants pour des aidants. Le prix est raisonnable et le service client excellent.',
    photoUrl: null,
    isAnonymous: false,
    status: 'approved',
    featured: false,
    helpful: 78,
    createdAt: new Date(Date.now() - 86400000 * 30),
    language: 'fr',
  },
]

const RELATIONSHIP_TYPES = [
  'Père', 'Mère', 'Conjoint(e)', 'Enfant', 'Frère/Sœur', 
  'Grand-parent', 'Oncle/Tante', 'Ami(e)', 'Autre'
]

const CARE_DURATIONS = [
  'Moins de 6 mois', '6 mois - 1 an', '1-2 ans', '2-5 ans', 'Plus de 5 ans'
]

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'KE', name: 'Kenya' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'OTHER', name: 'Autre pays' },
]

// Star Rating Component
function StarRating({ rating, onChange, readonly = false, size = 'md' }: {
  rating: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            'focus:outline-none transition-colors',
            readonly && 'cursor-default'
          )}
          onClick={() => onChange?.(star)}
          whileHover={!readonly ? { scale: 1.1 } : undefined}
          whileTap={!readonly ? { scale: 0.9 } : undefined}
        >
          <Star
            className={cn(
              sizes[size],
              star <= rating 
                ? 'text-amber-400 fill-amber-400' 
                : 'text-slate-300'
            )}
          />
        </motion.button>
      ))}
    </div>
  )
}

// Testimonial Card Component
function TestimonialCard({ testimonial, onHelpful }: { 
  testimonial: Testimonial
  onHelpful?: (id: string) => void 
}) {
  const [isHelpful, setIsHelpful] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all',
        testimonial.featured && 'ring-2 ring-amber-400 border-amber-200'
      )}
    >
      {testimonial.featured && (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-t-2xl border-b border-amber-200">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Témoignage mis en avant</span>
          </div>
        </div>
      )}
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-teal-100">
            <AvatarFallback className="bg-teal-100 text-teal-700">
              {testimonial.userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{testimonial.userName}</span>
              {testimonial.isAnonymous && (
                <Badge variant="secondary" className="text-xs">Anonyme</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{testimonial.userLocation}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={testimonial.rating} readonly size="sm" />
              <span className="text-xs text-slate-400">
                {testimonial.createdAt.toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            {testimonial.relationshipType}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {testimonial.careDuration}
          </Badge>
        </div>
        
        {/* Content */}
        <h4 className="font-semibold text-slate-800 mb-2">{testimonial.title}</h4>
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
          {testimonial.content}
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-1.5',
                isHelpful && 'text-teal-600 bg-teal-50'
              )}
              onClick={() => {
                setIsHelpful(!isHelpful)
                onHelpful?.(testimonial.id)
              }}
            >
              <ThumbsUp className={cn('w-4 h-4', isHelpful && 'fill-current')} />
              <span>{testimonial.helpful + (isHelpful ? 1 : 0)}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Partager</span>
            </Button>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            {COUNTRIES.find(c => c.code === testimonial.userCountry)?.name || testimonial.userCountry}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

// Submit Testimonial Dialog
function SubmitTestimonialDialog({ onSubmit, open, onOpenChange }: {
  onSubmit: (testimonial: Partial<Testimonial>) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    relationshipType: '',
    careDuration: '',
    rating: 5,
    title: '',
    content: '',
    userLocation: '',
    userCountry: 'FR',
    isAnonymous: false,
  })
  const { toast } = useToast()

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      status: 'pending',
      featured: false,
      helpful: 0,
      language: 'fr',
    })
    toast({
      title: 'Témoignage envoyé !',
      description: 'Il sera publié après modération dans les 24h.',
    })
    onOpenChange(false)
    setStep(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-600" />
            Partager votre expérience
          </DialogTitle>
          <DialogDescription>
            Votre témoignage peut aider d'autres aidants. Merci de votre contribution !
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-teal-600' : 'bg-slate-200'
              )}
            />
          ))}
        </div>
        
        <div className="space-y-4">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <Label>Votre relation avec la personne aidée</Label>
                <Select 
                  value={formData.relationshipType} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, relationshipType: v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Depuis combien de temps êtes-vous aidant ?</Label>
                <Select 
                  value={formData.careDuration} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, careDuration: v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARE_DURATIONS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Votre pays</Label>
                <Select 
                  value={formData.userCountry} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, userCountry: v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Votre ville (optionnel)</Label>
                <Input
                  value={formData.userLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, userLocation: e.target.value }))}
                  placeholder="Paris, Dakar, Abidjan..."
                  className="mt-1.5"
                />
              </div>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <Label>Comment évaluez-vous CareCircle ?</Label>
                <div className="flex items-center gap-3 mt-2">
                  <StarRating 
                    rating={formData.rating} 
                    onChange={(r) => setFormData(prev => ({ ...prev, rating: r }))}
                    size="lg"
                  />
                  <span className="text-lg font-medium text-slate-700">
                    {formData.rating}/5
                  </span>
                </div>
              </div>
              
              <div>
                <Label>Titre de votre témoignage</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="En quelques mots, résumez votre expérience"
                  className="mt-1.5"
                  maxLength={100}
                />
                <p className="text-xs text-slate-400 mt-1">{formData.title.length}/100 caractères</p>
              </div>
              
              <div>
                <Label>Votre témoignage</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Décrivez votre expérience avec CareCircle. Comment l'application vous aide-t-elle au quotidien ?"
                  className="mt-1.5 min-h-32"
                  maxLength={1000}
                />
                <p className="text-xs text-slate-400 mt-1">{formData.content.length}/1000 caractères</p>
              </div>
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <h4 className="font-medium text-teal-800 mb-2">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Relation:</span> {formData.relationshipType}</p>
                  <p><span className="text-slate-500">Durée:</span> {formData.careDuration}</p>
                  <p><span className="text-slate-500">Note:</span> {formData.rating}/5 étoiles</p>
                  <p><span className="text-slate-500">Titre:</span> {formData.title}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="mt-1"
                />
                <Label htmlFor="anonymous" className="text-sm font-normal">
                  Publier anonymement (votre nom ne sera pas affiché)
                </Label>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700">
                  Votre témoignage sera examiné par notre équipe avant publication 
                  (généralement sous 24h). Nous nous réservons le droit de modifier 
                  légèrement le texte pour des raisons de clarté.
                </p>
              </div>
            </motion.div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2 mt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.relationshipType || !formData.careDuration)}
            >
              Suivant
            </Button>
          ) : (
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleSubmit}
              disabled={!formData.title || !formData.content}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Envoyer mon témoignage
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Testimonials Page Component
export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(MOCK_TESTIMONIALS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedRating, setSelectedRating] = useState<string>('all')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const { toast } = useToast()

  // Stats
  const stats = useMemo(() => {
    const approved = testimonials.filter(t => t.status === 'approved')
    const avgRating = approved.reduce((sum, t) => sum + t.rating, 0) / approved.length
    return {
      total: approved.length,
      avgRating: avgRating.toFixed(1),
      countries: new Set(approved.map(t => t.userCountry)).size,
      helpful: approved.reduce((sum, t) => sum + t.helpful, 0),
    }
  }, [testimonials])

  // Filtered testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials
      .filter(t => t.status === 'approved')
      .filter(t => {
        if (selectedCountry !== 'all' && t.userCountry !== selectedCountry) return false
        if (selectedRating !== 'all' && t.rating !== parseInt(selectedRating)) return false
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            t.title.toLowerCase().includes(query) ||
            t.content.toLowerCase().includes(query) ||
            t.userName.toLowerCase().includes(query)
          )
        }
        return true
      })
      .sort((a, b) => {
        // Featured first, then by helpful
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.helpful - a.helpful
      })
  }, [testimonials, searchQuery, selectedCountry, selectedRating])

  const handleSubmit = (testimonial: Partial<Testimonial>) => {
    const newTestimonial: Testimonial = {
      id: `t${Date.now()}`,
      userId: 'current_user',
      userName: 'Vous',
      userLocation: testimonial.userLocation || '',
      userCountry: testimonial.userCountry || 'FR',
      relationshipType: testimonial.relationshipType || '',
      careDuration: testimonial.careDuration || '',
      rating: testimonial.rating || 5,
      title: testimonial.title || '',
      content: testimonial.content || '',
      isAnonymous: testimonial.isAnonymous || false,
      status: 'pending',
      featured: false,
      helpful: 0,
      createdAt: new Date(),
      language: 'fr',
    }
    setTestimonials(prev => [newTestimonial, ...prev])
  }

  const handleHelpful = (id: string) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id ? { ...t, helpful: t.helpful + 1 } : t
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">CareCircle</span>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              Retour à l'app
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-4 bg-teal-100 text-teal-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Communauté CareCircle
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Ils nous font confiance
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Découvrez les témoignages d'aidants familiaux qui utilisent CareCircle 
              au quotidien pour accompagner leurs proches.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: stats.total + '+', label: 'Témoignages', icon: MessageSquare },
              { value: stats.avgRating, label: 'Note moyenne', icon: Star },
              { value: stats.countries + ' pays', label: 'Représentés', icon: Globe },
              { value: stats.helpful + '+', label: 'Votes utiles', icon: ThumbsUp },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-4 border text-center shadow-sm"
              >
                <stat.icon className="w-5 h-5 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters & Submit */}
      <section className="py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un témoignage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full sm:w-40">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {COUNTRIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Rating Filter */}
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-full sm:w-32">
                  <Star className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Note" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes notes</SelectItem>
                  <SelectItem value="5">5 étoiles</SelectItem>
                  <SelectItem value="4">4 étoiles</SelectItem>
                  <SelectItem value="3">3 étoiles</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Submit Button */}
              <Button 
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                onClick={() => setShowSubmitDialog(true)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Partager mon expérience
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Aucun témoignage trouvé</h3>
              <p className="text-slate-500 mb-4">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  onHelpful={handleHelpful}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit Dialog */}
      <SubmitTestimonialDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default TestimonialsPage
