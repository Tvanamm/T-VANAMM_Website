
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id,
      amount 
    } = await req.json()

    console.log('Payment verification request:', { razorpay_order_id, razorpay_payment_id, order_id, amount })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment parameters')
    }

    // Verify signature
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpaySecret) {
      throw new Error('Razorpay secret not configured')
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpaySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ).then(key => 
      crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )

    const isSignatureValid = expectedSignature === razorpay_signature

    if (!isSignatureValid) {
      console.error('Invalid signature:', { expected: expectedSignature, received: razorpay_signature })
      throw new Error('Payment signature verification failed')
    }

    console.log('Payment signature verified successfully')

    // Create or update payment transaction
    const { data: existingTransaction } = await supabaseClient
      .from('payment_transactions')
      .select('id')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (existingTransaction) {
      // Update existing transaction
      const { error: paymentError } = await supabaseClient
        .from('payment_transactions')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', razorpay_order_id)

      if (paymentError) {
        console.error('Payment transaction update error:', paymentError)
        throw new Error('Failed to update payment transaction')
      }
    } else {
      // Create new payment transaction
      const { error: paymentError } = await supabaseClient
        .from('payment_transactions')
        .insert({
          order_id: order_id,
          amount: amount,
          currency: 'INR',
          status: 'completed',
          payment_method: 'razorpay',
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        })

      if (paymentError) {
        console.error('Payment transaction creation error:', paymentError)
        throw new Error('Failed to create payment transaction')
      }
    }

    // Update order status if order_id is provided
    if (order_id) {
      const { error: orderError } = await supabaseClient
        .from('franchise_orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id)

      if (orderError) {
        console.error('Order status update error:', orderError)
        throw new Error('Failed to update order status')
      }

      console.log('Order status updated to confirmed:', order_id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: order_id || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        verified: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
