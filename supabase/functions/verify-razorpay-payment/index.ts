// supabase/functions/verify-razorpay-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info,x-my-custom-header", // include all you use!
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET"
};



serve(async (req) => {
  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  // 2) Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // 3) Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 4) Parse request body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      amount,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing required payment parameters");
    }

    // 5) Compute expected signature
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpaySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    const expectedSignature = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment signature verification failed");
    }

    // 6) Upsert into payment_transactions
    const { data: existing } = await supabaseClient
      .from("payment_transactions")
      .select("id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (existing) {
      const { error: updateError } = await supabaseClient
        .from("payment_transactions")
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpay_order_id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseClient
        .from("payment_transactions")
        .insert({
          order_id,
          amount,
          currency: "INR",
          status: "completed",
          payment_method: "razorpay",
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });
      if (insertError) throw insertError;
    }

    // 7) Update franchise_orders status
    if (order_id) {
      const { error: orderError } = await supabaseClient
        .from("franchise_orders")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order_id);
      if (orderError) throw orderError;
    }

    // 8) Return success
    return new Response(
      JSON.stringify({ success: true, verified: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    // 9) Return error
    return new Response(
      JSON.stringify({ success: false, verified: false, error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
