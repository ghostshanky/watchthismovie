'use client';
import { useState, useEffect } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function WatchlistButton({ 
  movieId, 
  title, 
  poster_path, 
  release_date, 
  vote_average
}: { movieId: number, title: string, poster_path: string | null, release_date: string, vote_average: number }) {
  
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // We check if this movie ID exists in the user's list
        const { data } = await supabase
          .from('watchlist')
          .select('movie_id')
          .eq('user_id', user.id)
          .eq('movie_id', movieId)
          .maybeSingle(); // "maybeSingle" avoids error if not found
        
        if (data) setIsSaved(true);
      }
      setLoading(false);
    };
    checkStatus();
  }, [movieId, supabase]);

  const toggleWatchlist = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .match({ user_id: user.id, movie_id: movieId });
      
      if (!error) setIsSaved(false);
    } else {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          movie_id: movieId,
          title,
          poster_path,
          release_date,
          vote_average
        });
        
      if (!error) setIsSaved(true);
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <button 
      onClick={toggleWatchlist}
      disabled={loading}
      className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 border ${
        isSaved 
          ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' 
          : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
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
          <Plus className="w-5 h-5" /> Add to Watchlist
        </>
      )}
    </button>
  );
}