import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const notif = await db.notification.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!notif) return err('Notification introuvable', 404)

  const updated = await db.notification.update({
    where: { id: params.id },
    data: { read: true },
  })
  return ok(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const notif = await db.notification.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!notif) return err('Notification introuvable', 404)

  await db.notification.delete({ where: { id: params.id } })
  return ok({ message: 'Notification supprimée' })
}
