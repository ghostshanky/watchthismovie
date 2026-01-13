import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { fetchDashboardRows } from '@/app/actions';
import { Star, PlayCircle } from 'lucide-react';

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

  // Fetch the Multi-Row Data
  const sections = await fetchDashboardRows(user.id);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          For You
        </h1>
        <p className="text-gray-400">Curated based on your Taste DNA.</p>
      </div>

      <div className="space-y-12 pb-20">
        {sections.map((section, idx) => (
          <section key={idx} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full" />
              {section.title}
            </h3>

            {/* HORIZONTAL SCROLL ROW */}
            <div className="flex gap-4 overflow-x-auto pb-6 premium-scrollbar snap-x">
              {section.movies.map((movie) => (
                <Link
                  href={`/movie/${movie.id}`}
                  key={movie.id}
                  className="relative flex-shrink-0 w-40 md:w-56 group snap-start"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 border border-white/5 group-hover:border-blue-500/50 transition-all group-hover:scale-105 group-hover:z-10 shadow-lg">
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                    )}

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <PlayCircle className="w-10 h-10 text-white" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">View</span>
                    </div>

                    {/* RATING BADGE (Top Left) */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {movie.vote_average.toFixed(1)}
                    </div>
                  </div>

                  <h4 className="mt-3 font-bold text-sm text-gray-300 truncate group-hover:text-white transition-colors">
                    {movie.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p>Not enough data yet. Go to the Dashboard and rate some movies!</p>
            <Link href="/dashboard" className="text-blue-500 hover:underline">Go to Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
}