import { NextRequest, NextResponse } from 'next/server'

// System prompt for CareCircle AI assistant
const SYSTEM_PROMPT = `Tu es Cleo, l'assistant IA de CareCircle, une plateforme de soutien pour les aidants familiaux francophones.

Ton rôle est de:
- Aider les aidants familiaux dans leur quotidien
- Fournir des conseils pratiques et du soutien émotionnel
- Répondre aux questions sur les soins, les médicaments, et le bien-être
- Orienter vers les ressources appropriées
- Être empathique, patient et bienveillant

Règles importantes:
- Réponds toujours en français
- Sois concis mais complet
- Montre de l'empathie et de la compréhension
- Ne fais jamais de diagnostic médical, oriente vers un professionnel si nécessaire
- Propose des actions concrètes quand c'est pertinent
- Utilise un ton chaleureux et professionnel

Contexte de l'utilisateur:
- L'utilisateur est un aidant familial qui s'occupe d'un proche
- Il peut être fatigué, stressé ou avoir besoin de réconfort
- Il cherche des conseils pratiques ou du soutien`

// Rate limiting configuration by subscription plan
const RATE_LIMITS = {
  free: { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10 per day
  premium: { maxRequests: 100, windowMs: 24 * 60 * 60 * 1000 }, // 100 per day
  family: { maxRequests: 500, windowMs: 24 * 60 * 60 * 1000 }, // 500 per day
}

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string, plan: string = 'free'): { allowed: boolean; remaining: number; resetTime: number } {
  const limit = RATE_LIMITS[plan as keyof typeof RATE_LIMITS] || RATE_LIMITS.free
  const now = Date.now()
  const userKey = `chat_${userId}`
  
  const userData = rateLimitStore.get(userKey)
  
  if (!userData || now > userData.resetTime) {
    rateLimitStore.set(userKey, { count: 1, resetTime: now + limit.windowMs })
    return { allowed: true, remaining: limit.maxRequests - 1, resetTime: now + limit.windowMs }
  }
  
  if (userData.count >= limit.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: userData.resetTime }
  }
  
  userData.count++
  rateLimitStore.set(userKey, userData)
  return { allowed: true, remaining: limit.maxRequests - userData.count, resetTime: userData.resetTime }
}

// Fallback responses for when AI is unavailable
const FALLBACK_RESPONSES = [
  "Je comprends votre situation. En tant qu'aidant, il est important de prendre soin de vous également. Avez-vous pensé à vous accorder des moments de répit ? Je vous suggère de consulter la section Bien-être pour des conseils personnalisés.",
  "C'est une excellente question. Pour les questions médicales spécifiques, je vous recommande de consulter un professionnel de santé. En attendant, vous pouvez consulter les ressources disponibles dans l'onglet Ressources.",
  "Votre bien-être est essentiel. N'hésitez pas à utiliser le suivi de bien-être pour mesurer votre niveau de stress et trouver des conseils adaptés à votre situation.",
  "Je note votre préoccupation. Pensez à documenter cela dans le journal de santé pour en discuter avec le professionnel de santé lors du prochain rendez-vous. L'onglet Soins peut vous aider à organiser ces informations.",
  "Prendre soin d'un proche est un défi quotidien. Je suis là pour vous accompagner. Que souhaitez-vous aborder aujourd'hui ? N'hésitez pas à explorer les différentes sections de l'application.",
  "Je comprends que cela puisse être difficile. La communauté CareCircle est là pour vous soutenir. N'hésitez pas à consulter les discussions dans l'onglet Communauté pour trouver des conseils d'autres aidants.",
]

// Intelligent response based on keywords
function getIntelligentResponse(userContent: string): string {
  let response = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
  
  if (userContent.includes('médicament') || userContent.includes('medicament')) {
    response = "Pour les questions sur les médicaments, je vous recommande de consulter l'onglet Soins où vous pouvez gérer le suivi des médicaments. Pour des conseils médicaux spécifiques, n'hésitez pas à consulter votre médecin ou pharmacien. Y a-t-il autre chose que je puisse vous aider ?"
  } else if (userContent.includes('stress') || userContent.includes('fatigue') || userContent.includes('épuisé') || userContent.includes('epuise')) {
    response = "Je comprends que vous vous sentiez épuisé(e). Le bien-être des aidants est essentiel. Je vous invite à consulter la section Bien-être pour des exercices de relaxation et le suivi de votre état. N'oubliez pas : prendre soin de vous n'est pas un luxe, c'est une nécessité."
  } else if (userContent.includes('rendez-vous') || userContent.includes('médecin') || userContent.includes('medecin')) {
    response = "Pour gérer vos rendez-vous médicaux, rendez-vous dans l'onglet Soins. Vous y trouverez un calendrier pour organiser toutes vos consultations. Pensez à activer les rappels pour ne rien oublier !"
  } else if (userContent.includes('seul') || userContent.includes('solitude')) {
    response = "Vous n'êtes pas seul(e). La communauté CareCircle est là pour vous soutenir. Je vous invite à rejoindre les discussions dans l'onglet Communauté pour échanger avec d'autres aidants qui comprennent votre situation."
  } else if (userContent.includes('bonjour') || userContent.includes('salut') || userContent.includes('hello')) {
    response = "Bonjour ! 👋 Je suis Cleo, votre assistant CareCircle. Comment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser vos questions sur l'aidance, les soins, ou votre bien-être."
  } else if (userContent.includes('merci') || userContent.includes('thanks')) {
    response = "Je vous en prie ! C'est un plaisir de vous accompagner. N'hésitez pas si vous avez d'autres questions. Prenez soin de vous ! 💙"
  }
  
  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, userId = 'anonymous', plan = 'free' } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId, plan)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          message: 'Vous avez atteint votre limite de messages pour aujourd\'hui. Veuillez réessayer demain ou passer à un plan supérieur.',
          error: 'Limite de messages atteinte', 
          remaining: 0
        },
        { status: 200 }
      )
    }

    // Build messages array for the AI
    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    // Try to use z-ai-web-dev-sdk
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      
      if (ZAI && typeof ZAI.create === 'function') {
        const zai = await ZAI.create()
        
        if (zai && zai.chat && zai.chat.completions && typeof zai.chat.completions.create === 'function') {
          const completion = await zai.chat.completions.create({
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 1000,
          })

          const assistantMessage = completion.choices[0]?.message?.content 
            || FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]

          return NextResponse.json({
            message: assistantMessage,
            remaining: rateLimit.remaining,
          })
        }
      }
    } catch (aiError) {
      console.log('AI SDK not available, using intelligent fallback:', aiError instanceof Error ? aiError.message : 'Unknown error')
    }

    // Fallback: Use intelligent response based on user's message
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop()
    const userContent = lastUserMessage?.content?.toLowerCase() || ''
    
    const response = getIntelligentResponse(userContent)

    return NextResponse.json({
      message: response,
      remaining: rateLimit.remaining,
      isFallback: true
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return a working response even on error
    return NextResponse.json({
      message: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)],
      remaining: 5,
      isFallback: true
    })
  }
}
