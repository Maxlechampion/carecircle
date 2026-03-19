import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const log = await db.symptomLog.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!log) return err('Entrée introuvable', 404)

  await db.symptomLog.delete({ where: { id: params.id } })
  return ok({ message: 'Entrée supprimée' })
}
