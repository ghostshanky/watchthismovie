'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCountryCode } from '@/lib/getCountry';

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
  original_language: string;
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

interface WatchProvidersResponse {
  results: Record<string, {
    flatrate?: Array<{
      provider_id: number;
      provider_name: string;
      logo_path: string;
    }>;
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
// 1.1 DYNAMIC DISCOVERY ACTIONS
// -----------------------------------------------------------------------------

// 1. FETCH INITIAL BATCH (Exclude what we've seen)
export async function fetchInitialBatch(userId: string) {
  checkKey();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Get IDs we have already seen
  const { data: seen } = await supabase
    .from('user_interactions')
    .select('movie_id')
    .eq('user_id', userId);

  const seenIds = new Set(seen?.map(x => x.movie_id) || []);

  // Fetch Trending
  const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  const data = await res.json();
  const movies = data.results as TMDBMovie[] || [];

  // Return only ones we haven't seen
  return movies.filter(m => !seenIds.has(m.id)).slice(0, 5); // Start with 5
}

// 2. THE "BRAIN": Save Rating & Get Next Suggestions
export async function submitRatingAndGetNext(
  userId: string,
  movie: { id: number, title: string, poster_path: string },
  liked: boolean
) {
  checkKey();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // A. SAVE TO HISTORY
  const { error } = await supabase.from('user_interactions').insert({
    user_id: userId,
    movie_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path, // Now required by new schema
    liked: liked,
    has_watched: true // <--- FIX: Ensure it shows in History
  });

  if (error) console.error("Save Error:", error);

  // B. DECIDE NEXT MOVIES
  let nextMovies: TMDBMovie[] = [];

  try {
    if (liked) {
      // If LIKED: Get related movies (Drill down)
      const res = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/recommendations?api_key=${TMDB_KEY}&language=en-US&page=1`);
      const data = await res.json();
      nextMovies = data.results || [];
    } else {
      // If DISLIKED: Get something totally different (Explore)
      // We fetch a random page of top rated
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const res = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=${randomPage}`);
      const data = await res.json();
      nextMovies = data.results || [];
    }
  } catch (err) {
    console.error("Next Movie Fetch Error:", err);
    return [];
  }

  // C. FILTER is handled by client or next batch fetch usually, 
  // but returning raw here for speed. Client duplicates check recommended.
  return nextMovies.slice(0, 3); // Return top 3 suggestions
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
// 3. PERSONALIZED FEED ACTION
// -----------------------------------------------------------------------------

export async function fetchPersonalizedFeed(userId: string) {
  checkKey();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Get User Preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('taste_dna')
    .eq('id', userId)
    .single();

  const languages = profile?.taste_dna?.languages || []; // e.g. ['en', 'hi']

  // LOGIC FIX:
  // If we have languages, use them.
  // BUT: Sort by 'vote_count.desc' (Most Rated) so we get FAMOUS movies first.
  // This solves the "I don't know these movies" problem.

  const langParam = languages.length > 0 ? `&with_original_language=${languages.join('|')}` : '';

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=vote_count.desc&vote_count.gte=3000${langParam}&page=1`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.results as TMDBMovie[] || [];
  } catch (error) {
    console.error("Personalized Feed Error:", error);
    // Fallback to strict top rated popular if discover fails
    return fetchTrendingMovies();
  }
}

// -----------------------------------------------------------------------------
// 4. MOVIE DETAILS ACTION (Cached & Optimized)
// -----------------------------------------------------------------------------

export async function getMovieDetails(id: string) {
  checkKey();

  // 1. DYNAMICALLY GET USER COUNTRY
  const countryCode = await getCountryCode();

  // 2. VALIDATE ID (Prevent favicon.ico or other non-numeric IDs from hitting API)
  if (!id || !/^\d+$/.test(id)) {
    console.warn(`⚠️ Invalid Movie ID: ${id}`);
    // Return empty structure to prevent crashes
    return {
      id: 0,
      title: '',
      overview: '',
      backdrop_path: null,
      poster_path: null,
      runtime: 0,
      release_date: '',
      vote_average: 0,
      genres: [],
      credits: { cast: [] },
      videos: [],
      similar: [],
      providers: []
    } as unknown as any; // Cast to satisfy return type
  }

  // Helper: Debugging Fetch with CACHING enabled + STRONGER RETRIES
  const safeFetch = async <T>(endpoint: string, retries = 5): Promise<T | null> => {
    const url = new URL(`${TMDB_BASE_URL}/movie/${id}${endpoint}`);
    url.searchParams.append('api_key', TMDB_KEY!);
    url.searchParams.append('language', 'en-US');

    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 3600 }
        });

        if (!res.ok) {
          if (res.status === 404) return null;
          console.warn(`⚠️ API Error ${res.status} for: ${url.pathname} (Attempt ${i + 1})`);
          if (res.status >= 500) throw new Error(`Server Error ${res.status}`);
          return null;
        }
        return await res.json() as T;

      } catch (error) {
        const isLastAttempt = i === retries - 1;
        if (isLastAttempt) {
          console.error(`❌ Final Network Crash for ID ${id}${endpoint}:`, error);
          return null;
        }
        // Stronger Backoff: 800ms, 1600ms...
        await new Promise(resolve => setTimeout(resolve, 800 * (i + 1)));
      }
    }
    return null;
  };

  // Run fetches
  const [details, credits, videos, similar, providers] = await Promise.all([
    safeFetch<TMDBMovie>(''),
    safeFetch<CreditsResponse>('/credits'),
    safeFetch<VideoResponse>('/videos'),
    safeFetch<SimilarResponse>('/recommendations'),
    safeFetch<WatchProvidersResponse>('/watch/providers')
  ]);

  // 2. DYNAMICALLY SELECT THE PROVIDER DATA
  // Instead of hardcoding 'US' or 'IN', we use the variable
  const localProviders = providers?.results?.[countryCode as keyof typeof providers.results]?.flatrate || [];

  return {
    ...(details || {}),
    credits: credits || { cast: [] },
    videos: videos?.results || [],
    similar: similar?.results || [],
    providers: localProviders // Now this is accurate for ANY user in the world
  };
}

// -----------------------------------------------------------------------------
// 5. COMPLEX DASHBOARD ROWS (AI FOR YOU)
// -----------------------------------------------------------------------------

export interface RecommendationRow {
  title: string;
  movies: TMDBMovie[];
}

export async function fetchDashboardRows(userId: string) {
  checkKey();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Fetch Profile & Likes
  const [profileRes, likesRes] = await Promise.all([
    supabase.from('profiles').select('taste_dna').eq('id', userId).single(),
    supabase.from('user_interactions').select('movie_id, title').eq('user_id', userId).eq('liked', true).order('created_at', { ascending: false }).limit(3)
  ]);

  const dna = profileRes.data?.taste_dna || {};
  const likedMovies = likesRes.data || [];
  const rows: RecommendationRow[] = [];

  // Helper for safe fetching
  const safeGet = async (url: string) => {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results as TMDBMovie[] || [];
    } catch (e) {
      console.error(`Row Fetch Error (${url}):`, e);
      return [];
    }
  };

  // 2. ROW 1: "Based on your recent like"
  if (likedMovies.length > 0) {
    const seed = likedMovies[0];
    const movies = await safeGet(`${TMDB_BASE_URL}/movie/${seed.movie_id}/recommendations?api_key=${TMDB_KEY}&language=en-US`);
    if (movies.length > 0) {
      rows.push({ title: `Because you liked ${seed.title}`, movies: movies.slice(0, 10) });
    }
  }

  // 3. ROW 2: "Critically Acclaimed (Region Specific)"
  if (dna.languages && dna.languages.length > 0) {
    const langString = dna.languages.join('|');
    const movies = await safeGet(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=300&with_original_language=${langString}&page=1`
    );
    if (movies.length > 0) {
      rows.push({ title: "Critically Acclaimed in Your Regions", movies: movies.slice(0, 10) });
    }
  }

