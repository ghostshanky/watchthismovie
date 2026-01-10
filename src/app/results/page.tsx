'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { getUserTasteProfile, getAIRecommendations } from '@/lib/recommendationEngine';
import { Movie } from '../types';
import Image from 'next/image';
import Link from 'next/link';

export default function Results() {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function generateMagic() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // FIX IS HERE: Passing 'supabase' as the second argument
      const topGenres = await getUserTasteProfile(session.user.id, supabase);
      
      if (!topGenres) {
        // Fallback if they haven't rated enough
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`);
        const data = await res.json();
        setRecommendations(data.results);
      } else {
        // Get the Perfect Match
        const recs = await getAIRecommendations(topGenres);
        setRecommendations(recs);
      }
      setLoading(false);
    }
    generateMagic();
  }, [supabase]);

  if (loading) return (
    <div className="h-screen bg-black text-white flex items-center justify-center font-mono text-xl animate-pulse">
      PROCESSING TASTE DNA...
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Your Cinema DNA Matches
        </h1>
        <p className="text-gray-400">Based on your recent ratings, you will love these.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {recommendations.map((movie) => (
          <div key={movie.id} className="group relative bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
            {/* Poster */}
            <div className="relative aspect-[2/3]">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <span className="text-green-400 font-bold text-xl mb-2">{Math.round(movie.vote_average * 10)}% Match</span>
                <p className="text-sm text-gray-300 line-clamp-4">{movie.overview}</p>
                <Link href={`/movie/${movie.id}`} key={movie.id}>
  <div className="group relative bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
    {/* ... keeps the image and content exactly the same ... */}
    {/* Inside the overlay, change the button to be just visual since the whole card is a link */}
    <span className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-full inline-block">
      View Details
    </span>
    {/* ... */}
  </div>
</Link>
              </div>
            </div>
            
            {/* Title */}
            <div className="p-4">
              <h3 className="font-bold truncate">{movie.title}</h3>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{movie.release_date?.split('-')[0]}</span>
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center">
         <Link href="/dashboard" className="text-blue-500 hover:underline">
            Rate more movies to refine your DNA &rarr;
         </Link>
      </div>
    </div>
  );
}