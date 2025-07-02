// supabase/functions/create-razorpay-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "*",              // allow any header
  "Access-Control-Allow-Methods": "POST,OPTIONS",   // allow POST + preflight
};

serve(async (req) => {
  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 2) Only accept POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // 3) Parse body
    const { amount, currency = "INR", orderId, notes = {} } = await req.json();

    // 4) Validate
    if (typeof amount === "undefined") {
      throw new Error("Missing `amount` in request body");
    }

    // 5) Load env vars
    const keyId     = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // 6) Prepare payload
    const orderData = {
      amount:          Math.floor(Number(amount)),  // paise or main unit as agreed
      currency,
      receipt:         orderId ?? `order_${Date.now()}`,
      notes,
      payment_capture: 1,
    };

    // 7) Basic Auth header
    const auth = btoa(`${keyId}:${keySecret}`);

    // 8) Hit Razorpay API
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method:  "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Razorpay API error (${res.status}): ${text}`);
    }

    const order = JSON.parse(text);

    // 9) Success response
    return new Response(JSON.stringify({ order, success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    // 10) Error response
    console.error("Error creating Razorpay order:", err);
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