  // 4. ROW 3: "Hidden Gems"
  const langParam = dna.languages && dna.languages.length > 0 ? `&with_original_language=${dna.languages.join('|')}` : '';
  const gems = await safeGet(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=100&vote_count.lte=1000${langParam}&page=1`
  );
  if (gems.length > 0) {
    rows.push({ title: "Hidden Gems you might miss", movies: gems.slice(0, 10) });
  }

  return rows;
}


// -----------------------------------------------------------------------------
// 6. WATCHLIST ACTIONS
// -----------------------------------------------------------------------------

export async function getWatchlistStatus(movieId: number) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('watchlist')
    .select('movie_id')
    .eq('user_id', user.id)
    .eq('movie_id', movieId)
    .maybeSingle();

  return !!data; // Returns true if exists, false if not
}

export async function toggleWatchlist(movie: { id: number, title: string, poster_path: string | null, vote_average: number, release_date?: string | null }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not logged in' };

  console.log("👉 Attempting to toggle movie:", movie.title);

  const exists = await getWatchlistStatus(movie.id);

  if (exists) {
    // REMOVE
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movie.id);

    if (error) console.error("❌ Delete Error:", error);
    else console.log("✅ Removed from watchlist");

    return { added: false };
  } else {
    // ADD
    const { error } = await supabase.from('watchlist').insert({
      user_id: user.id,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path, // Allows null
      vote_average: movie.vote_average,
      release_date: movie.release_date || null
    });

    if (error) console.error("❌ Insert Error:", error);
    else console.log("✅ Added to watchlist");

    return { added: true };
  }
}
