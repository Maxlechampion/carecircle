import { NextRequest, NextResponse } from 'next/server'
import { stripe, constructWebhookEvent, getPlanByPriceId } from '@/lib/stripe'
import Stripe from 'stripe'

// Webhook secret from Stripe CLI or Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Checkout completed:', session.id)
        
        const metadata = session.metadata || {}
        const userId = metadata.userId
        const planId = metadata.planId
        const userEmail = metadata.userEmail
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // TODO: Save to database
        // await db.subscription.create({
        //   data: {
        //     userId,
        //     planId,
        //     stripeCustomerId: customerId,
        //     stripeSubscriptionId: subscriptionId,
        //     status: 'active',
        //   }
        // })

        console.log(`📝 Subscription created: User ${userId}, Plan ${planId}`)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('✅ Subscription created:', subscription.id)
        
        // TODO: Update database
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🔄 Subscription updated:', subscription.id)
        
        const customerId = subscription.customer as string
        const status = subscription.status
        
        // Get the plan from the price ID
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? getPlanByPriceId(priceId) : null
        
        // TODO: Update database
        // await db.subscription.update({
        //   where: { stripeCustomerId: customerId },
        //   data: {
        //     status,
        //     planId: plan?.id,
        //     currentPeriodStart: new Date(subscription.current_period_start * 1000),
        //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
        //   }
        // })
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('❌ Subscription canceled:', subscription.id)
        
        const customerId = subscription.customer as string
        
        // TODO: Update database - downgrade to free plan
        // await db.subscription.update({
        //   where: { stripeCustomerId: customerId },
        //   data: {
        //     status: 'canceled',
        //     planId: 'free',
        //   }
        // })
        
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('💰 Invoice paid:', invoice.id)
        
        const customerId = invoice.customer as string
        
        // TODO: Update subscription status if needed
        
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('⚠️ Payment failed:', invoice.id)
        
        const customerId = invoice.customer as string
        
        // TODO: Notify user, update subscription status
        
        break
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        console.log('👤 Customer created:', customer.id)
        
        // TODO: Link customer to user in database
        
        break
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    )
  }
}

// Stripe webhooks only support POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
