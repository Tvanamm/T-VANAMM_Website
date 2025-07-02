
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
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    
    if (!razorpayKeyId) {
      console.error('RAZORPAY_KEY_ID not found in environment variables')
      throw new Error('Razorpay key not configured')
    }

    console.log('Razorpay key fetched successfully')

    return new Response(
      JSON.stringify({ 
        key: razorpayKeyId,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching Razorpay key:', error)
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
