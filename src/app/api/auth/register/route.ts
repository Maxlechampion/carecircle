import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court (min 8 caractères)'),
  role: z.enum(['caregiver', 'doctor', 'recipient', 'family']).default('caregiver'),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        country: data.countryCode || 'FR',
        phone: data.phone || null,
        authProvider: 'credentials',
        subscriptionPlan: 'free',
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionPlan: true,
        country: true,
        createdAt: true,
      },
    })

    // Create default notification for welcome
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Bienvenue sur CareCircle ! 🎉',
        message: `Bonjour ${user.name}, votre compte a été créé avec succès. Commencez à explorer toutes les fonctionnalités.`,
        type: 'success',
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
