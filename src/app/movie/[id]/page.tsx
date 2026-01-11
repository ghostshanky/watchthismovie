'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: { name: string }[];
  videos: { results: { key: string; type: string }[] };
  "watch/providers": {
    results: {
      IN?: { 
        flatrate?: { provider_name: string; logo_path: string }[];
      };
    };
  };
}

export default function MoviePage() {
  const params = useParams(); 
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${params.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&append_to_response=videos,watch/providers`
      );
      const data = await res.json();
      setMovie(data);
    }
    if (params.id) fetchDetails();
  }, [params.id]);

  if (!movie) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Experience...</div>;

  const trailerKey = movie.videos?.results.find(v => v.type === "Trailer")?.key;
  const providers = movie["watch/providers"]?.results?.IN?.flatrate || [];

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[70vh] w-full bg-gray-900">
        {showTrailer && trailerKey ? (
          <div className="absolute inset-0 z-20 bg-black flex flex-col">
             {/* NATIVE YOUTUBE PLAYER - NO LIBRARIES NEEDED */}
             <iframe 
               width="100%" 
               height="100%" 
               src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} 
               title="YouTube video player" 
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
               className="flex-1"
             />
             <button 
               onClick={() => setShowTrailer(false)}
               className="absolute top-4 right-4 text-white bg-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-700 shadow-lg z-30"
             >
               Close X
             </button>
          </div>
        ) : (
          <>
            <Image
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-4xl">
              <div className="flex flex-wrap gap-3 mb-4 text-sm font-bold text-yellow-400">
                {movie.genres?.map(g => <span key={g.name} className="bg-gray-900/80 px-3 py-1 rounded-full border border-yellow-400/30">{g.name}</span>)}
                <span className="text-gray-300 px-3 py-1">⏱ {movie.runtime} min</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl">{movie.title}</h1>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="bg-white text-black px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-transform flex items-center gap-2"
                >
                  ▶ Watch Trailer
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. DETAILS SECTION */}
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        <div className="md:col-span-2 space-y-8">
          <h2 className="text-3xl font-bold text-blue-500">The Story</h2>
          <p className="text-xl text-gray-300 leading-relaxed font-light">{movie.overview}</p>
          
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
             <h3 className="text-xl font-bold mb-4 text-green-400">Why our AI picked this:</h3>
             <p className="text-gray-400 italic">
               &quot;Based on your love for {movie.genres[0]?.name} and high-stakes drama, this movie has a {Math.round(movie.vote_average * 10)}% match with your taste profile.&quot;
             </p>
          </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-2xl h-fit border border-gray-800 sticky top-8">
          <h3 className="text-xl font-bold mb-6">Available on:</h3>
          
          {providers.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {providers.map((provider) => (
                <div key={provider.provider_name} className="flex flex-col items-center gap-2">
                  <Image 
                    src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`} 
                    alt={provider.provider_name}
                    width={60}
                    height={60}
                    className="rounded-xl shadow-lg"
                  />
                  <span className="text-xs text-center text-gray-400">{provider.provider_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Not streaming in India right now.<br/>Check theaters or rental.
            </div>
          )}
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
             <p className="text-xs text-gray-500 mb-2">Support this project</p>
             <button className="w-full py-3 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition border border-blue-900">
               Buy Movie Merch
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}