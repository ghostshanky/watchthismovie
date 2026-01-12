'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 1. SANITIZE KEYS (Fixes hidden spaces)
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY?.trim();
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// --- INTERFACES (Kept strictly typed) ---
interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface VideoResponse {
  results: Array<{
    key: string;
    type: string;
    site: string;
  }>;
}

interface SimilarResponse {
  results: TMDBMovie[];
}

interface CreditsResponse {
  cast: Array<{
    id: number;
    name: string;
    profile_path: string | null;
    character: string;
  }>;
}

const checkKey = () => {
  if (!TMDB_KEY) {
    throw new Error("❌ TMDB API Key is missing. Check your .env.local file.");
  }
};

// -----------------------------------------------------------------------------
// 1. DASHBOARD ACTIONS
// -----------------------------------------------------------------------------

export async function fetchTrendingMovies() {
  checkKey();
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_KEY}&language=en-US`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    if (!res.ok) throw new Error("Failed to fetch trending");
    const data = await res.json();
    return data.results as TMDBMovie[] || [];
  } catch (error) {
    console.error("Trending Error:", error);
    return [];
  }
}

export async function searchMovies(query: string) {
  checkKey();
  if (!query) return [];
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    const data = await res.json();
    return data.results as TMDBMovie[] || [];
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

// -----------------------------------------------------------------------------
// 2. RESULTS ACTION
// -----------------------------------------------------------------------------

export async function getRecommendations(userId: string) {
  checkKey();
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { }
        },
      },
    }
  );

  const { data: likedMovies } = await supabase
    .from('user_interactions')
    .select('movie_id')
    .eq('user_id', userId)
    .eq('liked', true)
    .limit(5);

  if (!likedMovies || likedMovies.length === 0) {
    const res = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1`);
    const data = await res.json();
    return data.results as TMDBMovie[] || [];
  }

  const seedMovieId = likedMovies[0].movie_id;

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/${seedMovieId}/recommendations?api_key=${TMDB_KEY}&language=en-US&page=1`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.results as TMDBMovie[] || [];
  } catch (error) {
    console.error("Recommendation Error:", error);
    return [];
  }
}

// -----------------------------------------------------------------------------
// 3. MOVIE DETAILS ACTION (Cached & Optimized)
// -----------------------------------------------------------------------------

export async function getMovieDetails(id: string) {
  checkKey();

  // Helper: Debugging Fetch with CACHING enabled
  const safeFetch = async <T>(endpoint: string): Promise<T | null> => {
    try {
      const url = new URL(`${TMDB_BASE_URL}/movie/${id}${endpoint}`);
      url.searchParams.append('api_key', TMDB_KEY!);
      url.searchParams.append('language', 'en-US');

      const res = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json'
        },
        // FIX: CHANGED FROM 'no-store' TO 'revalidate: 3600'
        // This prevents the "fetch failed" error by reusing data
        next: { revalidate: 3600 } 
      });

      if (!res.ok) {
        console.warn(`⚠️ API Error ${res.status} for: ${url.pathname}`);
        return null;
      }
      return await res.json() as T;

    } catch (error) {
      console.error(`❌ Network Crash for ID ${id}${endpoint}:`, error);
      return null;
    }
  };

  // Run fetches
  const [details, credits, videos, similar] = await Promise.all([
    safeFetch<TMDBMovie>(''),
    safeFetch<CreditsResponse>('/credits'),
    safeFetch<VideoResponse>('/videos'),
    safeFetch<SimilarResponse>('/recommendations')
  ]);

  return {
    ...(details || {}),
    credits: credits || { cast: [] },
    videos: videos?.results || [],
    similar: similar?.results || []
  };
}