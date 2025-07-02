
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, orderId, notes } = await req.json()

    console.log('Creating Razorpay order with:', { amount, currency, orderId })

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials missing:', { 
        hasKeyId: !!razorpayKeyId, 
        hasKeySecret: !!razorpayKeySecret 
      })
      throw new Error('Razorpay credentials not configured')
    }

    const orderData = {
      amount: parseInt(amount),
      currency: currency || 'INR',
      receipt: orderId || `order_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1
    }

    console.log('Order data prepared:', orderData)

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    const responseText = await response.text()
    console.log('Razorpay API response:', { status: response.status, body: responseText })

    if (!response.ok) {
      console.error('Razorpay API error:', responseText)
      throw new Error(`Razorpay API error: ${response.status} - ${responseText}`)
    }

    const order = JSON.parse(responseText)
    console.log('Razorpay order created successfully:', order.id)

    return new Response(
      JSON.stringify({ 
        order,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
