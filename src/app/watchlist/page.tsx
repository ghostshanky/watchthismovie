import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Star } from 'lucide-react';
import RemoveFromWatchlist from '@/components/RemoveFromWatchlist';

export default async function LibraryPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-20 text-white">Please log in.</div>;

  // FIX: Order by 'added_at', not 'created_at'
  const { data: movies, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  if (error) {
    console.error("Library Fetch Fetch Error:", error);
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-500">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Your Watchlist</h1>
            <p className="text-gray-300 text-sm">{movies?.length || 0} movies saved for later</p>
          </div>
        </div>

        {/* Grid */}
        {movies && movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <div key={movie.movie_id} className="group relative animate-in fade-in duration-500">

                {/* Movie Card */}
                <Link href={`/movie/${movie.movie_id}`} className="block relative aspect-[2/3] bg-gray-900 rounded-xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-all">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title || 'Movie'}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                  </div>
                </Link>

                {/* Title */}
                <h2 className="mt-3 font-bold text-sm truncate text-gray-300 group-hover:text-white transition-colors">
                  {movie.title}
                </h2>

                {/* Remove Button */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <RemoveFromWatchlist movieId={movie.movie_id} />
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <Bookmark className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold mb-2">Your list is empty</h3>
            <p className="text-gray-500 mb-6">Movies you want to watch will appear here.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
              Find Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}