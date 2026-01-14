import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LandingUser from '@/components/landing/LandingUser'; // The Welcome Page
import { fetchPersonalizedFeed, fetchTrendingMovies } from '@/app/actions';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // FETCH DATA FOR DASHBOARD VIEW
  const personalized = await fetchPersonalizedFeed(user.id);
  const trending = await fetchTrendingMovies();
  const bestMatch = personalized[0] || trending[0];

  return (
    <LandingUser user={user} bestMatch={bestMatch as any} />
  );
}