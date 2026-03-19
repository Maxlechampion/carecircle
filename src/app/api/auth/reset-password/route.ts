import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    // Find the reset token
    const otpCode = await db.oTPCode.findFirst({
      where: {
        code: token,
        type: 'password_reset',
        verified: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!otpCode || !otpCode.userId) {
      return NextResponse.json(
        { error: 'Lien invalide ou expiré. Veuillez faire une nouvelle demande.' },
        { status: 400 }
      )
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.$transaction([
      db.user.update({
        where: { id: otpCode.userId },
        data: { password: hashedPassword },
      }),
      db.oTPCode.update({
        where: { id: otpCode.id },
        data: { verified: true },
      }),
    ])

    return NextResponse.json({ message: 'Mot de passe mis à jour avec succès.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
