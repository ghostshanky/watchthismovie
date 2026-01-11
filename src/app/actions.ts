'use server'

export async function fetchTrendingMovies() {
  const key = process.env.NEXT_PUBLIC_TMDB_KEY;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) throw new Error('Failed to fetch from TMDB');

    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
}
// ... existing fetchTrendingMovies code ...

export async function searchMovies(query: string) {
  const key = process.env.NEXT_PUBLIC_TMDB_KEY;
  if (!query) return [];

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      { cache: 'no-store' } // Search results shouldn't be cached deeply
    );

    if (!res.ok) throw new Error('Failed to search TMDB');

    const data = await res.json();
    return data.results.slice(0, 5); // Return top 5 matches
  } catch (error) {
    console.error(error);
    return [];
  }
}
// ... (keep fetchTrendingMovies and searchMovies) ...

import { createClient } from '@/lib/supabaseClient'; // Ensure you have this or pass supabase client

// We need a Server-Side Supabase Client for this one to read the DB secureley
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getRecommendations(userId: string) {
  const cookieStore = await cookies()
  const key = process.env.NEXT_PUBLIC_TMDB_KEY;

  // 1. Create a secret server connection to Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      }
    }
  )

  // 2. Get the movies the user LIKED (rating > 70 or liked = true)
  const { data: likedMovies } = await supabase
    .from('user_interactions')
    .select('movie_id')
    .eq('user_id', userId)
    .eq('liked', true)
    .limit(3); // Grab the last 3 liked movies

  if (!likedMovies || likedMovies.length === 0) return [];

  // 3. Ask TMDB for recommendations based on these movies
  // We'll pick the first "liked" movie to base recommendations on for now
  const seedMovieId = likedMovies[0].movie_id;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${seedMovieId}/recommendations?api_key=${key}&language=en-US&page=1`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Recommendation Error:", error);
    return [];
  }
}