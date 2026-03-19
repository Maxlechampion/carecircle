import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import bcrypt from 'bcryptjs'

// GET /api/users/me
export async function GET() {
  const { session, error } = await requireAuth()
  if (error) return error

  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      phone: true,
      role: true,
      country: true,
      language: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      twoFactorEnabled: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })

  if (!user) return err('Utilisateur non trouvé', 404)
  return ok(user)
}

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { name, phone, language, country, currentPassword, newPassword } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null
    if (language !== undefined) updateData.language = language
    if (country !== undefined) updateData.country = country

    // Password change
    if (newPassword) {
      if (!currentPassword) return err('Mot de passe actuel requis')
      if (newPassword.length < 8) return err('Nouveau mot de passe trop court')

      const user = await db.user.findUnique({ where: { id: session!.user.id } })
      if (!user?.password) return err('Ce compte utilise une connexion OAuth')

      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return err('Mot de passe actuel incorrect', 401)

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    const updated = await db.user.update({
      where: { id: session!.user.id },
      data: updateData,
      select: {
        id: true, name: true, email: true, avatar: true,
        phone: true, role: true, country: true, language: true,
        subscriptionPlan: true,
      },
    })

    return ok(updated)
  } catch (e) {
    console.error('PATCH /api/users/me error:', e)
    return err('Erreur serveur', 500)
  }
}

// DELETE /api/users/me
export async function DELETE() {
  const { session, error } = await requireAuth()
  if (error) return error

  await db.user.delete({ where: { id: session!.user.id } })
  return ok({ message: 'Compte supprimé' })
}
