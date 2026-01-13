'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Film, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { searchMovies } from '@/app/actions';
import { Movie } from '@/app/types';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // 1. Debounce Logic (Wait for user to stop typing)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                setIsOpen(true);
                try {
                    const data = await searchMovies(query);
                    setResults(data as unknown as Movie[]);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // 2. Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // 3. Handle "Enter" key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query) {
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">

            {/* INPUT FIELD */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-white/10 rounded-full text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-black transition-all"
                    placeholder="Search movies (e.g. Batman)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length > 2 && setIsOpen(true)}
                />
                {/* Loading Indicator or Clear Button */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {loading ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : query ? (
                        <button onClick={() => { setQuery(''); setIsOpen(false); }} className="text-gray-500 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* DROPDOWN RESULTS */}
            {isOpen && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[60vh] overflow-y-auto premium-scrollbar">
                        {results.map((movie) => (
                            <Link
                                key={movie.id}
                                href={`/movie/${movie.id}`}
                                onClick={() => setIsOpen(false)} // Close on click
                                className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                            >
                                {/* Poster */}
                                <div className="relative w-10 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                    {movie.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600"><Film className="w-4 h-4" /></div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 truncate transition-colors">
                                        {movie.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">{movie.release_date?.split('-')[0] || 'N/A'}</span>
                                        {movie.vote_average > 0 && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 rounded">
                                                <Star className="w-2.5 h-2.5 fill-yellow-500" /> {movie.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* "See all results" Footer */}
                    <Link
                        href={`/search?q=${encodeURIComponent(query)}`}
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-xs font-bold text-blue-400 bg-black/20 hover:bg-black/40 border-t border-white/5"
                    >
                        See all results for "{query}"
                    </Link>
                </div>
            )}
        </div>
    );
}
