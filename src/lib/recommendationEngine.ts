import { SupabaseClient } from '@supabase/supabase-js';

// Define the shape of the data we get from Supabase
interface InteractionData {
  movie_id: number;
  rating: number;
  movies: {
    genres: number[]; // TMDB stores genres as numeric IDs
  } | null; // It might be null if the join fails
}

// 1. Get the user's "Vibe" (Top 3 Genres)
// FIX: We now pass the 'supabase' client AS AN ARGUMENT
export async function getUserTasteProfile(userId: string, supabase: SupabaseClient) {
  
  // Fetch all movies the user LIKED (rating > 60)
  const { data } = await supabase
    .from('user_interactions')
    .select(`
      movie_id,
      rating,
      movies ( genres )
    `)
    .eq('user_id', userId)
    .gt('rating', 60);

  // TypeScript Guard: If data is null, return null
  if (!data || data.length === 0) return null;

  // Cast the data to our interface so TypeScript is happy
  const interactions = data as unknown as InteractionData[];

  // Count the genres
  const genreCounts: Record<number, number> = {};
  
  interactions.forEach((inter) => {
    // Safety check: ensure 'movies' and 'genres' exist
    const genres = inter.movies?.genres || [];
    genres.forEach((gId: number) => {
      genreCounts[gId] = (genreCounts[gId] || 0) + 1;
    });
  });

  // Sort and get Top 3 Genre IDs
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a) // Sort by count (descending)
    .slice(0, 3)                    // Take top 3
    .map(([id]) => id)              // Keep only the IDs
    .join(',');                     // Join with commas "28,12,878"

  return topGenres;
}

// 2. Fetch Recommendations from TMDB based on that Vibe
export async function getAIRecommendations(genreString: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&with_genres=${genreString}&sort_by=vote_average.desc&vote_count.gte=500&include_adult=false&language=en-US&page=1`
  );
  const data = await res.json();
  return data.results; 
}