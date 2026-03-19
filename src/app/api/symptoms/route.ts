import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err, parsePagination } from '@/lib/api-helpers'

// GET /api/symptoms
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const url = new URL(request.url)
  const { skip, limit } = parsePagination(url)
  const recipientId = url.searchParams.get('recipientId')

  const where = {
    userId: session!.user.id,
    ...(recipientId && { recipientId }),
  }

  const [logs, total] = await Promise.all([
    db.symptomLog.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: { recipient: { select: { id: true, name: true } } },
    }),
    db.symptomLog.count({ where }),
  ])

  // Parse symptoms JSON
  const parsed = logs.map(l => ({
    ...l,
    symptoms: l.symptoms ? JSON.parse(l.symptoms) : [],
  }))

  return ok({ logs: parsed, total })
}

// POST /api/symptoms
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { symptoms, notes, mood, painLevel, recipientId, date } = body

    if (!recipientId) return err('La personne aidée est requise')
    if (!symptoms || !Array.isArray(symptoms)) return err('Les symptômes sont requis')

    // Verify recipient
    const recipient = await db.careRecipient.findFirst({
      where: { id: recipientId, caregiverId: session!.user.id },
    })
    if (!recipient) return err('Personne aidée introuvable', 404)

    const log = await db.symptomLog.create({
      data: {
        userId: session!.user.id,
        recipientId,
        date: date ? new Date(date) : new Date(),
        symptoms: JSON.stringify(symptoms),
        notes: notes || null,
        mood: mood ?? null,
        painLevel: painLevel ?? null,
      },
      include: { recipient: { select: { id: true, name: true } } },
    })

    return ok({ ...log, symptoms }, 201)
  } catch (e) {
    console.error('POST /api/symptoms error:', e)
    return err('Erreur serveur', 500)
  }
}
