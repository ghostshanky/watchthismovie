'use client';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toggleWatchlist } from '@/app/actions';

export default function RemoveFromWatchlist({ movieId }: { movieId: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent clicking the link behind it
        if (!confirm('Remove from watchlist?')) return;

        setLoading(true);
        // We pass minimal data since we are just removing
        await toggleWatchlist({ id: movieId, title: '', poster_path: '', vote_average: 0 });
        router.refresh();
        setLoading(false);
    };

    return (
        <button
            onClick={handleRemove}
            disabled={loading}
            className="p-2 bg-black/60 backdrop-blur-md text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-lg"
            title="Remove from Watchlist"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    );
}
