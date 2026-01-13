import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, Calendar, Film } from 'lucide-react';
import DeleteRatingButton from '@/components/DeleteRatingButton';

export default async function RatingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-20 text-white">Please log in.</div>;

  // FETCH WITH STRICT FILTERS
  const { data: ratings } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('has_watched', true)  // <--- NEW: Only show what I actually watched
    .not('title', 'is', null) // Safety: No blank titles
    .neq('title', '')         // Safety: No empty strings
    .order('created_at', { ascending: false });

  // console.log("DEBUG RATINGS:", ratings);

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your History</h1>
            <p className="text-gray-400">
              You have rated <span className="text-white font-bold">{ratings?.length || 0}</span> movies.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-gray-900 border border-white/10 px-6 py-3 rounded-2xl">
              <span className="block text-xs text-gray-500 uppercase tracking-widest">Liked</span>
              <span className="text-2xl font-bold text-green-400">
                {ratings?.filter(r => r.liked).length}
              </span>
            </div>
            <div className="bg-gray-900 border border-white/10 px-6 py-3 rounded-2xl">
              <span className="block text-xs text-gray-500 uppercase tracking-widest">Disliked</span>
              <span className="text-2xl font-bold text-red-400">
                {ratings?.filter(r => !r.liked).length}
              </span>
            </div>
          </div>
        </div>

        {ratings?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-500 mb-4">No history found.</p>
            <Link href="/dashboard" className="text-blue-500 hover:underline">Start rating movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ratings?.map((rating) => (
              <div
                key={rating.id}
                className="group flex items-center gap-4 bg-gray-900/40 border border-white/5 p-4 rounded-xl hover:bg-gray-900 hover:border-blue-500/30 transition-all"
              >
                {/* POSTER */}
                <Link href={`/movie/${rating.movie_id}`} className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                  {rating.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${rating.poster_path}`}
                      alt={rating.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                </Link>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <Link href={`/movie/${rating.movie_id}`} className="font-bold text-lg text-white hover:text-blue-400 truncate block">
                    {rating.title}
                  </Link>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(rating.created_at).toLocaleDateString()}
                    </div>

                    {rating.liked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        <ThumbsUp className="w-3 h-3" /> Liked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <ThumbsDown className="w-3 h-3" /> Disliked
                      </span>
                    )}
                  </div>
                </div>

                {/* DELETE BUTTON */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteRatingButton id={rating.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}