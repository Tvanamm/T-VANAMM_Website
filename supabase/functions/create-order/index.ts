
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();
    console.log('Creating order with amount (rupees):', amount);

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount provided');
    }

    // Get Razorpay credentials from environment
    const keyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_bCpbFVcCkNuYT6';
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'H6gQuUigPc7h2YtvhkVTg2vW';

    console.log('Using Razorpay Key ID:', keyId);

    // Convert amount from rupees to paise
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const orderData = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        created_at: new Date().toISOString()
      }
    };

    console.log('Sending order data to Razorpay:', orderData);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Razorpay API error: ${response.status} - ${errorText}`);
    }

    const order = await response.json();
    console.log('Razorpay order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create order'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
