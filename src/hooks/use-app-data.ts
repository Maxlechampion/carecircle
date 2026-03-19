'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  appointmentsApi,
  medicationsApi,
  tasksApi,
  wellnessApi,
  symptomsApi,
  communityApi,
  notificationsApi,
  careRecipientsApi,
  exportApi,
} from '@/lib/api-client'

// ─── Types matching the UI layer ───────────────────────────────────────────────

export interface AppointmentData {
  id: string
  title: string
  date: Date
  duration: number
  location: string
  doctorName: string
  type: string
  notes?: string
  status?: string
  recipientId?: string
  recipient?: { id: string; name: string }
}

export interface MedicationData {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  instructions?: string
  takenToday: Record<string, boolean>
  active?: boolean
  recipientId?: string
}

export interface TaskData {
  id: string
  title: string
  completed: boolean
  priority: string
  dueDate?: Date
  category?: string
  recipientId?: string
}

export interface PostData {
  id: string
  title: string
  content: string
  author: { id?: string; name: string; avatar?: string | null; role?: string }
  category: string
  likes: number
  comments: number
  isLiked?: boolean
  isBookmarked?: boolean
  isOwn?: boolean
  createdAt: Date
}

export interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: Date
  actionUrl?: string
}

export interface SymptomEntry {
  id: string
  date: Date
  symptoms: { name: string; severity: number }[]
  notes: string
  mood: number
  painLevel: number
}

export interface WellnessData {
  score: number
  stressLevel: number
  sleepHours: number
  mood: number
  physicalActivity: boolean
  lastUpdated: Date
  history: { date: string; score: number; stress: number; sleep: number; mood: number }[]
}

export interface CareRecipientData {
  id: string
  name: string
  relationship: string
  age: number
  conditions: string[]
  notes?: string
}

// ─── Default values ───────────────────────────────────────────────────────────

const defaultWellness: WellnessData = {
  score: 72,
  stressLevel: 5,
  sleepHours: 7,
  mood: 3,
  physicalActivity: false,
  lastUpdated: new Date(),
  history: [],
}

