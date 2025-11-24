import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      throw new Error('Unsubscribe token is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pcyohjfdxkujufprlkxh.supabase.co'
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update the newsletter signup record
    const { data, error } = await supabase
      .from('newsletter_signups')
      .update({
        subscribed: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', token)
      .select()

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error('Invalid unsubscribe token')
    }

    console.log('User unsubscribed:', data[0].email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully unsubscribed',
        email: data[0].email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
