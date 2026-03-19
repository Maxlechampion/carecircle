import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const med = await db.medication.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!med) return err('Médicament introuvable', 404)

  const body = await request.json()
  const { name, dosage, frequency, times, instructions, active } = body

  const updated = await db.medication.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(dosage !== undefined && { dosage }),
      ...(frequency !== undefined && { frequency }),
      ...(times !== undefined && { times: JSON.stringify(times) }),
      ...(instructions !== undefined && { instructions }),
      ...(active !== undefined && { active }),
    },
  })

  return ok(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const med = await db.medication.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!med) return err('Médicament introuvable', 404)

  await db.medication.delete({ where: { id: params.id } })
  return ok({ message: 'Médicament supprimé' })
}
