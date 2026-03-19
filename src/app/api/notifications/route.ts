import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/notifications
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const url = new URL(request.url)
  const unreadOnly = url.searchParams.get('unread') === 'true'
  const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'))

  const notifications = await db.notification.findMany({
    where: {
      userId: session!.user.id,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const unreadCount = await db.notification.count({
    where: { userId: session!.user.id, read: false },
  })

  return ok({ notifications, unreadCount })
}

// PATCH /api/notifications — mark all as read or specific ones
export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const { ids, markAllRead } = body

  if (markAllRead) {
    await db.notification.updateMany({
      where: { userId: session!.user.id, read: false },
      data: { read: true },
    })
    return ok({ message: 'Toutes les notifications marquées comme lues' })
  }

  if (ids && Array.isArray(ids) && ids.length > 0) {
    await db.notification.updateMany({
      where: { userId: session!.user.id, id: { in: ids } },
      data: { read: true },
    })
    return ok({ message: `${ids.length} notification(s) marquée(s) comme lue(s)` })
  }

  return err('Paramètres invalides')
}
