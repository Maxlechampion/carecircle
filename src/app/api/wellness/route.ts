import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/wellness — fetch last 7-30 days of logs
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const url = new URL(request.url)
  const days = parseInt(url.searchParams.get('days') || '7')

  const since = new Date()
  since.setDate(since.getDate() - days)

  const logs = await db.wellnessLog.findMany({
    where: {
      userId: session!.user.id,
      date: { gte: since },
    },
    orderBy: { date: 'asc' },
  })

  // Build summary from the most recent log
  const latest = logs[logs.length - 1]
  const score = latest
    ? Math.round(
        100 -
          (latest.stressLevel || 5) * 5 +
          (latest.mood || 3) * 8 +
          Math.min((latest.sleepHours || 7), 9) * 3 +
          (latest.physicalActivity ? 10 : 0)
      )
    : 72

  // Format history for charts
  const history = logs.map(l => ({
    date: new Date(l.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
    score: Math.min(
      100,
      Math.max(
        0,
        100 -
          (l.stressLevel || 5) * 5 +
          (l.mood || 3) * 8 +
          Math.min(l.sleepHours || 7, 9) * 3 +
          (l.physicalActivity ? 10 : 0)
      )
    ),
    stress: l.stressLevel || 5,
    sleep: l.sleepHours || 7,
    mood: l.mood || 3,
  }))

  return ok({
    score: Math.min(100, Math.max(0, score)),
    stressLevel: latest?.stressLevel ?? 5,
    sleepHours: latest?.sleepHours ?? 7,
    mood: latest?.mood ?? 3,
    physicalActivity: latest?.physicalActivity ?? false,
    lastUpdated: latest?.date ?? new Date().toISOString(),
    history,
    logs,
  })
}

// POST /api/wellness — save a wellness check-in
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { stressLevel, sleepHours, mood, physicalActivity, selfCareTime, notes } = body

    // Check if already logged today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingToday = await db.wellnessLog.findFirst({
      where: {
        userId: session!.user.id,
        date: { gte: today, lt: tomorrow },
      },
    })

    const data = {
      stressLevel: stressLevel ?? null,
      sleepHours: sleepHours ?? null,
      mood: mood ?? null,
      physicalActivity: physicalActivity ?? false,
      selfCareTime: selfCareTime ?? null,
      notes: notes ?? null,
    }

    let log
    if (existingToday) {
      log = await db.wellnessLog.update({ where: { id: existingToday.id }, data })
    } else {
      log = await db.wellnessLog.create({
        data: { userId: session!.user.id, date: new Date(), ...data },
      })
    }

    // Calculate score
    const score = Math.min(
      100,
      Math.max(
        0,
        100 -
          (stressLevel || 5) * 5 +
          (mood || 3) * 8 +
          Math.min(sleepHours || 7, 9) * 3 +
          (physicalActivity ? 10 : 0)
      )
    )

    return ok({ log, score })
  } catch (e) {
    console.error('POST /api/wellness error:', e)
    return err('Erreur serveur', 500)
  }
}
