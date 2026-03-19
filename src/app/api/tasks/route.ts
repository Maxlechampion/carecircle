import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/tasks
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const url = new URL(request.url)
  const completed = url.searchParams.get('completed')
  const priority = url.searchParams.get('priority')

  const tasks = await db.task.findMany({
    where: {
      userId: session!.user.id,
      ...(completed !== null && { completed: completed === 'true' }),
      ...(priority && { priority }),
    },
    orderBy: [
      { completed: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    include: { recipient: { select: { id: true, name: true } } },
  })

  return ok(tasks)
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { title, description, dueDate, priority, category, recipientId } = body

    if (!title?.trim()) return err('Le titre est requis')

    const task = await db.task.create({
      data: {
        userId: session!.user.id,
        title: title.trim(),
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        category: category || 'care',
        completed: false,
        recipientId: recipientId || null,
      },
      include: { recipient: { select: { id: true, name: true } } },
    })

    return ok(task, 201)
  } catch (e) {
    console.error('POST /api/tasks error:', e)
    return err('Erreur serveur', 500)
  }
}
