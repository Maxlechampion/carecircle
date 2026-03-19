import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  providers: [
    // Email/Password
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Mot de passe',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          country: user.country,
        }
      },
    }),

    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: 'caregiver',
              }
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-in
      if (account?.provider === 'google') {
        try {
          const existing = await db.user.findUnique({
            where: { email: user.email! },
          })

          if (!existing) {
            await db.user.create({
              data: {
                email: user.email!,
                name: user.name,
                avatar: user.image,
                authProvider: 'google',
                oauthId: account.providerAccountId,
                role: 'caregiver',
                subscriptionPlan: 'free',
                lastLoginAt: new Date(),
              },
            })
          } else {
            await db.user.update({
              where: { id: existing.id },
              data: { lastLoginAt: new Date(), avatar: user.image || existing.avatar },
            })
          }
        } catch (error) {
          console.error('OAuth signIn error:', error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in — enrich token with DB data
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, subscriptionPlan: true, country: true, name: true, avatar: true },
        })
        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.role
          token.subscriptionPlan = dbUser.subscriptionPlan
          token.country = dbUser.country
          token.name = dbUser.name
          token.picture = dbUser.avatar
        }
      }

      // Handle session update
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.role) token.role = session.role
        if (session.subscriptionPlan) token.subscriptionPlan = session.subscriptionPlan
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.user.subscriptionPlan = token.subscriptionPlan as string
        session.user.country = token.country as string
      }
      return session
    },
  },

  events: {
    async signOut({ token }) {
      // Clean up active sessions on signout
      if (token?.userId) {
        try {
          await db.userSession.updateMany({
            where: { userId: token.userId as string, isActive: true },
            data: { isActive: false },
          })
        } catch {
          // Non-critical
        }
      }
    },
  },
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
      subscriptionPlan: string
      country?: string
    }
  }
  interface User {
    role?: string
    subscriptionPlan?: string
    country?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    role?: string
    subscriptionPlan?: string
    country?: string
  }
}
