import { NextRequest, NextResponse } from 'next/server'
import { createCustomerPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      request.headers.get('origin') || 
      'http://localhost:3000'

    const session = await createCustomerPortalSession({
      customerId,
      returnUrl: `${baseUrl}/settings/billing`,
    })

    return NextResponse.json({
      url: session.url,
    })

  } catch (error) {
    console.error('Portal session error:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'accès au portail client' },
      { status: 500 }
    )
  }
}
