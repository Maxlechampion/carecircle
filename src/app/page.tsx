'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts'
import {
  Heart, Calendar, Users, BookOpen, Activity, Bell, Menu, X,
  Send, Plus, Clock, CheckCircle, AlertCircle, ChevronRight, Star,
  Phone, Mail, MapPin, User, Settings, LogOut, Sparkles, Bot,
  HeartPulse, Pill, FileText, Video, Coffee, Brain, HandHeart,
  ThumbsUp, MessageSquare, Bookmark, Search, RefreshCw, Eye, EyeOff,
  ChevronDown, Info, AlertTriangle, CheckCircle2, XCircle,
  Loader2, Zap, Target, Home, Shield, HelpCircle, ExternalLink, Play,
  Crown, Lock, Trash2, Download, Moon, Sun, Globe, Volume2, VolumeX,
  TrendingUp, TrendingDown, Minus, Award, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { OnboardingWizard, OnboardingData } from '@/components/onboarding'
import { CommandPalette } from '@/components/command-palette'
import { SubscriptionProvider, useSubscription } from '@/lib/subscription-context'
import { PricingPage, SubscriptionManager } from '@/lib/pricing-components'

// ============================================
// TYPES
// ============================================

type View = 'landing' | 'dashboard' | 'assistant' | 'care' | 'community' | 'resources' | 'wellness' | 'settings'

interface UserData {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
  preferences: {
    notifications: boolean
    emailNotifications: boolean
    pushNotifications: boolean
    soundEnabled: boolean
    darkMode: boolean
    language: string
  }
}

interface CareRecipientData {
  id: string
  name: string
  relationship: string
  age: number
  conditions: string[]
  notes?: string
}

interface AppointmentData {
  id: string
  title: string
  date: Date
  duration: number
  location: string
  doctorName: string
  type: string
  notes?: string
}

interface MedicationData {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  instructions?: string
  takenToday: Record<string, boolean>
}

interface TaskData {
  id: string
  title: string
  completed: boolean
  priority: string
  dueDate?: Date
}

interface PostData {
  id: string
  title: string
  content: string
  author: { name: string }
  category: string
  likes: number
  comments: number
  isLiked?: boolean
  createdAt: Date
}

interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

interface WellnessData {
  score: number
  stressLevel: number
  sleepHours: number
  mood: number
  physicalActivity: boolean
  lastUpdated: Date
  history: { date: string; score: number; stress: number; sleep: number; mood: number }[]
}

interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: Date
  actionUrl?: string
}

interface SymptomEntry {
  id: string
  date: Date
  symptoms: { name: string; severity: number }[]
  notes: string
  mood: number
  painLevel: number
}

// ============================================
// CONSTANTS & MOCK DATA
// ============================================

const APP_CONFIG = {
  name: 'CareCircle',
  tagline: 'Soutien Intelligent pour Aidants Familiaux',
  version: '2.0.0',
}

const MOCK_USER: UserData = {
  id: 'user_001',
  name: 'Marie Dupont',
  email: 'marie.dupont@email.fr',
  avatar: null,
  role: 'caregiver',
  preferences: {
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    darkMode: false,
    language: 'fr'
  }
}

const MOCK_CARE_RECIPIENT: CareRecipientData = {
  id: 'recipient_001',
  name: 'Jean Dupont',
  relationship: 'Père',
  age: 78,
  conditions: ['Maladie d\'Alzheimer', 'Hypertension artérielle'],
  notes: 'Attention aux chutes, préfère les repas légers le soir.'
}

const MOCK_APPOINTMENTS: AppointmentData[] = [
  { id: 'apt_001', title: 'Consultation Dr. Martin - Neurologue', date: new Date(Date.now() + 86400000), duration: 30, location: 'Cabinet Médical République, Paris 11e', doctorName: 'Dr. Sophie Martin', type: 'medical' },
  { id: 'apt_002', title: 'Séance de kinésithérapie', date: new Date(Date.now() + 172800000), duration: 45, location: 'Centre de Rééducation Saint-Maurice', doctorName: 'Mme. Leroy', type: 'therapy' },
  { id: 'apt_003', title: 'Bilan sanguin complet', date: new Date(Date.now() + 432000000), duration: 15, location: 'Laboratoire Central', doctorName: 'Laboratoire', type: 'medical', notes: 'À jeun depuis 12h' }
]

const MOCK_MEDICATIONS: MedicationData[] = [
  { id: 'med_001', name: 'Aricept (Donépézil)', dosage: '10 mg', frequency: 'Une fois par jour', times: ['08:00'], instructions: 'À prendre au petit-déjeuner', takenToday: { '08:00': true } },
  { id: 'med_002', name: 'Lasilix (Furosémide)', dosage: '40 mg', frequency: 'Une fois par jour', times: ['08:00'], instructions: 'À prendre le matin', takenToday: { '08:00': true } },
  { id: 'med_003', name: 'Kardegic', dosage: '75 mg', frequency: 'Une fois par jour', times: ['20:00'], instructions: 'À prendre au dîner', takenToday: { '20:00': false } }
]

const MOCK_TASKS: TaskData[] = [
  { id: 'task_001', title: 'Préparer le pilulier de la semaine', completed: true, priority: 'high' },
  { id: 'task_002', title: 'Appeler l\'infirmière', completed: false, priority: 'medium' },
  { id: 'task_003', title: 'Renouveler l\'ordonnance', completed: false, priority: 'urgent' },
  { id: 'task_004', title: 'Promenade au parc', completed: false, priority: 'low' }
]

const MOCK_POSTS: PostData[] = [
  { id: 'post_001', title: 'Comment gérez-vous les troubles du sommeil ?', content: 'Mon père a beaucoup de difficultés à dormir depuis quelques semaines. J\'ai essayé plusieurs approches mais sans grand succès. Avez-vous des conseils ?', author: { name: 'Claire M.' }, category: 'alzheimer', likes: 24, comments: 8, isLiked: false, createdAt: new Date(Date.now() - 7200000) },
  { id: 'post_002', title: 'Mon expérience avec l\'orthophoniste', content: 'Après 6 mois de séances, je vois une vraie amélioration. Je partage mon retour d\'expérience...', author: { name: 'Pierre L.' }, category: 'temoignage', likes: 45, comments: 12, isLiked: true, createdAt: new Date(Date.now() - 18000000) },
  { id: 'post_003', title: 'Aides financières disponibles en 2025', content: 'J\'ai compilé toutes les aides auxquelles vous pouvez prétendre en tant qu\'aidant familial...', author: { name: 'Sophie D.' }, category: 'ressources', likes: 89, comments: 23, isLiked: false, createdAt: new Date(Date.now() - 86400000) }
]

const generateWellnessHistory = () => {
  const history = []
  const baseTime = Date.now()
  for (let i = 6; i >= 0; i--) {
    const dayTime = baseTime - (i * 24 * 60 * 60 * 1000)
    const date = new Date(dayTime)
    // Use fixed values based on day index for consistency
    const dayIndex = 6 - i
    history.push({
      date: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][dayIndex] || 'Lun',
      score: 60 + ((dayIndex * 5) % 30) + 5,
      stress: 3 + (dayIndex % 5),
      sleep: 5 + (dayIndex % 4),
      mood: 2 + (dayIndex % 3)
    })
  }
  return history
}

const getMockTimestamp = (offset: number = 0) => {
  // Return a fixed timestamp string to avoid hydration issues
  return new Date(Date.now() + offset)
}

