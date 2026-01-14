export const dynamic = 'force-dynamic';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LandingGuest from '@/components/landing/LandingGuest';
import LandingUser from '@/components/landing/LandingUser';
import { fetchPersonalizedFeed, fetchTrendingMovies } from '@/app/actions';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // FETCH THE #1 RECOMMENDATION FOR THIS USER
    const personalized = await fetchPersonalizedFeed(user.id);
    const trending = await fetchTrendingMovies();

    // Fallback to trending if personalized is empty
    const bestMatch = personalized[0] || trending[0];

    return <LandingUser user={user} bestMatch={bestMatch as any} />;
  }

  return <LandingGuest />;
}