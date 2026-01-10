'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; 
import { Movie } from '../types'; 
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { User } from '@supabase/supabase-js'; // <--- FIX 1: Import the real type

export default function Dashboard() {
  // FIX 2: Use the real type instead of <any>
  const [user, setUser] = useState<User | null>(null); 
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(50);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/'); 
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router, supabase]);

  useEffect(() => {
    async function loadTrainingMovies() {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&language=en-US&page=1`
      );
      const data = await res.json();
      setMovies(data.results);
    }
    loadTrainingMovies();
  }, []);

  // FIX 3: The "Ghost Movie" Logic is included here
  // FIX: Added { onConflict } to prevent "Duplicate Key" errors
  const handleRate = async (hasWatched: boolean) => {
    if (!user || !movies[currentIndex]) return;

    const currentMovie = movies[currentIndex];

    // STEP A: Save Movie (The Wall)
    const { error: movieError } = await supabase
      .from('movies')
      .upsert({
        id: currentMovie.id,
        title: currentMovie.title,
        poster_path: currentMovie.poster_path,
        backdrop_path: currentMovie.backdrop_path,
        overview: currentMovie.overview,
        release_date: currentMovie.release_date,
        tmdb_rating: currentMovie.vote_average,
      });

    if (movieError) console.error("Movie Cache Error:", movieError);

    // STEP B: Save Rating (The Picture)
    const { error: ratingError } = await supabase
      .from('user_interactions')
      .upsert({
        user_id: user.id,
        movie_id: currentMovie.id,
        has_watched: hasWatched,
        rating: hasWatched ? rating : null,
        liked: rating > 70
      }, { onConflict: 'user_id, movie_id' }) // <--- THE MAGIC FIX IS HERE
      .select();

    if (ratingError) {
      console.error("Mind Read Error:", ratingError);
      // Optional: alert(ratingError.message); 
      // We don't alert anymore, we just log it, so the user flow isn't interrupted
    }

    // Always move to next movie, even if there was a glitch
    setCurrentIndex((prev) => prev + 1);
    setRating(50);
  };

  const movie = movies[currentIndex];

  if (!user || !movie) return <div className="bg-black h-screen text-white flex items-center justify-center">Loading Mind Reader...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-10 px-4">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
  <h2 className="text-xl font-bold text-gray-400">AI Calibration</h2>
  {/* NEW BUTTON */}
  <button 
    onClick={() => router.push('/results')}
    className="text-xs bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-bold transition"
  >
    Get My Results &rarr;
  </button>
</div>

      <div className="relative w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
        <div className="h-96 w-full relative">
           <Image 
             src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
             alt={movie.title}
             fill
             className="object-cover"
             priority
           />
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
           <div className="absolute bottom-4 left-4 right-4 z-10">
             <h1 className="text-3xl font-bold leading-tight">{movie.title}</h1>
             <p className="text-sm text-gray-400 mt-1 line-clamp-2">{movie.overview}</p>
           </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleRate(false)}
              className="py-3 bg-gray-800 rounded-xl font-semibold hover:bg-gray-700 transition"
            >
              Never Seen It
            </button>
            <button 
              onClick={() => handleRate(true)}
              className="py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition"
            >
              I&apos;ve Seen It
            </button>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Hated it</span>
              <span className="text-blue-400 font-bold">{rating}%</span>
              <span>Loved it</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={rating} 
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <button 
            onClick={() => handleRate(true)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            Confirm Rating
          </button>
        </div>
      </div>
    </div>
  );
}