const MOCK_WELLNESS: WellnessData = {
  score: 72,
  stressLevel: 4,
  sleepHours: 7,
  mood: 3,
  physicalActivity: true,
  lastUpdated: getMockTimestamp(),
  history: generateWellnessHistory()
}

const MOCK_NOTIFICATIONS: NotificationData[] = [
  { id: 'notif_001', title: 'Rappel rendez-vous', message: 'Consultation Dr. Martin demain à 14h30', type: 'reminder', read: false, createdAt: getMockTimestamp(), actionUrl: '#care' },
  { id: 'notif_002', title: 'Médicament pris', message: 'Aricept a été marqué comme pris ce matin', type: 'success', read: true, createdAt: getMockTimestamp(-3600000) },
  { id: 'notif_003', title: 'Nouveau message', message: 'Claire M. a répondu à votre discussion', type: 'social', read: false, createdAt: getMockTimestamp(-7200000), actionUrl: '#community' },
  { id: 'notif_004', title: 'Conseil du jour', message: 'Prenez 15 minutes pour vous aujourd\'hui', type: 'tip', read: false, createdAt: getMockTimestamp(-10800000) }
]

const MOCK_SYMPTOMS: SymptomEntry[] = [
  { id: 'symp_001', date: new Date(Date.now() - 86400000 * 2), symptoms: [{ name: 'Fatigue', severity: 3 }, { name: 'Confusion', severity: 2 }], notes: 'Journée difficile', mood: 2, painLevel: 1 },
  { id: 'symp_002', date: new Date(Date.now() - 86400000), symptoms: [{ name: 'Fatigue', severity: 2 }, { name: 'Anxiété', severity: 1 }], notes: 'Meilleure journée', mood: 3, painLevel: 0 },
]

const RESOURCES = [
  { id: 'res_001', icon: BookOpen, title: 'Guide complet Alzheimer', desc: 'Tout savoir sur l\'accompagnement au quotidien', type: 'Guide PDF', duration: '45 min', downloads: 1234 },
  { id: 'res_002', icon: Video, title: 'Gestion du stress', desc: 'Techniques de relaxation pour aidants', type: 'Webinaire', duration: '1h 15min', downloads: 892 },
  { id: 'res_003', icon: Coffee, title: 'L\'art de prendre du répit', desc: 'Comment trouver des moments de pause', type: 'Article', duration: '15 min', downloads: 2341 },
  { id: 'res_004', icon: HeartPulse, title: 'Nutrition et personnes âgées', desc: 'Conseils nutritionnels adaptés', type: 'Guide', duration: '30 min', downloads: 1567 },
  { id: 'res_005', icon: Brain, title: 'Prévenir le burnout', desc: 'Reconnaître les signes précoces', type: 'Formation', duration: '2h', downloads: 987 },
  { id: 'res_006', icon: Phone, title: 'Aides financières 2025', desc: 'APA, PCH, allocations actualisées', type: 'Ressource', duration: '20 min', downloads: 3456 }
]

const COMMUNITY_GROUPS = [
  { id: 'g1', name: 'Maladie d\'Alzheimer', members: '2.3k', color: 'bg-purple-100 text-purple-700' },
  { id: 'g2', name: 'Accompagnement cancer', members: '1.8k', color: 'bg-pink-100 text-pink-700' },
  { id: 'g3', name: 'Handicap & autonomie', members: '1.5k', color: 'bg-blue-100 text-blue-700' },
  { id: 'g4', name: 'Personnes âgées', members: '3.1k', color: 'bg-teal-100 text-teal-700' }
]

const SYMPTOM_OPTIONS = [
  'Fatigue', 'Confusion', 'Anxiété', 'Agitation', 'Troubles du sommeil',
  'Perte d\'appétit', 'Douleur', 'Vertiges', 'Troubles de l\'humeur', 'Autre'
]

// ============================================
// UTILITY FUNCTIONS
// ============================================

const cn = (...classes: (string | boolean | undefined | null)[]): string => classes.filter(Boolean).join(' ')

const generateId = () => Math.random().toString(36).substring(2, 9)

