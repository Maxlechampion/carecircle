import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING_PLANS, PlanId } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, customerId, userId, userEmail } = body

    // Validate planId
    if (!planId || !PRICING_PLANS[planId as PlanId]) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      )
    }

    const plan = PRICING_PLANS[planId as PlanId]

    // Free plan doesn't need checkout
    if (plan.price === 0 || !plan.priceId) {
      return NextResponse.json({
        url: '/dashboard?plan=free&success=true',
      })
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      request.headers.get('origin') || 
      'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      ...(customerId && { customer: customerId }),
      success_url: `${baseUrl}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: userId || 'anonymous',
        userEmail: userEmail || '',
        planId,
      },
      subscription_data: {
        trial_period_days: 14, // 14 jours d'essai gratuit
        metadata: {
          userId: userId || 'anonymous',
          planId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
