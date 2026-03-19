import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/medications
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const url = new URL(request.url)
  const active = url.searchParams.get('active')

  const medications = await db.medication.findMany({
    where: {
      userId: session!.user.id,
      ...(active === 'true' && { active: true }),
    },
    orderBy: { createdAt: 'asc' },
    include: {
      recipient: { select: { id: true, name: true } },
      logs: {
        where: {
          takenAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        select: { id: true, takenAt: true, scheduledTime: true },
      },
    },
  })

  // Transform: add takenToday map
  const result = medications.map(med => {
    const times = med.times ? JSON.parse(med.times) : []
    const takenToday: Record<string, boolean> = {}
    times.forEach((t: string) => {
      takenToday[t] = med.logs.some(l => l.scheduledTime === t)
    })
    return { ...med, times, takenToday }
  })

  return ok(result)
}

// POST /api/medications
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { name, dosage, frequency, times, instructions, startDate, endDate, prescribingDoc, recipientId } = body

    if (!name?.trim()) return err('Le nom du médicament est requis')
    if (!dosage?.trim()) return err('Le dosage est requis')
    if (!recipientId) return err('La personne aidée est requise')

    // Verify recipient
    const recipient = await db.careRecipient.findFirst({
      where: { id: recipientId, caregiverId: session!.user.id },
    })
    if (!recipient) return err('Personne aidée introuvable', 404)

    const medication = await db.medication.create({
      data: {
        userId: session!.user.id,
        recipientId,
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency || 'Une fois par jour',
        times: JSON.stringify(times || ['08:00']),
        instructions: instructions || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        prescribingDoc: prescribingDoc || null,
        active: true,
      },
      include: { recipient: { select: { id: true, name: true } } },
    })

    const timesArr = times || ['08:00']
    return ok({
      ...medication,
      times: timesArr,
      takenToday: timesArr.reduce((acc: Record<string,boolean>, t: string) => ({ ...acc, [t]: false }), {}),
    }, 201)
  } catch (e) {
    console.error('POST /api/medications error:', e)
    return err('Erreur serveur', 500)
  }
}
