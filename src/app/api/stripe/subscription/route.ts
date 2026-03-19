import { NextRequest, NextResponse } from 'next/server'
import { stripe, isSubscriptionActive, PlanId } from '@/lib/stripe'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const sessionId = searchParams.get('sessionId')

    // Get subscription from checkout session
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      })

      if (session.subscription && typeof session.subscription === 'object') {
        const subscription = session.subscription as Stripe.Subscription
        const customer = session.customer as Stripe.Customer

        return NextResponse.json({
          subscription: {
            id: subscription.id,
            status: subscription.status,
            active: isSubscriptionActive(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            planId: 'premium', // Default, should be derived from price
          },
          customer: {
            id: customer.id,
            email: customer.email,
          },
        })
      }
    }

    // Get subscription from customer ID
    if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 10,
      })

      const activeSubscription = subscriptions.data.find(
        (sub) => isSubscriptionActive(sub.status)
      )

      if (activeSubscription) {
        return NextResponse.json({
          subscription: {
            id: activeSubscription.id,
            status: activeSubscription.status,
            active: isSubscriptionActive(activeSubscription.status),
            currentPeriodStart: new Date(activeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
            planId: 'premium',
          },
        })
      }

      return NextResponse.json({
        subscription: null,
        message: 'Aucun abonnement actif trouvé',
      })
    }

    return NextResponse.json(
      { error: 'Paramètre customerId ou sessionId requis' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Get subscription error:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID d\'abonnement requis' },
        { status: 400 }
      )
    }

    // Cancel at period end (not immediately)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      message: 'L\'abonnement sera annulé à la fin de la période en cours',
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    )
  }
}

// Reactivate subscription
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID d\'abonnement requis' },
        { status: 400 }
      )
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: false,
      },
      message: 'Abonnement réactivé avec succès',
    })

  } catch (error) {
    console.error('Reactivate subscription error:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de la réactivation de l\'abonnement' },
      { status: 500 }
    )
  }
}
