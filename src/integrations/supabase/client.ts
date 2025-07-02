
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uvqnqnnzofuqlugtlfvr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cW5xbm56b2Z1cWx1Z3RsZnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MTg4MjgsImV4cCI6MjA2NDI5NDgyOH0.KAh4O2e2kNgWNM_Wq1gvoW7qwjjeXe6UyfTQSMLxJkc'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Reduced from 50 to avoid rate limits
    },
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-my-custom-header': 'tvanamm-app',
    },
  },
})
