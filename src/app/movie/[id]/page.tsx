import Image from 'next/image';
import { getMovieDetails } from '@/app/actions';
import { PlayCircle, Star, Clock, Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import WatchlistButton from '@/components/WatchlistButton';

// 1. DEFINE TYPES
interface Genre {
  id: number;
  name: string;
}

interface CastMember {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
}

interface Video {
  key: string;
  type: string;
  site: string;
}

interface SimilarMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  runtime: number;
  release_date: string;
  vote_average: number;
  genres: Genre[];
  credits: {
    cast: CastMember[];
  };
  videos: Video[];
  similar: SimilarMovie[];
}

// Helper to format minutes
const formatRuntime = (minutes: number) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

// FIX: Strictly async params handling for Next.js 16
export default async function MovieDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  // Fetch Data
  const movie = await getMovieDetails(id) as unknown as MovieDetails;

  // 1. SAFETY CHECK: If the API failed to get the TITLE, the movie is broken.
  if (!movie || !movie.title) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Movie details unavailable</h1>
        <Link href="/results" className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200">
          Return to Results
        </Link>
      </div>
    );
  }

  // Find Trailer
  const trailer = movie.videos?.find((v) => v.type === "Trailer" && v.site === "YouTube") || movie.videos?.[0];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[80vh] w-full">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gray-900" /> 
          {movie.backdrop_path && (
            <Image 
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>

        <div className="absolute top-24 left-6 z-20">
          <Link href="/results" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            <ChevronLeft className="w-4 h-4" /> Back to Results
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 max-w-4xl">
           {/* TAGS (Safe Map) */}
           <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-bold tracking-widest uppercase">
             {(movie.genres || []).map((g) => (
               <span key={g.id} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded">
                 {g.name}
               </span>
             ))}
           </div>

           <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{movie.title}</h1>
           
           <div className="flex items-center gap-6 text-sm md:text-base font-medium text-gray-300 mb-8">
             <span className="flex items-center gap-2 text-green-400">
               <Star className="w-4 h-4 fill-green-400" /> {movie.vote_average?.toFixed(1)} Match
             </span>
             <span className="flex items-center gap-2">
               <Clock className="w-4 h-4" /> {formatRuntime(movie.runtime)}
             </span>
             <span className="flex items-center gap-2">
               <Calendar className="w-4 h-4" /> {movie.release_date?.split('-')[0] || 'N/A'}
             </span>
           </div>

           <div className="flex gap-4">
             {trailer && (
               <a 
                 href="#trailer"
                 className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2"
               >
                 <PlayCircle className="w-5 h-5" /> Watch Trailer
               </a>
             )}
             <WatchlistButton 
               movieId={movie.id}
               title={movie.title}
               poster_path={movie.poster_path}
               release_date={movie.release_date || ''}
               vote_average={movie.vote_average}
             />
           </div>
        </div>
      </div>

      {/* 2. DETAILS GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        <div className="md:col-span-2 space-y-12">
          <section>
            <h3 className="text-xl font-bold mb-4 text-white">The Plot</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              {movie.overview || "No plot summary available."}
            </p>
          </section>

          {/* CAST (Using Premium Scrollbar) */}
          <section>
            <h3 className="text-xl font-bold mb-6 text-white">Top Cast</h3>
            <div className="flex gap-4 premium-scrollbar pb-4">
              {(movie.credits?.cast || []).slice(0, 8).map((actor) => (
                <div key={actor.id} className="flex-shrink-0 w-32 space-y-2 group cursor-pointer">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors bg-gray-800">
                    {actor.profile_path ? (
                      <Image 
                        src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                        alt={actor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white truncate">{actor.name}</p>
                    <p className="text-xs text-gray-500 truncate">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {trailer && (
            <section id="trailer" className="pt-8">
               <h3 className="text-xl font-bold mb-6 text-white">Official Trailer</h3>
               <div className="relative aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                 <iframe 
                   src={`https://www.youtube.com/embed/${trailer.key}`}
                   title="YouTube video player"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                   className="absolute inset-0 w-full h-full"
                 />
               </div>
            </section>
          )}
        </div>

        {/* MORE LIKE THIS */}
        <div className="md:col-span-1">
          <h3 className="text-xl font-bold mb-6 text-white sticky top-24">More Like This</h3>
          <div className="space-y-4">
            {(movie.similar || []).slice(0, 5).map((m) => (
              <Link 
                href={`/movie/${m.id}`} 
                key={m.id}
                className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                  {m.poster_path ? (
                    <Image 
                      src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                      alt={m.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                     <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {m.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {m.release_date?.split('-')[0] || 'N/A'} • {m.vote_average?.toFixed(1)} ★
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}