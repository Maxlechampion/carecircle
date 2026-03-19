'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/lib/auth-context'
import { SubscriptionProvider } from '@/lib/subscription-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
