import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// PATCH /api/appointments/[id]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const apt = await db.appointment.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!apt) return err('Rendez-vous introuvable', 404)

  const body = await request.json()
  const { title, date, duration, location, doctorName, type, notes, status } = body

  const updated = await db.appointment.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(duration !== undefined && { duration }),
      ...(location !== undefined && { location }),
      ...(doctorName !== undefined && { doctorName }),
      ...(type !== undefined && { type }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status }),
    },
    include: { recipient: { select: { id: true, name: true } } },
  })

  return ok(updated)
}

// DELETE /api/appointments/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const apt = await db.appointment.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!apt) return err('Rendez-vous introuvable', 404)

  await db.appointment.delete({ where: { id: params.id } })
  return ok({ message: 'Rendez-vous supprimé' })
}
