import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { searchMovies } from '@/app/actions';
import { Movie } from '@/app/types';
import { Star, Calendar } from 'lucide-react';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>;
}) {
    const params = await searchParams; // Next.js 15 requires awaiting params
    const query = params.q || '';

    // Reuse the search action
    const results = await searchMovies(query) as unknown as Movie[];

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold mb-8">
                    Results for <span className="text-blue-500">"{query}"</span>
                </h1>

                {results.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>No movies found. Try a different keyword.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map((movie) => (
                            <Link
                                key={movie.id}
                                href={`/movie/${movie.id}`}
                                className="group bg-gray-900 rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/50 hover:scale-105 transition-all duration-300"
                            >
                                {/* Poster Aspect Ratio Container */}
                                <div className="relative aspect-[2/3] bg-gray-800">
                                    {movie.poster_path && (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}

                                    {/* Rating Badge Overlay */}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        {movie.vote_average?.toFixed(1)}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">
                                        {movie.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {movie.release_date?.split('-')[0] || 'Unknown'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
