'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Check, Star } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import RatingSlider from '@/components/RatingSlider';

interface Props {
    movie: any;
    userId: string;
    isSeen: boolean; // Passed from parent
}

export default function SmartMovieCard({ movie, userId, isSeen: initialSeen }: Props) {
    const [isSeen, setIsSeen] = useState(initialSeen);

    // --- RENDER ---
    return (
        <div className="relative group w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/10 touch-none select-none">

            {/* 1. SEEN BADGE (Top Right) */}
            {isSeen && (
                <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-green-500/30 text-green-500 shadow-lg animate-in fade-in zoom-in duration-300">
                    <Eye className="w-3 h-3" />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-2 h-2 border border-black flex items-center justify-center">
                        <Check className="w-1.5 h-1.5 text-black" />
                    </div>
                </div>
            )}

            {/* 2. MINI SLIDER (Only show if NOT seen) */}
            {!isSeen && (
                <div className="absolute bottom-2 left-0 w-full px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                    <RatingSlider
                        movie={{
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.poster_path
                        }}
                        userId={userId}
                        variant="mini" // Small Size
                        onRate={() => setIsSeen(true)} // Hide slider and show Eye icon instantly
                    />
                </div>
            )}

            {/* Add a background gradient at the bottom so the slider is visible */}
            {!isSeen && (
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20" />
            )}

            {/* 3. NORMAL CONTENT */}
            <Link href={`/movie/${movie.id}`} className="block w-full h-full">
                {movie.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                {/* Title */}
                <div className="absolute bottom-0 p-3 w-full transition-opacity duration-300 group-hover:opacity-0">
                    <h3 className="text-xs font-bold text-white truncate">{movie.title}</h3>
                    {movie.vote_average > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-yellow-500 mt-1">
                            <Star className="w-2 h-2 fill-yellow-500" /> {movie.vote_average.toFixed(1)}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}
