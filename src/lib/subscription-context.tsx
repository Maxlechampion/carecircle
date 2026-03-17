'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { PRICING_PLANS, PlanId, SubscriptionStatus } from '@/lib/stripe'

// Types
interface SubscriptionData {
  plan: PlanId
  status: SubscriptionStatus | null
  customerId: string | null
  subscriptionId: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface SubscriptionContextType {
  plan: PlanId
  status: SubscriptionStatus | null
  isActive: boolean
  isLoading: boolean
  customerId: string | null
  subscriptionId: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  selectPlan: (planId: PlanId) => Promise<void>
  cancelSubscription: () => Promise<void>
  reactivateSubscription: () => Promise<void>
  openPortal: () => Promise<void>
}

// Context
const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

// Default values
const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  plan: 'free',
  status: null,
  customerId: null,
  subscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
}

// Provider
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [plan, setPlan] = useState<PlanId>('free')
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load from localStorage only on client side after mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('carecircle_subscription')
      if (stored) {
        const data: SubscriptionData = JSON.parse(stored)
        setPlan(data.plan)
        setStatus(data.status)
        setCustomerId(data.customerId)
        setSubscriptionId(data.subscriptionId)
        if (data.currentPeriodEnd) {
          setCurrentPeriodEnd(new Date(data.currentPeriodEnd))
        }
        setCancelAtPeriodEnd(data.cancelAtPeriodEnd)
      }
    } catch {
      console.error('Failed to load subscription from localStorage')
    }
  }, [])

  // Save to localStorage
  const saveSubscription = useCallback((data: Partial<SubscriptionData>) => {
    if (typeof window === 'undefined') return
    
    const newData: SubscriptionData = {
      plan: data.plan ?? plan,
      status: data.status ?? status,
      customerId: data.customerId ?? customerId,
      subscriptionId: data.subscriptionId ?? subscriptionId,
      currentPeriodEnd: data.currentPeriodEnd ?? (currentPeriodEnd?.toISOString() || null),
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? cancelAtPeriodEnd,
    }
    localStorage.setItem('carecircle_subscription', JSON.stringify(newData))
  }, [plan, status, customerId, subscriptionId, currentPeriodEnd, cancelAtPeriodEnd])

  // Select a plan
  const selectPlan = useCallback(async (planId: PlanId) => {
    const selectedPlan = PRICING_PLANS[planId]
    
    // Free plan - direct assignment
    if (selectedPlan.price === 0) {
      setPlan(planId)
      setStatus(null)
      saveSubscription({ plan: planId, status: null })
      return
    }

    // Paid plan - redirect to checkout
    try {
      setIsLoading(true)
      
      // Demo mode: directly activate (in production, redirect to Stripe)
      setPlan(planId)
      setStatus('active')
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)
      setCurrentPeriodEnd(periodEnd)
      saveSubscription({ 
        plan: planId, 
        status: 'active',
        currentPeriodEnd: periodEnd.toISOString(),
      })
      
    } catch (error) {
      console.error('Failed to select plan:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [saveSubscription])

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    if (!subscriptionId) return
    
    setCancelAtPeriodEnd(true)
    saveSubscription({ cancelAtPeriodEnd: true })
  }, [subscriptionId, saveSubscription])

  // Reactivate subscription
  const reactivateSubscription = useCallback(async () => {
    if (!subscriptionId) return
    
    setCancelAtPeriodEnd(false)
    saveSubscription({ cancelAtPeriodEnd: false })
  }, [subscriptionId, saveSubscription])

  // Open customer portal
  const openPortal = useCallback(async () => {
    if (!customerId) return
    // In production: redirect to Stripe customer portal
    console.log('Opening customer portal for:', customerId)
  }, [customerId])

  const isActive = status === 'active' || status === 'trialing' || plan === 'free'

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        status,
        isActive,
        isLoading,
        customerId,
        subscriptionId,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        selectPlan,
        cancelSubscription,
        reactivateSubscription,
        openPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

// Hook
export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription needs to be used within SubscriptionProvider')
  }
  return context
}

// Feature check hook
export function useFeature(feature: string): boolean {
  const { plan, isActive } = useSubscription()

  const features: Record<PlanId, string[]> = {
    free: [
      'ai_limited',
      'calendar_basic',
      'care_recipient_1',
      'community',
      'resources',
    ],
    premium: [
      'ai_unlimited',
      'calendar_advanced',
      'care_recipients_5',
      'health_journal',
      'export_pdf',
      'smart_alerts',
      'webinars_priority',
      'email_support',
    ],
    family: [
      'ai_unlimited',
      'calendar_advanced',
      'care_recipients_unlimited',
      'health_journal',
      'export_pdf',
      'smart_alerts',
      'webinars_priority',
      'phone_support',
      'family_accounts_5',
      'coordination_shared',
      'priority_hotline',
      'personal_coach',
    ],
  }

  if (!isActive) return false
  return features[plan]?.includes(feature) ?? false
}
