import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const task = await db.task.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!task) return err('Tâche introuvable', 404)

  const body = await request.json()
  const { title, description, completed, priority, dueDate, category } = body

  const updated = await db.task.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(completed !== undefined && { completed }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(category !== undefined && { category }),
    },
    include: { recipient: { select: { id: true, name: true } } },
  })

  return ok(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const task = await db.task.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!task) return err('Tâche introuvable', 404)

  await db.task.delete({ where: { id: params.id } })
  return ok({ message: 'Tâche supprimée' })
}
