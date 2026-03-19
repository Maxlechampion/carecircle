import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const SYSTEM_PROMPT = `Tu es Cleo, l'assistant IA de CareCircle, une plateforme de soutien pour les aidants familiaux francophones.

Ton rôle est de:
- Aider les aidants familiaux dans leur quotidien
- Fournir des conseils pratiques et du soutien émotionnel
- Répondre aux questions sur les soins, les médicaments, et le bien-être
- Orienter vers les ressources appropriées
- Être empathique, patient et bienveillant

Règles importantes:
- Réponds toujours en français
- Sois concis mais complet (max 3-4 paragraphes)
- Montre de l'empathie et de la compréhension
- Ne fais jamais de diagnostic médical, oriente vers un professionnel si nécessaire
- Propose des actions concrètes quand c'est pertinent
- Utilise un ton chaleureux et professionnel`

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  free: { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 },
  premium: { maxRequests: 100, windowMs: 24 * 60 * 60 * 1000 },
  family: { maxRequests: 500, windowMs: 24 * 60 * 60 * 1000 },
}

// In-memory rate limiter (resets on server restart — fine for Vercel serverless)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string, plan = 'free') {
  const limit = RATE_LIMITS[plan] || RATE_LIMITS.free
  const now = Date.now()
  const key = `chat_${userId}`
  const data = rateLimitStore.get(key)

  if (!data || now > data.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs })
    return { allowed: true, remaining: limit.maxRequests - 1 }
  }
  if (data.count >= limit.maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  data.count++
  return { allowed: true, remaining: limit.maxRequests - data.count }
}

const FALLBACK_RESPONSES = [
  "Je comprends votre situation. En tant qu'aidant, il est important de prendre soin de vous également. Avez-vous pensé à vous accorder des moments de répit ? Consultez la section Bien-être pour des conseils personnalisés.",
  "C'est une excellente question. Pour les questions médicales spécifiques, je vous recommande de consulter un professionnel de santé. En attendant, les ressources disponibles dans l'onglet Ressources peuvent vous aider.",
  "Votre bien-être est essentiel. N'hésitez pas à utiliser le suivi de bien-être pour mesurer votre niveau de stress et trouver des conseils adaptés à votre situation.",
  "Prendre soin d'un proche est un défi quotidien. Je suis là pour vous accompagner. Que souhaitez-vous aborder aujourd'hui ?",
  "Je comprends que cela puisse être difficile. La communauté CareCircle est là pour vous soutenir. N'hésitez pas à consulter les discussions dans l'onglet Communauté.",
]

function getSmartFallback(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('médicament') || lower.includes('medicament') || lower.includes('pilule') || lower.includes('ordonnance'))
    return "Pour les questions sur les médicaments, je vous recommande l'onglet Soins où vous pouvez gérer le suivi. Pour des conseils médicaux spécifiques, consultez votre médecin ou pharmacien."
  if (lower.includes('stress') || lower.includes('fatigue') || lower.includes('épuisé') || lower.includes('burnout'))
    return "Je comprends que vous vous sentiez épuisé(e). L'onglet Bien-être propose des exercices de relaxation et un suivi de votre état. N'oubliez pas : prendre soin de vous n'est pas un luxe, c'est une nécessité."
  if (lower.includes('rendez-vous') || lower.includes('médecin') || lower.includes('consultation'))
    return "Pour gérer vos rendez-vous médicaux, l'onglet Soins vous permet d'organiser toutes vos consultations avec des rappels automatiques."
  if (lower.includes('seul') || lower.includes('solitude') || lower.includes('isolé'))
    return "Vous n'êtes pas seul(e). La communauté CareCircle est là pour vous soutenir. Rejoignez les discussions dans l'onglet Communauté pour échanger avec d'autres aidants qui comprennent votre situation."
  if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello'))
    return "Bonjour ! 👋 Je suis Cleo, votre assistant CareCircle. Comment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser vos questions sur l'aidance, les soins ou votre bien-être."
  if (lower.includes('merci'))
    return "Je vous en prie ! C'est un plaisir de vous accompagner. N'hésitez pas si vous avez d'autres questions. Prenez soin de vous ! 💙"
  if (lower.includes('alzheimer') || lower.includes('démence') || lower.includes('memoire'))
    return "L'accompagnement d'une personne atteinte d'Alzheimer demande beaucoup de patience et d'adaptation. Je vous recommande de consulter notre guide complet dans les Ressources, et d'échanger avec notre groupe communautaire dédié à cette pathologie."
  if (lower.includes('aide') || lower.includes('allocation') || lower.includes('apa') || lower.includes('financi'))
    return "Des aides financières existent pour les aidants : l'APA (Allocation Personnalisée d'Autonomie), la PCH, le répit aidants... Consultez notre ressource 'Aides financières 2025' dans l'onglet Ressources pour une liste complète."
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { messages, plan } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 })
    }

    const userId = session?.user?.id || 'anonymous'
    const userPlan = session?.user?.subscriptionPlan || plan || 'free'

    // Rate limiting
    const rateLimit = checkRateLimit(userId, userPlan)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        message: "Vous avez atteint votre limite de messages pour aujourd'hui. Passez à un plan supérieur pour continuer.",
        remaining: 0,
        limitReached: true,
      })
    }

    // Build messages for AI
    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    let assistantMessage: string
    let isFallback = false

    // Try z-ai-web-dev-sdk (Anthropic SDK wrapper)
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      if (ZAI && typeof ZAI.create === 'function') {
        const zai = await ZAI.create()
        if (zai?.chat?.completions?.create) {
          const completion = await zai.chat.completions.create({
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 600,
          })
          assistantMessage = completion.choices[0]?.message?.content || getSmartFallback(messages[messages.length - 1]?.content || '')
        } else {
          throw new Error('SDK not available')
        }
      } else {
        throw new Error('ZAI not available')
      }
    } catch {
      // Fallback to smart responses
      const lastUser = messages.filter((m: { role: string }) => m.role === 'user').pop()
      assistantMessage = getSmartFallback(lastUser?.content?.toLowerCase() || '')
      isFallback = true
    }

    // Persist messages to DB if user is authenticated
    if (session?.user?.id) {
      try {
        await db.chatMessage.createMany({
          data: [
            {
              userId: session.user.id,
              role: 'user',
              content: messages[messages.length - 1]?.content || '',
            },
            {
              userId: session.user.id,
              role: 'assistant',
              content: assistantMessage,
            },
          ],
        })
      } catch (dbErr) {
        console.error('Failed to persist chat messages:', dbErr)
        // Non-blocking — continue even if DB write fails
      }
    }

    return NextResponse.json({
      message: assistantMessage,
      remaining: rateLimit.remaining,
      isFallback,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      message: FALLBACK_RESPONSES[0],
      remaining: 5,
      isFallback: true,
    })
  }
}

// GET /api/chat — fetch conversation history from DB
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const url = new URL(request.url)
  const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'))

  const messages = await db.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })

  return NextResponse.json({ messages })
}
