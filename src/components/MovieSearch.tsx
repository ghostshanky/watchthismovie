'use client';
import { useState, useEffect } from 'react';
import { Search, X, Star } from 'lucide-react'; 
import { searchMovies } from '@/app/actions';
import Image from 'next/image';
import { Movie } from '@/app/types'; // <--- Correct Import

interface SearchProps {
  onSelect: (movie: Movie) => void;
}

export default function MovieSearch({ onSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]); // <--- Typed as Movie[]
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        // We cast the result to Movie[] to satisfy TypeScript
        const movies = await searchMovies(query) as unknown as Movie[]; 
        setResults(movies);
        setLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md z-50">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a movie you've seen..."
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all shadow-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
        {loading && (
           <div className="absolute right-12 top-3.5 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
        {query && !loading && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-3.5 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {results.map((movie) => (
            <button
              key={movie.id}
              onClick={() => {
                onSelect(movie);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
            >
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  width={40}
                  height={60}
                  className="rounded object-cover"
                />
              ) : (
                <div className="w-[40px] h-[60px] bg-gray-800 rounded flex items-center justify-center text-gray-500 text-xs">?</div>
              )}
              
              <div>
                <h4 className="font-bold text-sm text-white truncate max-w-[200px]">{movie.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                  {movie.vote_average > 0 && (
                    <span className="flex items-center text-yellow-500">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}