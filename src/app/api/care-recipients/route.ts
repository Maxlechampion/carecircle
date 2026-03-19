import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/care-recipients
export async function GET() {
  const { session, error } = await requireAuth()
  if (error) return error

  const recipients = await db.careRecipient.findMany({
    where: { caregiverId: session!.user.id },
    orderBy: { createdAt: 'asc' },
  })

  return ok(recipients)
}

// POST /api/care-recipients
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { name, dateOfBirth, conditions, notes, photo } = body

    if (!name?.trim()) return err('Le nom est requis')

    const recipient = await db.careRecipient.create({
      data: {
        caregiverId: session!.user.id,
        name: name.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        conditions: conditions ? JSON.stringify(conditions) : null,
        notes: notes || null,
        photo: photo || null,
      },
    })

    return ok(recipient, 201)
  } catch (e) {
    console.error('POST /api/care-recipients error:', e)
    return err('Erreur serveur', 500)
  }
}
