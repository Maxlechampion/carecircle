import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err, parsePagination } from '@/lib/api-helpers'

// GET /api/appointments
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const url = new URL(request.url)
  const { skip, limit } = parsePagination(url)
  const upcoming = url.searchParams.get('upcoming') === 'true'

  const where = {
    userId: session!.user.id,
    ...(upcoming && { date: { gte: new Date() }, status: { not: 'cancelled' } }),
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      orderBy: { date: 'asc' },
      skip,
      take: limit,
      include: { recipient: { select: { id: true, name: true } } },
    }),
    db.appointment.count({ where }),
  ])

  return ok({ appointments, total, page: Math.ceil(skip / limit) + 1 })
}

// POST /api/appointments
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { title, date, duration, location, doctorName, type, notes, recipientId } = body

    if (!title?.trim()) return err('Le titre est requis')
    if (!date) return err('La date est requise')
    if (!recipientId) return err('La personne aidée est requise')

    // Verify recipient belongs to user
    const recipient = await db.careRecipient.findFirst({
      where: { id: recipientId, caregiverId: session!.user.id },
    })
    if (!recipient) return err('Personne aidée introuvable', 404)

    const appointment = await db.appointment.create({
      data: {
        userId: session!.user.id,
        recipientId,
        title: title.trim(),
        date: new Date(date),
        duration: duration || 30,
        location: location || '',
        doctorName: doctorName || '',
        type: type || 'medical',
        notes: notes || null,
        status: 'scheduled',
      },
      include: { recipient: { select: { id: true, name: true } } },
    })

    // Create reminder notification
    await db.notification.create({
      data: {
        userId: session!.user.id,
        title: 'Rendez-vous ajouté',
        message: `${title} le ${new Date(date).toLocaleDateString('fr-FR')}`,
        type: 'reminder',
      },
    })

    return ok(appointment, 201)
  } catch (e) {
    console.error('POST /api/appointments error:', e)
    return err('Erreur serveur', 500)
  }
}
