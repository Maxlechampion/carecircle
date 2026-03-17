import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

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

// Simple in-memory rate limiter (in production, use Redis)
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
          error: 'Limite de messages atteinte', 
          resetTime: rateLimit.resetTime,
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    // Initialize AI
    const zai = await ZAI.create()

    // Build messages array for the AI
    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    // Call AI
    const completion = await zai.chat.completions.create({
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse. Veuillez réessayer.'

    return NextResponse.json(
      {
        message: assistantMessage,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      }
    )
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Graceful fallback for development
    const fallbackResponses = [
      "Je comprends votre situation. En tant qu'aidant, il est important de prendre soin de vous également. Avez-vous pensé à vous accorder des moments de répit ?",
      "C'est une excellente question. Je vous suggère de consulter les ressources disponibles dans l'onglet Ressources pour plus d'informations détaillées.",
      "Votre bien-être est essentiel. N'hésitez pas à utiliser le suivi de bien-être pour mesurer votre niveau de stress et trouver des conseils adaptés.",
      "Je note votre préoccupation. Pensez à documenter cela dans le journal de santé pour en discuter avec le professionnel de santé lors du prochain rendez-vous.",
      "Prendre soin d'un proche est un défi quotidien. Je suis là pour vous accompagner. Que souhaitez-vous aborder aujourd'hui ?"
    ]
    
    return NextResponse.json({
      message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      isFallback: true,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    })
  }
}
