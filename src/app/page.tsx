'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient'; // <--- NEW IMPORT
import { Movie } from './types'; 

export default function Home() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize the connection
  const supabase = createClient(); 

  useEffect(() => {
    async function fetchTrendingMovie() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`
        );
        const data = await res.json();
        const randomIndex = Math.floor(Math.random() * data.results.length);
        setMovie(data.results[randomIndex]);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrendingMovie();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-2xl text-blue-500 font-mono">
          INITIALIZING CINEMA AI...
        </div>
      </div>
    );
  }

  if (!movie) return <div className="text-white text-center mt-20">System Error. Retry.</div>;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          opacity: 0.6 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-2xl">
          Stop Scrolling. <span className="text-blue-500">Start Watching.</span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-2xl text-gray-200 mb-8 font-light leading-relaxed">
          {movie.title} is trending today. But is it right for <i>you</i>?
          <br/>
          <span className="text-sm text-gray-400 mt-2 block">
            Let our AI scan your taste DNA to find out.
          </span>
        </p>

        <button 
          className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
          onClick={async () => {
            const email = prompt("Enter your email for the magic link:");
            if (!email) return;
            
            const { error } = await supabase.auth.signInWithOtp({
              email: email,
              options: {
                // This redirects them to your new auth callback
                emailRedirectTo: `${location.origin}/auth/callback`,
              },
            })
            if (error) alert(error.message);
            else alert("Check your email for the login link!");
          }}
        >
          <span className="relative z-10">Find My Perfect Movie</span>
          <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>

      </div>
    </main>
  );
}