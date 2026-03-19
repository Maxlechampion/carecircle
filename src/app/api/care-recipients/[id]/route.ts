import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// PATCH /api/care-recipients/[id]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const recipient = await db.careRecipient.findFirst({
    where: { id: params.id, caregiverId: session!.user.id },
  })
  if (!recipient) return err('Introuvable', 404)

  const body = await request.json()
  const { name, dateOfBirth, conditions, notes, photo } = body

  const updated = await db.careRecipient.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
      ...(conditions !== undefined && { conditions: JSON.stringify(conditions) }),
      ...(notes !== undefined && { notes }),
      ...(photo !== undefined && { photo }),
    },
  })

  return ok(updated)
}

// DELETE /api/care-recipients/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const recipient = await db.careRecipient.findFirst({
    where: { id: params.id, caregiverId: session!.user.id },
  })
  if (!recipient) return err('Introuvable', 404)

  await db.careRecipient.delete({ where: { id: params.id } })
  return ok({ message: 'Supprimé' })
}
