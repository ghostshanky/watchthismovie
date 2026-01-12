import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, Trash2, Calendar, Star } from 'lucide-react';
import WatchlistButton from '@/components/WatchlistButton';

export default async function WatchlistPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { }
        },
      },
    }
  );

  // 1. Get the Current User
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <Link href="/login" className="px-6 py-2 bg-white text-black rounded-full font-bold">
          Go to Login
        </Link>
      </div>
    );
  }

  // 2. Fetch Watchlist
  const { data: movies } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false }); // Newest first

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
            Your Watchlist
          </h1>
          <p className="text-gray-400 text-lg">
            {movies?.length || 0} movies saved for later.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {(!movies || movies.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <PlayCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">It&apos;s quiet here...</h3>
          <p className="text-gray-400 max-w-md mb-8">
            You haven&apos;t saved any movies yet. Browse recommendations to find something to watch.
          </p>
          <Link 
            href="/results"
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Find Movies
          </Link>
        </div>
      ) : (
        // Movie Grid
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div key={movie.movie_id} className="group relative aspect-[2/3] bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-white/5 transition-all hover:scale-105 hover:z-10 hover:shadow-2xl hover:border-green-500/30">
              
              {/* Poster Image */}
              <Link href={`/movie/${movie.movie_id}`} className="absolute inset-0">
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs">No Poster</div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="font-bold text-sm mb-1 leading-tight text-white">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{movie.vote_average?.toFixed(1)}</span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full" />
                    <span>{movie.release_date?.split('-')[0]}</span>
                  </div>
                </div>
              </Link>

              {/* Quick Remove Button (Top Right) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {/* reusing your WatchlistButton logic to toggle (remove) */}
                <div className="scale-75 origin-top-right">
                  <WatchlistButton 
                    movieId={movie.movie_id}
                    title={movie.title}
                    poster_path={movie.poster_path}
                    release_date={movie.release_date}
                    vote_average={movie.vote_average}
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}