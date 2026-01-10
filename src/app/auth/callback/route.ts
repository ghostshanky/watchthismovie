import { NextResponse } from 'next/server'
// Import the SERVER client we just made
import { createClient } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // 1. Create the secure server client
    const supabase = await createClient()
    
    // 2. Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Auth error:", error)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }

  // 3. Redirect to Dashboard on success
  return NextResponse.redirect(`${origin}/dashboard`)
}