import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { fetchDashboardRows } from '@/app/actions';
import { Star, PlayCircle } from 'lucide-react';
import SmartMovieCard from '@/components/SmartMovieCard';

export default async function ResultsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-20 text-white">Please log in to see recommendations.</div>;
  }

  // 1. FETCH USER'S SEEN ID LIST (The "Memory")
  const { data: seenData } = await supabase
    .from('user_interactions')
    .select('movie_id')
    .eq('user_id', user.id);

  const seenIds = new Set(seenData?.map(x => x.movie_id) || []);

  // 2. FETCH RECOMMENDATIONS (Existing logic)
  const sections = await fetchDashboardRows(user.id);

  // 3. FILTER OUT SEEN MOVIES (The "Smart" Exclusion)
  const cleanedSections = sections.map(section => ({
    ...section,
    movies: section.movies.filter(m => !seenIds.has(m.id))
  })).filter(section => section.movies.length > 0); // Remove empty rows

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          For You
        </h1>
        <p className="text-gray-400">Curated based on your Taste DNA.</p>
      </div>

      <div className="space-y-12 pb-20">
        {cleanedSections.map((section, idx) => (
          <section key={idx} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full" />
              {section.title}
            </h3>

            {/* HORIZONTAL SCROLL ROW */}
            <div className="flex gap-4 overflow-x-auto pb-6 premium-scrollbar snap-x">
              {section.movies.map((movie) => (
                <div key={movie.id} className="relative flex-shrink-0 w-40 md:w-56 group snap-start">
                  <SmartMovieCard
                    movie={movie}
                    userId={user.id}
                    isSeen={seenIds.has(movie.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {cleanedSections.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p>Not enough data yet. Go to the Dashboard and rate some movies!</p>
            <Link href="/rate" className="text-blue-500 hover:underline">Go to Rate</Link>
          </div>
        )}
      </div>
    </div>
  );
}