const formatDate = (date: Date, format: 'short' | 'relative' | 'full' = 'short'): string => {
  if (format === 'relative') {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return date.toLocaleDateString('fr-FR')
  }
  if (format === 'full') {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatTime = (date: Date): string => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// ============================================
// CUSTOM HOOKS
// ============================================

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch {
      console.error('Error saving to localStorage')
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

// ============================================
// SHARED COMPONENTS
// ============================================

function CardSkeleton() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

function ErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Alert variant="destructive" className="max-w-md mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Une erreur est survenue</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{error.message || 'Impossible de charger ce contenu.'}</p>
        <Button variant="outline" size="sm" onClick={retry} className="mt-3">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-4 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-teal-600 hover:bg-teal-700">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// ============================================
// MAIN APPLICATION COMPONENT
// ============================================

function CareCircleAppContent() {
  // State
  const [currentView, setCurrentView] = useState<View>('landing')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState<string | null>(null)
  
  // Persistent State
  const [user, setUser] = useLocalStorage<UserData>('carecircle_user', MOCK_USER)
  const [careRecipient, setCareRecipient] = useLocalStorage<CareRecipientData>('carecircle_recipient', MOCK_CARE_RECIPIENT)
  const [appointments, setAppointments] = useLocalStorage<AppointmentData[]>('carecircle_appointments', MOCK_APPOINTMENTS)
  const [medications, setMedications] = useLocalStorage<MedicationData[]>('carecircle_medications', MOCK_MEDICATIONS)
  const [tasks, setTasks] = useLocalStorage<TaskData[]>('carecircle_tasks', MOCK_TASKS)
  const [wellness, setWellness] = useLocalStorage<WellnessData>('carecircle_wellness', MOCK_WELLNESS)
  const [notifications, setNotifications] = useLocalStorage<NotificationData[]>('carecircle_notifications', MOCK_NOTIFICATIONS)
  const [posts, setPosts] = useLocalStorage<PostData[]>('carecircle_posts', MOCK_POSTS)
  const [symptoms, setSymptoms] = useLocalStorage<SymptomEntry[]>('carecircle_symptoms', MOCK_SYMPTOMS)
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessageData[]>('carecircle_chat', [
    { id: 'msg_001', role: 'assistant', content: `Bonjour ${MOCK_USER.name.split(' ')[0]} ! 👋 Je suis Cleo, votre assistant CareCircle. Comment puis-je vous aider aujourd'hui ?`, timestamp: new Date() }
  ])
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('carecircle_onboarded', false)
  
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { plan } = useSubscription()
  
  // Computed
  const unreadNotifications = useMemo(() => notifications.filter(n => !n.read).length, [notifications])
  const completedTasksCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks])
  const medsTaken = useMemo(() => medications.reduce((acc, m) => acc + Object.values(m.takenToday).filter(Boolean).length, 0), [medications])
  const totalMeds = useMemo(() => medications.reduce((acc, m) => acc + m.times.length, 0), [medications])
  
  // Effects
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  useEffect(() => {
    // Check if onboarding should be shown
    if (!hasCompletedOnboarding && currentView !== 'landing') {
      setShowOnboarding(true)
    }
  }, [hasCompletedOnboarding, currentView])
  
  // Handlers
  const handleTaskToggle = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))
    toast({ title: 'Tâche mise à jour', description: 'Modification enregistrée' })
  }, [setTasks, toast])
  
  const handleMedToggle = useCallback((medId: string, time: string) => {
    setMedications(prev => prev.map(m => {
      if (m.id === medId) {
        return { ...m, takenToday: { ...m.takenToday, [time]: !m.takenToday[time] } }
      }
      return m
    }))
    toast({ title: 'Médicament enregistré' })
  }, [setMedications, toast])
  
  const handlePostLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked }
      }
      return p
    }))
  }, [setPosts])
  
  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return
    
    const userMsg: ChatMessageData = { id: generateId(), role: 'user', content: chatInput.trim(), timestamp: new Date() }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsChatLoading(true)
    
    const loadingId = generateId()
    setChatMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '', timestamp: new Date(), isLoading: true }])
    
    try {
      // Call the AI chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
          userId: user.id,
          plan: plan
        })
      })
      
      const data = await response.json()
      
      if (data.remaining !== undefined) {
        setRemainingMessages(data.remaining)
      }
      
      setChatMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: data.message, isLoading: false } : m))
    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages(prev => prev.map(m => m.id === loadingId ? { 
        ...m, 
        content: "Je suis désolé, une erreur s'est produite. Veuillez réessayer.", 
        isLoading: false 
      } : m))
    } finally {
      setIsChatLoading(false)
    }
  }, [chatInput, isChatLoading, setChatMessages, chatMessages, user.id, plan])
  
  const handleWellnessUpdate = useCallback((updates: Partial<WellnessData>) => {
    setWellness(prev => {
      const newHistory = [...prev.history]
      if (newHistory.length >= 7) newHistory.shift()
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short' })
      const existingIndex = newHistory.findIndex(h => h.date === today)
      
      const newEntry = {
        date: today,
        score: prev.score,
        stress: prev.stressLevel,
        sleep: prev.sleepHours,
        mood: prev.mood
      }
      
      if (existingIndex >= 0) {
        newHistory[existingIndex] = { ...newEntry, ...updates }
      } else {
        newHistory.push({ ...newEntry, ...updates })
      }
      
      return { ...prev, ...updates, lastUpdated: new Date(), history: newHistory }
    })
    toast({ title: 'Bien-être mis à jour' })
  }, [setWellness, toast])
  
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast({ title: 'Notifications lues' })
  }, [setNotifications, toast])

  const handleOnboardingComplete = useCallback((data: OnboardingData) => {
    // Save onboarding data
    setUser(prev => ({
      ...prev,
      name: data.userName || prev.name,
      email: data.userEmail || prev.email,
      preferences: {
        ...prev.preferences,
        emailNotifications: data.notifications.email,
        pushNotifications: data.notifications.push
      }
    }))
    
    if (data.recipientName) {
      setCareRecipient(prev => ({
        ...prev,
        name: data.recipientName,
        age: data.recipientAge,
        relationship: data.recipientRelationship,
        conditions: data.conditions
      }))
    }
    
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
    toast({ 
      title: 'Bienvenue sur CareCircle !', 
      description: 'Votre compte est configuré. Commencez à explorer.',
      duration: 5000
    })
  }, [setUser, setCareRecipient, setHasCompletedOnboarding, toast])

  const handleCommandAction = useCallback((action: string) => {
    switch (action) {
      case 'new-appointment':
        setShowAddDialog('appointment')
        break
      case 'new-medication':
        setShowAddDialog('medication')
        break
      case 'new-post':
        setCurrentView('community')
        break
      case 'log-symptom':
        setCurrentView('care')
        break
      case 'subscription':
        setCurrentView('settings')
        break
      case 'logout':
        setCurrentView('landing')
        toast({ title: 'Déconnexion réussie' })
        break
      default:
        break
    }
  }, [toast])

  const handleExportData = useCallback(() => {
    const data = {
      user,
      careRecipient,
      appointments,
      medications,
      tasks,
      wellness,
      symptoms,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carecircle_export_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({ title: 'Export réussi', description: 'Vos données ont été téléchargées' })
  }, [user, careRecipient, appointments, medications, tasks, wellness, symptoms, toast])
  
  const retry = useCallback(() => {
    setError(null)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }, [])
  
  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  
  const renderLanding = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-teal-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">{APP_CONFIG.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Témoignages</a>
              <Button onClick={() => setCurrentView('dashboard')} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md hover:shadow-lg transition-shadow">
                Accéder à l'app <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <Button variant="ghost" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-white border-b p-4"
          >
            <a href="#features" className="block py-2 text-slate-600" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#pricing" className="block py-2 text-slate-600" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <Button onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false) }} className="w-full mt-2 bg-teal-600">Accéder à l'app</Button>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-100"><Sparkles className="w-3 h-3 mr-1" /> Nouveau : Assistant IA Cleo</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Le compagnon digital des <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">aidants familiaux</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">{APP_CONFIG.tagline}. Assistant IA, coordination des soins, communauté et ressources.</p>
            <div className="flex gap-4 flex-wrap">
              <Button size="lg" className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 shadow-lg hover:shadow-xl transition-shadow" onClick={() => setCurrentView('dashboard')}>
                Commencer gratuitement <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                    <Video className="w-5 h-5 mr-2" /> Voir la démo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Découvrir CareCircle</DialogTitle>
                    <DialogDescription>Présentation complète de la plateforme</DialogDescription>
                  </DialogHeader>
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                    <Play className="w-16 h-16 text-teal-600" />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-8 flex gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-600" /> 100% gratuit</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" /> Données sécurisées</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-600" /> 24h/24, 7j/7</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <Card className="shadow-2xl shadow-teal-200/50 border-teal-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-teal-200"><AvatarFallback className="bg-teal-100 text-teal-700 text-lg">MD</AvatarFallback></Avatar>
                  <div>
                    <p className="font-semibold text-slate-800">Bonjour {user.name.split(' ')[0]} 👋</p>
                    <p className="text-sm text-slate-500">Comment puis-je vous aider ?</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700"><span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" /> En ligne</Badge>
                </div>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                    <div className="flex items-center gap-3 mb-1"><Bell className="w-4 h-4 text-teal-600" /><span className="font-medium text-slate-700">Rappel</span></div>
                    <p className="text-sm text-slate-600">Rendez-vous Dr. Martin demain à 14h30</p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3 mb-1"><Pill className="w-4 h-4 text-amber-600" /><span className="font-medium text-slate-700">Médicaments</span></div>
                    <p className="text-sm text-slate-600">1 médicament à prendre ce soir</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700"><Activity className="w-3 h-3 mr-1" /> Bien-être : {wellness.score}%</Badge>
                    <Badge variant="secondary" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> {completedTasksCount}/{tasks.length} tâches</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <motion.div 
              className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer" 
              whileHover={{ scale: 1.05, rotate: 5 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('assistant')}
            >
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: '11M+', label: 'Aidants en France', icon: Users },
            { value: '24/7', label: 'Disponibilité', icon: Clock },
            { value: '95%', label: 'Satisfaction', icon: Star },
            { value: '100%', label: 'Gratuit', icon: Heart }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <s.icon className="w-6 h-6 mx-auto mb-2 text-teal-600" />
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-teal-100 text-teal-700">Fonctionnalités</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Des outils pensés par et pour les aidants familiaux</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bot, title: 'Assistant IA Cleo', desc: 'Compagnon intelligent disponible 24h/24 pour répondre à vos questions et vous guider', color: 'teal' },
              { icon: Calendar, title: 'Coordination soins', desc: 'Calendrier médical, suivi des médicaments et gestion des rendez-vous', color: 'cyan' },
              { icon: Users, title: 'Communauté', desc: 'Échangez avec d\'autres aidants, partagez vos expériences et obtenez du soutien', color: 'blue' },
              { icon: Brain, title: 'Bien-être', desc: 'Suivi du stress, de l\'humeur et prévention du burnout de l\'aidant', color: 'purple' },
              { icon: BookOpen, title: 'Ressources', desc: 'Guides pratiques, formations et webinaires adaptés à votre situation', color: 'orange' },
              { icon: Activity, title: 'Suivi santé', desc: 'Journal des symptômes et historique de santé de votre proche', color: 'rose' }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                  <CardHeader>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform', 
                      f.color === 'teal' && 'bg-teal-100', 
                      f.color === 'cyan' && 'bg-cyan-100', 
                      f.color === 'blue' && 'bg-blue-100', 
                      f.color === 'purple' && 'bg-purple-100', 
                      f.color === 'orange' && 'bg-orange-100', 
                      f.color === 'rose' && 'bg-rose-100'
                    )}>
                      <f.icon className={cn('w-6 h-6', 
                        f.color === 'teal' && 'text-teal-600', 
                        f.color === 'cyan' && 'text-cyan-600', 
                        f.color === 'blue' && 'text-blue-600', 
                        f.color === 'purple' && 'text-purple-600', 
                        f.color === 'orange' && 'text-orange-600', 
                        f.color === 'rose' && 'text-rose-600'
                      )} />
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <PricingPage compact />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwIDItMiAyLTQtMi0yLTQtMi00LTJzLTIgMi00IDJjMCAwLTItMi0yLTQtMiAyLTQgMi00IDJzMi0yIDQtMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <CardContent className="p-12 text-center relative">
              <HandHeart className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Rejoignez des milliers d'aidants</h2>
              <p className="text-teal-100 mb-8 max-w-lg mx-auto">Parce que vous méritez d'être accompagné. Créez votre compte gratuit en moins de 2 minutes.</p>
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg" onClick={() => setCurrentView('dashboard')}>
                Créer mon compte gratuit <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div>
              <span className="font-bold text-white">{APP_CONFIG.name}</span>
            </div>
            <p className="text-sm text-slate-400">{APP_CONFIG.tagline}</p>
          </div>
          <div><h4 className="font-semibold text-white mb-4">Produit</h4><ul className="space-y-2 text-sm"><li><a href="#features" className="hover:text-teal-400 transition-colors">Fonctionnalités</a></li><li><a href="#pricing" className="hover:text-teal-400 transition-colors">Tarifs</a></li><li><a href="#" className="hover:text-teal-400 transition-colors">Témoignages</a></li></ul></div>
          <div><h4 className="font-semibold text-white mb-4">Ressources</h4><ul className="space-y-2 text-sm"><li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li><li><a href="#" className="hover:text-teal-400 transition-colors">Guides</a></li><li><a href="#" className="hover:text-teal-400 transition-colors">FAQ</a></li></ul></div>
          <div><h4 className="font-semibold text-white mb-4">Contact</h4><p className="text-sm mb-2">support@carecircle.fr</p><p className="text-sm text-slate-400">Ligne d'écoute: 0 800 000 000</p></div>
        </div>
        <Separator className="my-8 bg-slate-800" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2025 {APP_CONFIG.name}. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-teal-400 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-teal-400 transition-colors">CGU</a>
          </div>
        </div>
      </footer>
    </div>
  )

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 w-72 bg-white border-r transform transition-transform z-40 lg:translate-x-0', mobileMenuOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center"><Heart className="w-6 h-6 text-white" /></div>
            <span className="text-lg font-bold text-slate-800">{APP_CONFIG.name}</span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { view: 'dashboard' as View, icon: Home, label: 'Tableau de bord' },
            { view: 'assistant' as View, icon: Bot, label: 'Assistant Cleo' },
            { view: 'care' as View, icon: HeartPulse, label: 'Soins' },
            { view: 'community' as View, icon: Users, label: 'Communauté' },
            { view: 'resources' as View, icon: BookOpen, label: 'Ressources' },
            { view: 'wellness' as View, icon: Brain, label: 'Bien-être' },
            { view: 'settings' as View, icon: Settings, label: 'Paramètres' }
          ].map(item => (
            <Button 
              key={item.view} 
              variant="ghost" 
              className={cn('w-full justify-start gap-3 transition-all', currentView === item.view && 'bg-teal-50 text-teal-700 border-l-4 border-teal-600')} 
              onClick={() => { setCurrentView(item.view); setMobileMenuOpen(false) }}
            >
              <item.icon className="w-5 h-5" />{item.label}
            </Button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-slate-50">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10"><AvatarFallback className="bg-teal-100 text-teal-700">MD</AvatarFallback></Avatar>
            <div className="flex-1"><p className="text-sm font-medium text-slate-800">{user.name}</p><p className="text-xs text-slate-500">Aidant familial</p></div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-600" onClick={() => setCurrentView('landing')}><ChevronRight className="w-4 h-4 mr-2" />Retour au site</Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-72">
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu className="w-5 h-5" /></Button>
            <h1 className="hidden sm:block text-lg font-semibold text-slate-800">
              {currentView === 'dashboard' && 'Tableau de bord'}
              {currentView === 'assistant' && 'Assistant Cleo'}
              {currentView === 'care' && 'Coordination des soins'}
              {currentView === 'community' && 'Communauté'}
              {currentView === 'resources' && 'Ressources'}
              {currentView === 'wellness' && 'Mon bien-être'}
              {currentView === 'settings' && 'Paramètres'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => setShowCommandPalette(true)}>
              <Search className="w-5 h-5 text-slate-600" />
            </Button>
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative"><Bell className="w-5 h-5 text-slate-600" />
                  {unreadNotifications > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">{unreadNotifications}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <Button variant="ghost" size="sm" className="h-auto py-1 text-xs text-teal-600" onClick={markAllRead}>
                      Tout marquer lu
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={cn('p-3 border-b hover:bg-slate-50 cursor-pointer', !n.read && 'bg-teal-50/50')} 
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'reminder' && <Bell className="w-4 h-4 text-teal-600 mt-0.5" />}
                          {n.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                          {n.type === 'social' && <Users className="w-4 h-4 text-blue-600 mt-0.5" />}
                          {n.type === 'tip' && <Sparkles className="w-4 h-4 text-amber-600 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{formatDate(n.createdAt, 'relative')}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8"><AvatarFallback className="bg-teal-100 text-teal-700 text-sm">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                  <Settings className="w-4 h-4 mr-2" />Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('wellness')}>
                  <Brain className="w-4 h-4 mr-2" />Mon bien-être
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('landing')} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {error && <ErrorFallback error={error} retry={retry} />}
          {isLoading ? (
            <div className="grid gap-6">
              <CardSkeleton />
              <div className="grid md:grid-cols-2 gap-6"><CardSkeleton /><CardSkeleton /></div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && renderDashboardContent()}
              {currentView === 'assistant' && renderAssistant()}
              {currentView === 'care' && renderCare()}
              {currentView === 'community' && renderCommunity()}
              {currentView === 'resources' && renderResources()}
              {currentView === 'wellness' && renderWellness()}
              {currentView === 'settings' && renderSettings()}
            </>
          )}
        </main>
      </div>
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
    </div>
  )

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <h2 className="text-2xl font-bold mb-1">Bonjour, {user.name.split(' ')[0]} 👋</h2>
            <p className="text-teal-100">Voici un aperçu de votre journée. {careRecipient.name} va bien aujourd'hui.</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-white/20 hover:bg-white/30 text-white" onClick={() => setCurrentView('assistant')}><Bot className="w-4 h-4 mr-2" />Parler à Cleo</Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => setShowCommandPalette(true)}>
              <Search className="w-4 h-4 mr-2" />Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bien-être', value: `${wellness.score}%`, icon: Heart, color: 'teal', trend: wellness.score > 70 ? 'up' : wellness.score > 50 ? 'stable' : 'down' },
          { label: 'Tâches', value: `${completedTasksCount}/${tasks.length}`, icon: CheckCircle, color: 'green', trend: completedTasksCount > tasks.length / 2 ? 'up' : 'down' },
          { label: 'Médicaments', value: `${medsTaken}/${totalMeds}`, icon: Pill, color: 'amber', trend: medsTaken === totalMeds ? 'up' : 'down' },
          { label: 'Messages', value: '5', icon: MessageSquare, color: 'blue', trend: 'stable' }
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="cursor-pointer hover:shadow-md transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {s.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                    {s.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform', 
                      s.color === 'teal' && 'bg-teal-100', 
                      s.color === 'green' && 'bg-green-100', 
                      s.color === 'amber' && 'bg-amber-100', 
                      s.color === 'blue' && 'bg-blue-100'
                    )}>
                      <s.icon className={cn('w-4 h-4', 
                        s.color === 'teal' && 'text-teal-600', 
                        s.color === 'green' && 'text-green-600', 
                        s.color === 'amber' && 'text-amber-600', 
                        s.color === 'blue' && 'text-blue-600'
                      )} />
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wellness Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Évolution du bien-être
            </CardTitle>
            <CardDescription>Votre score sur les 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wellness.history}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-600" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Calendar, label: 'Nouveau RDV', color: 'teal', action: () => setShowAddDialog('appointment') },
                { icon: Pill, label: 'Médicament', color: 'amber', action: () => setShowAddDialog('medication') },
                { icon: Activity, label: 'Symptôme', color: 'rose', action: () => setCurrentView('care') },
                { icon: Bot, label: 'Parler à Cleo', color: 'purple', action: () => setCurrentView('assistant') }
              ].map((a, i) => (
                <Button 
                  key={i}
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-dashed hover:border-solid transition-all"
                  onClick={a.action}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                    a.color === 'teal' && 'bg-teal-100',
                    a.color === 'amber' && 'bg-amber-100',
                    a.color === 'rose' && 'bg-rose-100',
                    a.color === 'purple' && 'bg-purple-100'
                  )}>
                    <a.icon className={cn('w-5 h-5',
                      a.color === 'teal' && 'text-teal-600',
                      a.color === 'amber' && 'text-amber-600',
                      a.color === 'rose' && 'text-rose-600',
                      a.color === 'purple' && 'text-purple-600'
                    )} />
                  </div>
                  <span className="text-sm">{a.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments & Profile */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-teal-600" />Prochains rendez-vous</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setCurrentView('care')}>Voir tout</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.slice(0, 3).map(apt => (
              <motion.div 
                key={apt.id} 
                className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border hover:border-teal-200 cursor-pointer transition-all hover:shadow-sm"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex flex-col items-center justify-center text-white shadow-sm">
                  <span className="text-xs">{apt.date.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  <span className="text-xl font-bold">{apt.date.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{apt.title}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /><span className="truncate">{apt.location}</span></p>
                  <p className="text-sm text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(apt.date)} • {apt.duration} min</p>
                </div>
                <Badge variant="secondary" className={cn('text-xs', apt.type === 'medical' && 'bg-teal-50 text-teal-700', apt.type === 'therapy' && 'bg-purple-50 text-purple-700')}>{apt.type === 'medical' ? 'Médical' : 'Thérapie'}</Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-teal-200"><AvatarFallback className="bg-teal-100 text-teal-700 text-lg">{careRecipient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
              <div><CardTitle className="text-lg">{careRecipient.name}</CardTitle><CardDescription>{careRecipient.relationship} • {careRecipient.age} ans</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-2">Pathologies</p>
              <div className="flex flex-wrap gap-2">{careRecipient.conditions.map((c, i) => <Badge key={i} variant="secondary" className="bg-slate-100">{c}</Badge>)}</div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-slate-500 mb-2">Médicaments du jour</p>
              <div className="space-y-2">
                {medications.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50">
                    <span className="flex items-center gap-2"><Pill className="w-4 h-4 text-slate-400" />{m.name}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded', Object.values(m.takenToday).every(Boolean) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {Object.values(m.takenToday).filter(Boolean).length}/{m.times.length} pris
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {careRecipient.notes && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{careRecipient.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-teal-600" />Tâches du jour</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog('task')}><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn('p-3 rounded-xl border cursor-pointer transition-all', task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-teal-200 hover:shadow-sm')} 
                onClick={() => handleTaskToggle(task.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all', task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300')}>{task.completed && <CheckCircle className="w-3 h-3 text-white" />}</div>
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium transition-all', task.completed && 'text-slate-400 line-through')}>{task.title}</p>
                    <Badge variant="secondary" className={cn('text-xs mt-1', task.priority === 'urgent' && 'bg-red-100 text-red-700', task.priority === 'high' && 'bg-amber-100 text-amber-700', task.priority === 'medium' && 'bg-blue-100 text-blue-700', task.priority === 'low' && 'bg-slate-100 text-slate-600')}>{task.priority}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAssistant = () => (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bot className="w-7 h-7" />
            </motion.div>
            <div className="flex-1">
              <CardTitle className="text-white">Cleo - Votre Assistant IA</CardTitle>
              <CardDescription className="text-teal-100">Disponible 24h/24, 7j/7</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {remainingMessages !== null && (
                <Badge className="bg-white/20 text-white border-white/30">
                  {remainingMessages} messages restants
                </Badge>
              )}
              <Badge className="bg-white/20 text-white border-white/30"><Sparkles className="w-3 h-3 mr-1" />En ligne</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 bg-slate-50">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {chatMessages.map(msg => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn('max-w-[85%] rounded-2xl px-4 py-3', msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-md' : 'bg-white text-slate-800 rounded-bl-md shadow-sm border')}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-teal-600" />
                        <span className="text-xs text-teal-600 font-medium">Cleo</span>
                      </div>
                    )}
                    {msg.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                        <span className="text-slate-400 text-sm">En train d'écrire...</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 bg-white">
          <form onSubmit={handleChatSubmit} className="flex gap-3 w-full max-w-3xl mx-auto">
            <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Posez votre question à Cleo..." className="flex-1 bg-slate-50 border-slate-200 focus:border-teal-500" disabled={isChatLoading} />
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 transition-colors" disabled={!chatInput.trim() || isChatLoading}>
              {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          { icon: Pill, label: 'Organiser les médicaments' },
          { icon: Coffee, label: 'Trouver du répit' },
          { icon: Brain, label: 'Gérer le stress' },
          { icon: Phone, label: 'Contacter un professionnel' }
        ].map((s, i) => (
          <Button 
            key={i} 
            variant="outline" 
            size="sm" 
            className="border-slate-200 hover:border-teal-200 hover:bg-teal-50 transition-all" 
            onClick={() => setChatInput(s.label)}
          >
            <s.icon className="w-4 h-4 mr-2 text-teal-600" />{s.label}
          </Button>
        ))}
      </div>
    </div>
  )

  const renderCare = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Coordination des soins</h2>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddDialog('appointment')}><Plus className="w-4 h-4 mr-2" />Nouveau rendez-vous</Button>
      </div>
      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100"><TabsTrigger value="calendar"><Calendar className="w-4 h-4 mr-2" />Calendrier</TabsTrigger><TabsTrigger value="medications"><Pill className="w-4 h-4 mr-2" />Médicaments</TabsTrigger><TabsTrigger value="symptoms"><Activity className="w-4 h-4 mr-2" />Symptômes</TabsTrigger></TabsList>
        
        <TabsContent value="calendar" className="mt-6 space-y-4">
          {appointments.map(apt => (
            <Card key={apt.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-28 bg-gradient-to-b from-teal-500 to-teal-600 flex flex-col items-center justify-center text-white p-4">
                  <span className="text-3xl font-bold">{apt.date.getDate()}</span>
                  <span className="text-sm">{apt.date.toLocaleDateString('fr-FR', { month: 'long' })}</span>
                </div>
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{apt.title}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1"><User className="w-4 h-4" />{apt.doctorName}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" />{apt.location}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" />{formatTime(apt.date)} • {apt.duration} min</p>
                      {apt.notes && <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700 flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5" />{apt.notes}</div>}
                    </div>
                    <Badge variant="secondary" className={cn(apt.type === 'medical' && 'bg-teal-50 text-teal-700', apt.type === 'therapy' && 'bg-purple-50 text-purple-700')}>{apt.type === 'medical' ? 'Médical' : 'Thérapie'}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="medications" className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Pill className="w-5 h-5 text-teal-600" />Suivi des médicaments</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog('medication')}><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map(med => (
                <div key={med.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-all', Object.values(med.takenToday).every(Boolean) ? 'bg-green-100' : 'bg-amber-100')}>
                      {Object.values(med.takenToday).every(Boolean) ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Pill className="w-6 h-6 text-amber-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{med.name}</p>
                      <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                      {med.instructions && <p className="text-xs text-slate-400 mt-0.5">{med.instructions}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {med.times.map(time => (
                      <Button 
                        key={time} 
                        variant={med.takenToday[time] ? 'default' : 'outline'} 
                        size="sm" 
                        className={cn('min-w-[70px] transition-all', med.takenToday[time] && 'bg-green-600 hover:bg-green-700')} 
                        onClick={() => handleMedToggle(med.id, time)}
                      >
                        {med.takenToday[time] ? <><CheckCircle className="w-4 h-4 mr-1" />{time}</> : <><Clock className="w-4 h-4 mr-1" />{time}</>}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="symptoms" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-teal-600" />Historique des symptômes</CardTitle>
              </CardHeader>
              <CardContent>
                {symptoms.length === 0 ? (
                  <EmptyState 
                    icon={FileText} 
                    title="Aucun symptôme enregistré" 
                    description="Commencez à suivre les symptômes pour un meilleur suivi médical." 
                    action={{ label: 'Ajouter une entrée', onClick: () => setShowAddDialog('symptom') }} 
                  />
                ) : (
                  <div className="space-y-3">
                    {symptoms.map(entry => (
                      <div key={entry.id} className="p-4 bg-slate-50 rounded-xl border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-800">{formatDate(entry.date, 'full')}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Humeur: {entry.mood}/5</Badge>
                            <Badge variant="outline" className="text-xs">Douleur: {entry.painLevel}/10</Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {entry.symptoms.map((s, i) => (
                            <Badge key={i} variant="secondary" className={cn(
                              s.severity >= 3 ? 'bg-red-100 text-red-700' : s.severity >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'
                            )}>
                              {s.name} ({s.severity}/5)
                            </Badge>
                          ))}
                        </div>
                        {entry.notes && <p className="text-sm text-slate-500 italic">"{entry.notes}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-teal-600" />Nouvelle entrée</CardTitle>
              </CardHeader>
              <CardContent>
                <SymptomForm onSubmit={(entry) => {
                  setSymptoms(prev => [entry, ...prev])
                  toast({ title: 'Symptôme enregistré' })
                }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderCommunity = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Communauté d'entraide</h2>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddDialog('post')}><Plus className="w-4 h-4 mr-2" />Nouvelle discussion</Button>
      </div>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 border group-hover:scale-110 transition-transform"><AvatarFallback className="bg-slate-100 text-slate-600">{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-800">{post.author.name}</span>
                      <span className="text-slate-400 text-sm">•</span>
                      <span className="text-slate-400 text-sm">{formatDate(post.createdAt, 'relative')}</span>
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">{post.title}</h3>
                    <p className="text-sm text-slate-500">{post.content}</p>
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                      <Button variant="ghost" size="sm" className={cn('gap-1.5 transition-all', post.isLiked && 'text-teal-600 bg-teal-50')} onClick={(e) => { e.stopPropagation(); handlePostLike(post.id) }}><ThumbsUp className={cn('w-4 h-4', post.isLiked && 'fill-current')} /><span>{post.likes}</span></Button>
                      <Button variant="ghost" size="sm" className="gap-1.5"><MessageSquare className="w-4 h-4" /><span>{post.comments}</span></Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 ml-auto"><Bookmark className="w-4 h-4" />Sauvegarder</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Groupes</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {COMMUNITY_GROUPS.map(g => (
                <Button key={g.id} variant="ghost" className="w-full justify-between h-auto py-2">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span className="text-sm">{g.name}</span></span>
                  <Badge className={g.color}>{g.members}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100">
            <CardContent className="p-5">
              <HandHeart className="w-10 h-10 text-teal-600 mb-3" />
              <h4 className="font-semibold mb-1">Besoin d'aide ?</h4>
              <p className="text-sm text-slate-600 mb-4">Des aidants expérimentés sont disponibles pour vous épauler.</p>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Demander de l'aide</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderResources = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Ressources éducatives</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Rechercher..." className="pl-9 w-48 sm:w-64 bg-slate-50 border-slate-200 focus:border-teal-500" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all cursor-pointer group h-full overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500" />
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><r.icon className="w-6 h-6 text-teal-600" /></div>
                <CardTitle>{r.title}</CardTitle>
                <CardDescription>{r.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Badge variant="secondary" className="bg-slate-100">{r.type}</Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.duration}</span>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderWellness = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-teal-600" />Score de bien-être</CardTitle>
            <CardDescription>Dernière mise à jour : {formatDate(wellness.lastUpdated, 'relative')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-52 h-52">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="14" />
                  <motion.circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    stroke="url(#wg)" 
                    strokeWidth="14" 
                    strokeLinecap="round" 
                    strokeDasharray={`${wellness.score * 5.65} 565`}
                    initial={{ strokeDasharray: '0 565' }}
                    animate={{ strokeDasharray: `${wellness.score * 5.65} 565` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <defs><linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0d9488" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    className="text-5xl font-bold text-slate-900"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {wellness.score}%
                  </motion.span>
                  <span className="text-sm text-slate-500 mt-1">Bien-être global</span>
                  <Badge className={cn('mt-2', wellness.score >= 70 ? 'bg-green-100 text-green-700' : wellness.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                    {wellness.score >= 70 ? 'Bon' : wellness.score >= 50 ? 'Moyen' : 'À améliorer'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Trend Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Évolution sur 7 jours</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wellness.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-xl"><p className="text-2xl font-bold text-green-600">{wellness.sleepHours}h</p><p className="text-sm text-slate-500">Sommeil</p></div>
              <div className="text-center p-4 bg-blue-50 rounded-xl"><p className="text-2xl font-bold text-blue-600">{wellness.mood}/5</p><p className="text-sm text-slate-500">Humeur</p></div>
              <div className="text-center p-4 bg-purple-50 rounded-xl"><p className="text-2xl font-bold text-purple-600">{wellness.stressLevel}/10</p><p className="text-sm text-slate-500">Stress</p></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-teal-600" />Check-in du jour</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2"><Label className="text-sm font-medium">Niveau de stress</Label><span className="text-sm text-slate-500">{wellness.stressLevel}/10</span></div>
              <Slider value={[wellness.stressLevel]} onValueChange={([v]) => handleWellnessUpdate({ stressLevel: v })} max={10} step={1} className="py-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><Label className="text-sm font-medium">Humeur</Label><span className="text-sm text-slate-500">{wellness.mood}/5</span></div>
              <Slider value={[wellness.mood]} onValueChange={([v]) => handleWellnessUpdate({ mood: v })} max={5} step={1} className="py-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><Label className="text-sm font-medium">Heures de sommeil</Label><span className="text-sm text-slate-500">{wellness.sleepHours}h</span></div>
              <Slider value={[wellness.sleepHours]} onValueChange={([v]) => handleWellnessUpdate({ sleepHours: v })} max={12} step={0.5} className="py-2" />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label className="text-sm font-medium">Activité physique</Label>
              <Switch checked={wellness.physicalActivity} onCheckedChange={v => handleWellnessUpdate({ physicalActivity: v })} />
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => handleWellnessUpdate({})}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Enregistrer le check-in
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md"><Bot className="w-8 h-8 text-teal-600" /></div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold flex items-center gap-2 justify-center md:justify-start"><Sparkles className="w-4 h-4 text-teal-600" />Conseil du jour de Cleo</h3>
              <p className="text-slate-600 italic">"N'oubliez pas que prendre soin de vous n'est pas un luxe, c'est une nécessité. Aujourd'hui, essayez de vous accorder 15 minutes rien qu'à vous."</p>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setCurrentView('assistant')}>Démarrer une activité</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800">Paramètres</h2>
      
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="subscription"><Crown className="w-4 h-4 mr-2" />Abonnement</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Gérez vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm"><Camera className="w-4 h-4 mr-2" />Changer la photo</Button>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input 
                    id="name" 
                    value={user.name} 
                    onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user.email} 
                    onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="+33 6 00 00 00 00" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <select id="language" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => toast({ title: 'Profil mis à jour' })}>
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personne aidée</CardTitle>
              <CardDescription>Informations sur la personne que vous accompagnez</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input 
                    value={careRecipient.name} 
                    onChange={(e) => setCareRecipient(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Âge</Label>
                  <Input 
                    type="number" 
                    value={careRecipient.age}
                    onChange={(e) => setCareRecipient(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className="bg-slate-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes importantes</Label>
                <Textarea 
                  value={careRecipient.notes || ''} 
                  onChange={(e) => setCareRecipient(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Allergies, préférences, informations importantes..."
                  className="bg-slate-50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'notifications', title: 'Notifications générales', desc: 'Activez ou désactivez toutes les notifications', icon: Bell },
                { key: 'emailNotifications', title: 'Notifications par email', desc: 'Recevez des résumés et conseils par email', icon: Mail },
                { key: 'pushNotifications', title: 'Notifications push', desc: 'Alertes en temps réel sur votre appareil', icon: Bell },
                { key: 'soundEnabled', title: 'Sons', desc: 'Jouer un son pour les notifications importantes', icon: Volume2 },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <pref.icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{pref.title}</p>
                      <p className="text-sm text-slate-500">{pref.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={user.preferences[pref.key as keyof typeof user.preferences] as boolean}
                    onCheckedChange={(checked) => 
                      setUser(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, [pref.key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">Mot de passe</p>
                  <p className="text-sm text-slate-500">Dernière modification il y a 30 jours</p>
                </div>
                <Button variant="outline">Modifier</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">Authentification à deux facteurs</p>
                  <p className="text-sm text-slate-500">Ajoutez une couche de sécurité supplémentaire</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">Sessions actives</p>
                  <p className="text-sm text-slate-500">2 appareils connectés</p>
                </div>
                <Button variant="outline">Gérer</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Données et confidentialité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Exporter mes données
              </Button>
              <Separator />
              <div className="pt-2">
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer mon compte
                </Button>
                <p className="text-xs text-slate-400 mt-2">Cette action est irréversible. Toutes vos données seront supprimées.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  // ============================================
  // MAIN RENDER
  // ============================================

  if (error) {
    return <div className="min-h-screen flex items-center justify-center p-4"><ErrorFallback error={error} retry={retry} /></div>
  }

  return (
    <>
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard 
            onComplete={handleOnboardingComplete} 
            onSkip={() => {
              setHasCompletedOnboarding(true)
              setShowOnboarding(false)
            }} 
          />
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette 
        open={showCommandPalette} 
        onOpenChange={setShowCommandPalette}
        onNavigate={(view) => setCurrentView(view as View)}
        onAction={handleCommandAction}
      />

      {/* Add Dialogs */}
      <AddAppointmentDialog 
        open={showAddDialog === 'appointment'} 
        onOpenChange={(open) => setShowAddDialog(open ? 'appointment' : null)}
        onAdd={(apt) => {
          setAppointments(prev => [...prev, apt])
          toast({ title: 'Rendez-vous ajouté' })
        }}
      />
      
      <AddMedicationDialog 
        open={showAddDialog === 'medication'} 
        onOpenChange={(open) => setShowAddDialog(open ? 'medication' : null)}
        onAdd={(med) => {
          setMedications(prev => [...prev, med])
          toast({ title: 'Médicament ajouté' })
        }}
      />
      
      <AddTaskDialog 
        open={showAddDialog === 'task'} 
        onOpenChange={(open) => setShowAddDialog(open ? 'task' : null)}
        onAdd={(task) => {
          setTasks(prev => [...prev, task])
          toast({ title: 'Tâche ajoutée' })
        }}
      />
      
      <AddPostDialog 
        open={showAddDialog === 'post'} 
        onOpenChange={(open) => setShowAddDialog(open ? 'post' : null)}
        onAdd={(post) => {
          setPosts(prev => [post, ...prev])
          toast({ title: 'Discussion publiée' })
        }}
        userName={user.name}
      />

      {/* Main App */}
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderLanding()}</motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderDashboard()}</motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Symptom Form Component
function SymptomForm({ onSubmit }: { onSubmit: (entry: SymptomEntry) => void }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState(3)
  const [painLevel, setPainLevel] = useState(0)

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom))
    } else {
      setSelectedSymptoms(prev => [...prev, symptom])
      setSeverity(prev => ({ ...prev, [symptom]: 2 }))
    }
  }

  const handleSubmit = () => {
    const entry: SymptomEntry = {
      id: generateId(),
      date: new Date(),
      symptoms: selectedSymptoms.map(s => ({ name: s, severity: severity[s] || 2 })),
      notes,
      mood,
      painLevel
    }
    onSubmit(entry)
    setSelectedSymptoms([])
    setSeverity({})
    setNotes('')
    setMood(3)
    setPainLevel(0)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm mb-2 block">Symptômes observés</Label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map(s => (
            <Badge
              key={s}
              variant={selectedSymptoms.includes(s) ? 'default' : 'outline'}
              className={cn('cursor-pointer transition-all', selectedSymptoms.includes(s) && 'bg-teal-600 hover:bg-teal-700')}
              onClick={() => toggleSymptom(s)}
            >
              {s}
            </Badge>
          ))}
        </div>
      </div>

      {selectedSymptoms.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Intensité</Label>
          {selectedSymptoms.map(s => (
            <div key={s} className="flex items-center gap-3">
              <span className="text-sm w-32 truncate">{s}</span>
              <Slider
                value={[severity[s] || 2]}
                onValueChange={([v]) => setSeverity(prev => ({ ...prev, [s]: v }))}
                max={5}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-slate-500 w-6">{severity[s] || 2}/5</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm mb-2 block">Humeur</Label>
          <Slider value={[mood]} onValueChange={([v]) => setMood(v)} max={5} step={1} />
          <p className="text-xs text-slate-500 mt-1 text-center">{mood}/5</p>
        </div>
        <div>
          <Label className="text-sm mb-2 block">Niveau de douleur</Label>
          <Slider value={[painLevel]} onValueChange={([v]) => setPainLevel(v)} max={10} step={1} />
          <p className="text-xs text-slate-500 mt-1 text-center">{painLevel}/10</p>
        </div>
      </div>

      <div>
        <Label className="text-sm mb-2 block">Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observations, contexte..."
          className="bg-slate-50"
        />
      </div>

      <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleSubmit}>
        <Plus className="w-4 h-4 mr-2" />
        Enregistrer
      </Button>
    </div>
  )
}

// ============================================
// ADD DIALOG COMPONENTS
// ============================================

function AddAppointmentDialog({ open, onOpenChange, onAdd }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onAdd: (apt: AppointmentData) => void;
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [type, setType] = useState<'medical' | 'therapy'>('medical')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!title || !date || !time) return
    
    const dateTime = new Date(`${date}T${time}`)
    const apt: AppointmentData = {
      id: generateId(),
      title,
      date: dateTime,
      duration: 30,
      location,
      doctorName,
      type,
      notes
    }
    
    onAdd(apt)
    onOpenChange(false)
    setTitle('')
    setDate('')
    setTime('')
    setLocation('')
    setDoctorName('')
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Nouveau rendez-vous
          </DialogTitle>
          <DialogDescription>Ajoutez un rendez-vous médical à votre calendrier</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apt-title">Titre</Label>
            <Input id="apt-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Consultation Dr. Martin" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apt-date">Date</Label>
              <Input id="apt-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apt-time">Heure</Label>
              <Input id="apt-time" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-location">Lieu</Label>
            <Input id="apt-location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Cabinet médical" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-doctor">Médecin</Label>
            <Input id="apt-doctor" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Dr. Martin" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button variant={type === 'medical' ? 'default' : 'outline'} size="sm" onClick={() => setType('medical')} className={type === 'medical' ? 'bg-teal-600' : ''}>Médical</Button>
              <Button variant={type === 'therapy' ? 'default' : 'outline'} size="sm" onClick={() => setType('therapy')} className={type === 'therapy' ? 'bg-teal-600' : ''}>Thérapie</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-notes">Notes</Label>
            <Textarea id="apt-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes importantes..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddMedicationDialog({ open, onOpenChange, onAdd }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onAdd: (med: MedicationData) => void;
}) {
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('Une fois par jour')
  const [times, setTimes] = useState<string[]>(['08:00'])
  const [instructions, setInstructions] = useState('')

  const handleAddTime = () => setTimes(prev => [...prev, '12:00'])
  const handleRemoveTime = (index: number) => setTimes(prev => prev.filter((_, i) => i !== index))
  const handleTimeChange = (index: number, value: string) => setTimes(prev => prev.map((t, i) => i === index ? value : t))

  const handleSubmit = () => {
    if (!name || !dosage) return
    
    const med: MedicationData = {
      id: generateId(),
      name,
      dosage,
      frequency,
      times,
      instructions,
      takenToday: times.reduce((acc, t) => ({ ...acc, [t]: false }), {})
    }
    
    onAdd(med)
    onOpenChange(false)
    setName('')
    setDosage('')
    setTimes(['08:00'])
    setInstructions('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Ajouter un médicament
          </DialogTitle>
          <DialogDescription>Ajoutez un médicament au suivi quotidien</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="med-name">Nom du médicament</Label>
            <Input id="med-name" value={name} onChange={e => setName(e.target.value)} placeholder="Doliprane" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input id="med-dosage" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="500mg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-freq">Fréquence</Label>
              <select id="med-freq" value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full h-10 px-3 border rounded-lg text-sm">
                <option>Une fois par jour</option>
                <option>Deux fois par jour</option>
                <option>Trois fois par jour</option>
                <option>Quotidien</option>
                <option>Selon besoin</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Heures de prise</Label>
              <Button variant="ghost" size="sm" onClick={handleAddTime} className="text-teal-600">
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>
            {times.map((time, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input type="time" value={time} onChange={e => handleTimeChange(i, e.target.value)} className="flex-1" />
                {times.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveTime(i)} className="text-red-500">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-instructions">Instructions</Label>
            <Textarea id="med-instructions" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="À prendre au repas..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddTaskDialog({ open, onOpenChange, onAdd }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onAdd: (task: TaskData) => void;
}) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  const handleSubmit = () => {
    if (!title) return
    
    const task: TaskData = {
      id: generateId(),
      title,
      completed: false,
      priority
    }
    
    onAdd(task)
    onOpenChange(false)
    setTitle('')
    setPriority('medium')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            Nouvelle tâche
          </DialogTitle>
          <DialogDescription>Ajoutez une tâche à votre liste</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titre</Label>
            <Input id="task-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Appeler l'infirmière" />
          </div>
          <div className="space-y-2">
            <Label>Priorité</Label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Basse', color: 'bg-slate-100 text-slate-600' },
                { value: 'medium', label: 'Moyenne', color: 'bg-blue-100 text-blue-600' },
                { value: 'high', label: 'Haute', color: 'bg-amber-100 text-amber-600' },
                { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-600' },
              ].map(p => (
                <Button key={p.value} variant={priority === p.value ? 'default' : 'outline'} size="sm" onClick={() => setPriority(p.value as typeof priority)} className={priority === p.value ? 'bg-teal-600' : ''}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddPostDialog({ open, onOpenChange, onAdd, userName }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onAdd: (post: PostData) => void;
  userName: string;
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')

  const handleSubmit = () => {
    if (!title || !content) return
    
    const post: PostData = {
      id: generateId(),
      title,
      content,
      author: { name: userName },
      category,
      likes: 0,
      comments: 0,
      isLiked: false,
      createdAt: new Date()
    }
    
    onAdd(post)
    onOpenChange(false)
    setTitle('')
    setContent('')
    setCategory('general')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            Nouvelle discussion
          </DialogTitle>
          <DialogDescription>Partagez avec la communauté</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="post-title">Titre</Label>
            <Input id="post-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Comment gérez-vous les troubles du sommeil ?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-content">Contenu</Label>
            <Textarea id="post-content" value={content} onChange={e => setContent(e.target.value)} placeholder="Partagez votre expérience..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'general', label: 'Général' },
                { value: 'alzheimer', label: 'Alzheimer' },
                { value: 'temoignage', label: 'Témoignage' },
                { value: 'ressources', label: 'Ressources' },
                { value: 'question', label: 'Question' },
              ].map(c => (
                <Badge key={c.value} variant={category === c.value ? 'default' : 'outline'} className={cn('cursor-pointer', category === c.value && 'bg-teal-600')} onClick={() => setCategory(c.value)}>
                  {c.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit}>Publier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Export the main app with providers
export default function CareCircleApp() {
  return (
    <SubscriptionProvider>
      <CareCircleAppContent />
    </SubscriptionProvider>
  )
}
