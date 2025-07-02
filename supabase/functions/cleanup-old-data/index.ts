
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('Starting automated data cleanup...')

    // Call the cleanup function
    const { data, error } = await supabaseClient.rpc('cleanup_old_data')

    if (error) {
      console.error('Cleanup error:', error)
      throw error
    }

    console.log('Cleanup completed successfully')

    // Get latest cleanup log for response
    const { data: logData } = await supabaseClient
      .from('cleanup_logs')
      .select('*')
      .order('cleanup_date', { ascending: false })
      .limit(1)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Data cleanup completed successfully',
        log: logData?.[0] || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in cleanup function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
