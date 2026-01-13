'use client';
import { useState, useEffect } from 'react';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { getWatchlistStatus, toggleWatchlist } from '@/app/actions';
import { Movie } from '@/app/types';

export default function WatchlistButton({ movie }: { movie: Movie }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check initial status on mount
  useEffect(() => {
    getWatchlistStatus(movie.id).then((status) => {
      setIsSaved(status);
      setLoading(false);
    });
  }, [movie.id]);

  const handleToggle = async () => {
    setLoading(true);
    // Optimistic UI
    const newState = !isSaved;
    setIsSaved(newState);

    // Server Request
    await toggleWatchlist(movie);
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${isSaved
          ? 'bg-green-500 text-black hover:bg-green-400'
          : 'bg-white/10 text-white hover:bg-white/20'
        }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSaved ? (
        <>
          <Check className="w-5 h-5" /> Saved
        </>
      ) : (
        <>
          <Bookmark className="w-5 h-5" /> Watchlist
        </>
      )}
    </button>
  );
}