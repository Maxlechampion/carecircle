import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'Si ce compte existe, un email a été envoyé.' })
    }

    // Generate reset token (store as OTP code with type password_reset)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.oTPCode.create({
      data: {
        userId: user.id,
        phone: email, // reusing phone field for email
        code: resetToken,
        type: 'password_reset',
        expiresAt,
      },
    })

    // In production: send email with reset link
    // await sendPasswordResetEmail(email, resetToken)
    console.log(`[DEV] Password reset token for ${email}: ${resetToken}`)

    return NextResponse.json({ message: 'Email de réinitialisation envoyé.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
