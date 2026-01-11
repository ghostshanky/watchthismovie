'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; 
import { Movie } from '../types'; 
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getRecommendations } from '../actions';
import { User } from '@supabase/supabase-js';
import { Play, Info, Star } from 'lucide-react';

export default function ResultsPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      // 1. Get User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // 2. Get AI Recommendations
      // Note: We are calling the Server Action we just created
      const recs = await getRecommendations(session.user.id);
      setMovies(recs as unknown as Movie[]); // Safe cast
      setLoading(false);
    }
    init();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm animate-pulse">Analyzing your taste profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-12 pb-20">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Top Picks for You
        </h1>
        <p className="text-gray-400 text-lg">
          Based on the movies you&apos;ve liked recently.
        </p>
      </div>

      {movies.length === 0 ? (
        // Empty State (If they haven't liked anything yet)
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Star className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No data yet</h3>
          <p className="text-gray-400 max-w-md mb-8">
            We need to know what you like before we can recommend anything. Go rate some movies!
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Start Rating
          </button>
        </div>
      ) : (
        // MOVIE GRID (Netflix Style)
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="group relative aspect-[2/3] bg-gray-900 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-blue-900/20"
              onClick={() => router.push(`/movie/${movie.id}`)}
            >
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="font-bold text-sm mb-1 leading-tight">{movie.title}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 mb-3">
                  <span className="text-green-400">98% Match</span>
                  <span>{movie.release_date?.split('-')[0]}</span>
                </div>
                
                <div className="flex gap-2">
                   <button className="flex-1 bg-white text-black py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-200">
                     <Play className="w-3 h-3" /> Play
                   </button>
                   <button className="p-1.5 bg-gray-600/50 rounded hover:bg-gray-600 border border-white/20">
                     <Info className="w-4 h-4 text-white" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}