const defaultRecipient: CareRecipientData = {
  id: '',
  name: 'Votre proche',
  relationship: 'Famille',
  age: 70,
  conditions: [],
  notes: '',
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData() {
  const { data: session } = useSession()
  const isAuth = !!session?.user?.id

  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [medications, setMedications] = useState<MedicationData[]>([])
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [wellness, setWellness] = useState<WellnessData>(defaultWellness)
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([])
  const [posts, setPosts] = useState<PostData[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [careRecipient, setCareRecipient] = useState<CareRecipientData>(defaultRecipient)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Load all data on mount (when authenticated) ─────────────────────────

  const loadAll = useCallback(async () => {
    if (!isAuth) { setIsLoading(false); return }

    setIsLoading(true)
    setError(null)

    try {
      const [
        aptsRes,
        medsRes,
        tasksRes,
        wellnessRes,
        symptomsRes,
        postsRes,
        notifsRes,
        recipientsRes,
      ] = await Promise.allSettled([
        appointmentsApi.list({ upcoming: false }),
        medicationsApi.list(true),
        tasksApi.list(),
        wellnessApi.get(7),
        symptomsApi.list(),
        communityApi.list({ page: 1 }),
        notificationsApi.list(),
        careRecipientsApi.list(),
      ])

      if (aptsRes.status === 'fulfilled') {
        setAppointments(
          aptsRes.value.appointments.map((a: any) => ({ ...a, date: new Date(a.date) }))
        )
      }

      if (medsRes.status === 'fulfilled') {
        setMedications(medsRes.value as MedicationData[])
      }

      if (tasksRes.status === 'fulfilled') {
        setTasks(
          (tasksRes.value as any[]).map(t => ({
            ...t,
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          }))
        )
      }

      if (wellnessRes.status === 'fulfilled') {
        const w = wellnessRes.value as any
        setWellness({
          score: w.score ?? 72,
          stressLevel: w.stressLevel ?? 5,
          sleepHours: w.sleepHours ?? 7,
          mood: w.mood ?? 3,
          physicalActivity: w.physicalActivity ?? false,
          lastUpdated: w.lastUpdated ? new Date(w.lastUpdated) : new Date(),
          history: w.history ?? [],
        })
      }

      if (symptomsRes.status === 'fulfilled') {
        setSymptoms(
          symptomsRes.value.logs.map((s: any) => ({
            ...s,
            date: new Date(s.date),
            symptoms: Array.isArray(s.symptoms) ? s.symptoms : [],
          }))
        )
      }

      if (postsRes.status === 'fulfilled') {
        setPosts(
          postsRes.value.posts.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) }))
        )
      }

      if (notifsRes.status === 'fulfilled') {
        setNotifications(
          notifsRes.value.notifications.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }))
        )
      }

      if (recipientsRes.status === 'fulfilled' && (recipientsRes.value as any[]).length > 0) {
        const r = (recipientsRes.value as any[])[0]
        setCareRecipient({
          id: r.id,
          name: r.name,
          relationship: 'Proche',
          age: r.dateOfBirth
            ? Math.floor((Date.now() - new Date(r.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
            : 70,
          conditions: r.conditions ? JSON.parse(r.conditions) : [],
          notes: r.notes || '',
        })
      }
    } catch (err) {
      console.error('useAppData loadAll error:', err)
      setError('Erreur lors du chargement des données.')
    } finally {
      setIsLoading(false)
    }
  }, [isAuth])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // ─── Appointment actions ──────────────────────────────────────────────────

  const addAppointment = useCallback(async (data: Omit<AppointmentData, 'id'> & { recipientId?: string }) => {
    const recipientId = data.recipientId || careRecipient.id
    if (!recipientId) throw new Error('Aucune personne aidée configurée')

    const apt = await appointmentsApi.create({
      title: data.title,
      date: data.date instanceof Date ? data.date.toISOString() : data.date,
      duration: data.duration,
      location: data.location,
      doctorName: data.doctorName,
      type: data.type,
      notes: data.notes,
      recipientId,
    })

    setAppointments(prev => [...prev, { ...apt, date: new Date(apt.date) }])
  }, [careRecipient.id])

  const deleteAppointment = useCallback(async (id: string) => {
    await appointmentsApi.delete(id)
    setAppointments(prev => prev.filter(a => a.id !== id))
  }, [])

  // ─── Medication actions ───────────────────────────────────────────────────

  const addMedication = useCallback(async (data: Omit<MedicationData, 'id' | 'takenToday'> & { recipientId?: string }) => {
    const recipientId = data.recipientId || careRecipient.id
    if (!recipientId) throw new Error('Aucune personne aidée configurée')

    const med = await medicationsApi.create({
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      times: data.times,
      instructions: data.instructions,
      recipientId,
    })

    setMedications(prev => [...prev, med])
  }, [careRecipient.id])

  const toggleMedication = useCallback(async (medId: string, time: string) => {
    const med = medications.find(m => m.id === medId)
    if (!med) return

    const taken = !med.takenToday[time]

    // Optimistic update
    setMedications(prev =>
      prev.map(m => m.id === medId ? { ...m, takenToday: { ...m.takenToday, [time]: taken } } : m)
    )

    try {
      await medicationsApi.logTaken(medId, time, taken)
    } catch {
      // Revert on failure
      setMedications(prev =>
        prev.map(m => m.id === medId ? { ...m, takenToday: { ...m.takenToday, [time]: !taken } } : m)
      )
    }
  }, [medications])

  const deleteMedication = useCallback(async (id: string) => {
    await medicationsApi.delete(id)
    setMedications(prev => prev.filter(m => m.id !== id))
  }, [])

  // ─── Task actions ─────────────────────────────────────────────────────────

  const addTask = useCallback(async (data: Omit<TaskData, 'id'>) => {
    const task = await tasksApi.create({
      title: data.title,
      priority: data.priority,
      dueDate: data.dueDate?.toISOString(),
      category: data.category,
    })
    setTasks(prev => [...prev, { ...task, dueDate: task.dueDate ? new Date(task.dueDate) : undefined }])
  }, [])

  const toggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))

    try {
      await tasksApi.update(taskId, { completed: !task.completed })
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: task.completed } : t))
    }
  }, [tasks])

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // ─── Wellness actions ─────────────────────────────────────────────────────

  const updateWellness = useCallback(async (updates: Partial<WellnessData>) => {
    setWellness(prev => ({ ...prev, ...updates, lastUpdated: new Date() }))
    try {
      const result = await wellnessApi.checkin({
        stressLevel: updates.stressLevel,
        sleepHours: updates.sleepHours,
        mood: updates.mood,
        physicalActivity: updates.physicalActivity,
      })
      setWellness(prev => ({ ...prev, score: result.score }))
    } catch (e) {
      console.error('Wellness update failed:', e)
    }
  }, [])

  // ─── Symptom actions ──────────────────────────────────────────────────────

  const addSymptom = useCallback(async (entry: Omit<SymptomEntry, 'id'> & { recipientId?: string }) => {
    const recipientId = entry.recipientId || careRecipient.id
    if (!recipientId) throw new Error('Aucune personne aidée configurée')

    const log = await symptomsApi.create({
      symptoms: entry.symptoms,
      notes: entry.notes,
      mood: entry.mood,
      painLevel: entry.painLevel,
      date: entry.date.toISOString(),
      recipientId,
    })

    setSymptoms(prev => [{ ...log, date: new Date(log.date) }, ...prev])
  }, [careRecipient.id])

  const deleteSymptom = useCallback(async (id: string) => {
    await symptomsApi.delete(id)
    setSymptoms(prev => prev.filter(s => s.id !== id))
  }, [])

  // ─── Community actions ────────────────────────────────────────────────────

  const addPost = useCallback(async (data: { title: string; content: string; category: string; isAnonymous?: boolean }) => {
    const post = await communityApi.create(data)
    setPosts(prev => [{ ...post, createdAt: new Date(post.createdAt) }, ...prev])
  }, [])

  const likePost = useCallback(async (postId: string) => {
    // Optimistic update
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
    try {
      const result = await communityApi.like(postId)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: result.likes, isLiked: result.liked } : p))
    } catch {
      // Revert
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      )
    }
  }, [])

  const deletePost = useCallback(async (id: string) => {
    await communityApi.delete(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }, [])

  // ─── Notification actions ─────────────────────────────────────────────────

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await notificationsApi.markRead(id).catch(console.error)
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await notificationsApi.markAllRead().catch(console.error)
  }, [])

  // ─── Export ───────────────────────────────────────────────────────────────

  const exportData = useCallback(async () => {
    const data = await exportApi.exportJson()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carecircle_export_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // ─── Computed ─────────────────────────────────────────────────────────────

  const unreadCount = notifications.filter(n => !n.read).length
  const completedTasksCount = tasks.filter(t => t.completed).length
  const medsTaken = medications.reduce((acc, m) => acc + Object.values(m.takenToday).filter(Boolean).length, 0)
  const totalMeds = medications.reduce((acc, m) => acc + m.times.length, 0)

  return {
    // Data
    appointments,
    medications,
    tasks,
    wellness,
    symptoms,
    posts,
    notifications,
    careRecipient,
    isLoading,
    error,

    // Computed
    unreadCount,
    completedTasksCount,
    medsTaken,
    totalMeds,

    // Actions
    addAppointment,
    deleteAppointment,
    addMedication,
    toggleMedication,
    deleteMedication,
    addTask,
    toggleTask,
    deleteTask,
    updateWellness,
    addSymptom,
    deleteSymptom,
    addPost,
    likePost,
    deletePost,
    markNotificationRead,
    markAllNotificationsRead,
    exportData,
    reload: loadAll,

    // Direct setters for optimistic updates
    setAppointments,
    setMedications,
    setTasks,
    setWellness,
    setSymptoms,
    setPosts,
    setNotifications,
    setCareRecipient,
  }
}
