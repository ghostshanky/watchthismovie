import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LandingGuest from '@/components/landing/LandingGuest'; // We will create this
import LandingUser from '@/components/landing/LandingUser';   // We will create this

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // GOD LEVEL LOGIC:
  // If user is logged in, show the "Command Center" (LandingUser).
  // If guest, show the "Emotional Hook" (LandingGuest).
  return user ? <LandingUser user={user} /> : <LandingGuest />;
}