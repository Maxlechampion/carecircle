import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// POST /api/medications/[id]/log — Mark medication as taken/untaken
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const med = await db.medication.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!med) return err('Médicament introuvable', 404)

  const { scheduledTime, taken, takenAt } = await request.json()

  if (taken) {
    // Add log entry
    const now = takenAt ? new Date(takenAt) : new Date()
    const log = await db.medicationLog.create({
      data: {
        medicationId: params.id,
        scheduledTime: scheduledTime || null,
        takenAt: now,
        notes: null,
      },
    })
    return ok(log, 201)
  } else {
    // Remove today's log for this scheduled time
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    await db.medicationLog.deleteMany({
      where: {
        medicationId: params.id,
        scheduledTime: scheduledTime || undefined,
        takenAt: { gte: startOfDay, lte: endOfDay },
      },
    })
    return ok({ message: 'Prise annulée' })
  }
}
