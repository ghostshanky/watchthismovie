import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import SmartMovieCard from '@/components/SmartMovieCard';
import { searchMovies } from '@/app/actions';
import { Movie } from '@/app/types';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>;
}) {
    const params = await searchParams; // Next.js 15 requires awaiting params
    const query = params.q || '';

    // 1. Get User and Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() } } }
    );
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Reuse the search action
    const results = await searchMovies(query);

    // 3. Fetch "Seen" Status for these movies
    let seenIds = new Set();
    if (user) {
        const { data: seen } = await supabase
            .from('user_interactions')
            .select('movie_id')
            .eq('user_id', user.id)
            .eq('has_watched', true); // Only count actual watches

        seenIds = new Set(seen?.map(x => x.movie_id));
    }

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
                            <SmartMovieCard
                                key={movie.id}
                                movie={movie}
                                userId={user?.id || ''}
                                isSeen={seenIds.has(movie.id)} // <--- THIS TURNS ON THE ICON
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
