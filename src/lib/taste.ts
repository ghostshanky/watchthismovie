import { SupabaseClient } from '@supabase/supabase-js';

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Mock Genre Map (for speed, avoids fetching genre list every time)
// In a real app, you'd fetch /genre/movie/list
const GENRE_MAP: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

export async function getUserTasteProfile(userId: string, supabase: SupabaseClient) {
    if (!TMDB_KEY) return null;

    // 1. Fetch Interactions (Liked & Recent)
    const { data: interactions } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); // Newest first

    if (!interactions || interactions.length === 0) return null;

    const totalWatched = interactions.filter(i => i.has_watched).length;

    // 2. Recent Activity (Last 5 Rated/Watched)
    // We need poster paths. If not in DB, we must fetch or rely on what we have.
    // Assuming we might not have poster in DB, let's fetch details for top 5.
    const recentIds = interactions.slice(0, 5).map(i => i.movie_id);
    const recentMovies = await Promise.all(
        recentIds.map(async (id) => {
            try {
                const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_KEY}`);
                const data = await res.json();
                return { id: data.id, title: data.title, poster_path: data.poster_path };
            } catch { return null; }
        })
    );

    // 3. Taste DNA (Top Genres from last 20 Liked movies)
    const likedIds = interactions.filter(i => i.liked).slice(0, 20).map(i => i.movie_id);
    const genreCounts: Record<string, number> = {};

    // Analyze simplified "DNA"
    // Fetching 20 movies might be slow. Optimization:
    // For now, let's fetch details for these 20 to get genres.
    // In prod, you'd cache this or store genres in DB.
    await Promise.all(likedIds.map(async (id) => {
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_KEY}`);
            const data = await res.json();
            data.genres?.forEach((g: any) => {
                genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
            });
        } catch { }
    }));

    const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name);

    return {
        level: getLevel(totalWatched),
        totalWatched,
        topGenres, // ["Sci-Fi", "Thriller"]
        recentMovies: recentMovies.filter(m => m !== null), // [{id, poster...}]
    };
}

function getLevel(count: number) {
    if (count > 500) return "God Tier";
    if (count > 100) return "Certified Critic";
    if (count > 50) return "Cinema Addict";
    if (count > 10) return "Film Enthusiast";
    return "Novice Watcher";
}
