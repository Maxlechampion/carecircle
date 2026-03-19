import { NextRequest, NextResponse } from 'next/server'

// Flutterwave API configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-placeholder'
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-placeholder'

interface PaymentRequest {
  amount: number
  currency: string
  plan: string
  billingCycle: string
  paymentMethod: string
  phoneNumber?: string
  email: string
  mobileMoneyProvider?: string
  userId?: string
}

// Flutterwave payment initialization
export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json()
    const {
      amount,
      currency,
      plan,
      billingCycle,
      paymentMethod,
      phoneNumber,
      email,
      mobileMoneyProvider,
      userId = 'anonymous',
    } = body

    // Validate required fields
    if (!amount || !currency || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique transaction reference
    const txRef = `CC_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Build payment payload based on payment method
    let payload: Record<string, unknown> = {
      tx_ref: txRef,
      amount: amount / 100, // Convert from cents
      currency: currency,
      email: email,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback`,
      customer: {
        email: email,
      },
      meta: {
        user_id: userId,
        plan: plan,
        billing_cycle: billingCycle,
      },
      customizations: {
        title: 'CareCircle Subscription',
        description: `${plan} plan - ${billingCycle}`,
        logo: 'https://carecircle.fr/logo.png',
      },
    }

    // Handle different payment methods
    if (paymentMethod === 'mobile_money') {
      // Mobile Money payment
      const providerMap: Record<string, string> = {
        'orange_money': 'orange_money',
        'mtn_money': 'mtn',
        'wave': 'wave',
        'moov_money': 'moov',
        'airtel_money': 'airtel',
        'mpesa': 'mpesa',
        'free_money': 'free',
        'wizall': 'wizall',
      }

      payload = {
        ...payload,
        payment_type: 'mobilemoney',
        phonenumber: phoneNumber,
        network: providerMap[mobileMoneyProvider || ''] || mobileMoneyProvider,
      }

      // Call Flutterwave Mobile Money API
      const response = await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return NextResponse.json({
          success: true,
          txRef,
          message: data.message,
          data: data.data,
        })
      } else {
        return NextResponse.json(
          { error: data.message || 'Payment initialization failed' },
          { status: 400 }
        )
      }
    } else if (paymentMethod === 'card') {
      // Card payment - redirect to Flutterwave checkout
      payload = {
        ...payload,
        payment_options: 'card',
      }

      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return NextResponse.json({
          success: true,
          txRef,
          link: data.data.link,
          publicKey: FLUTTERWAVE_PUBLIC_KEY,
        })
      } else {
        return NextResponse.json(
          { error: data.message || 'Payment initialization failed' },
          { status: 400 }
        )
      }
    } else {
      // Other payment methods
      return NextResponse.json({
        success: true,
        txRef,
        message: 'Payment method not yet implemented',
      })
    }
  } catch (error) {
    console.error('Flutterwave payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

// Verify payment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transaction_id')

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      )
    }

    // Verify with Flutterwave
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (data.status === 'success' && data.data.status === 'successful') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        amount: data.data.amount,
        currency: data.data.currency,
        txRef: data.data.tx_ref,
        plan: data.data.meta?.plan,
      })
    } else {
      return NextResponse.json({
        success: false,
        status: data.data?.status || 'failed',
      })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
