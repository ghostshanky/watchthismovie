'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Check, Search, X, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { searchMovies } from '@/app/actions';
import { Movie } from '@/app/types';

// 1. INDUSTRY OPTIONS (The "Filter" Layer)
const INDUSTRIES = [
  { id: 'en', label: 'Hollywood', sub: 'English', emoji: '🎬' },
  { id: 'hi', label: 'Bollywood', sub: 'Hindi', emoji: '💃' },
  { id: 'te', label: 'Tollywood', sub: 'Telugu', emoji: '🔥' },
  { id: 'ta', label: 'Kollywood', sub: 'Tamil', emoji: '🕶️' },
  { id: 'ja', label: 'Anime', sub: 'Japanese', emoji: '👺' },
  { id: 'ko', label: 'K-Drama', sub: 'Korean', emoji: '🫰' },
  { id: 'es', label: 'European', sub: 'Spanish/French', emoji: '🌍' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [seedMovies, setSeedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // --- LOGIC: TOGGLE LANGUAGE ---
  const toggleLang = (id: string) => {
    if (selectedLangs.includes(id)) {
      setSelectedLangs(selectedLangs.filter(l => l !== id));
    } else {
      setSelectedLangs([...selectedLangs, id]);
    }
  };

  // --- LOGIC: SEARCH MOVIES ---
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await searchMovies(query) as unknown as Movie[];
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  // --- LOGIC: ADD SEED MOVIE ---
  const addSeedMovie = (movie: Movie) => {
    if (seedMovies.length >= 3) return; // Max 3
    if (seedMovies.find(m => m.id === movie.id)) return; // No duplicates
    setSeedMovies([...seedMovies, movie]);
    setSearchQuery('');
    setSearchResults([]);
  };

  // --- LOGIC: SAVE & FINISH ---
  const finishOnboarding = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 1. Save preferences to Profile
      await supabase.from('profiles').update({
        taste_dna: {
          languages: selectedLangs,
          favorites: seedMovies.map(m => m.id)
        }
      }).eq('id', user.id);

      // 2. Also add the 3 movies to "Liked" history so the Algorithm works immediately
      const interactions = seedMovies.map(m => ({
        user_id: user.id,
        movie_id: m.id,
        liked: true,
        title: m.title,
        poster_path: m.poster_path
      }));
      
      await supabase.from('user_interactions').insert(interactions);
    }

    router.push('/dashboard'); // Go to Dashboard
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        
        {/* PROGRESS BAR */}
        <div className="flex gap-2 mb-12 justify-center">
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 1 ? 'bg-blue-500' : 'bg-blue-500/30'}`} />
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 2 ? 'bg-blue-500' : 'bg-gray-800'}`} />
        </div>

        {/* --- STEP 1: LANGUAGES --- */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">What do you watch?</h1>
            <p className="text-gray-400 text-center mb-10 text-lg">
              Select the industries you follow. We won&apos;t recommend movies outside these languages.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => toggleLang(ind.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedLangs.includes(ind.id)
                      ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">{ind.emoji}</div>
                  <div className="font-bold">{ind.label}</div>
                  <div className={`text-xs ${selectedLangs.includes(ind.id) ? 'text-blue-200' : 'text-gray-500'}`}>
                    {ind.sub}
                  </div>
                  {selectedLangs.includes(ind.id) && (
                    <div className="absolute top-4 right-4 bg-white text-blue-600 rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(2)}
                disabled={selectedLangs.length === 0}
                className="px-10 py-4 bg-white text-black font-bold rounded-full text-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-2"
              >
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: ANCHOR MOVIES --- */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">The &quot;Anchor&quot; Test</h1>
            <p className="text-gray-400 text-center mb-10 text-lg">
              Name <span className="text-white font-bold">3 movies</span> you absolutely loved. <br/>
              We will use these to clone your taste.
            </p>

            {/* SEED LIST */}
            <div className="flex justify-center gap-4 mb-8 min-h-[120px]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative w-24 h-36 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
                  {seedMovies[i] ? (
                    <>
                      <Image 
                        src={`https://image.tmdb.org/t/p/w200${seedMovies[i].poster_path}`}
                        alt={seedMovies[i].title}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button 
                        onClick={() => setSeedMovies(seedMovies.filter(m => m.id !== seedMovies[i].id))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span className="text-2xl text-gray-700 font-bold">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {/* SEARCH BAR */}
            {seedMovies.length < 3 && (
              <div className="max-w-md mx-auto relative mb-8">
                <div className="relative">
                   <Search className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                   <input
                     type="text"
                     placeholder="Search for a favorite (e.g. Inception)"
                     className="w-full bg-gray-900 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                     value={searchQuery}
                     onChange={(e) => handleSearch(e.target.value)}
                     autoFocus
                   />
                </div>

                {/* DROPDOWN */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-gray-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                    {searchResults.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => addSeedMovie(movie)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-white/10 border-b border-white/5 text-left transition-colors"
                      >
                        <div className="relative w-10 h-14 bg-gray-700 flex-shrink-0 rounded overflow-hidden">
                           {movie.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{movie.title}</p>
                          <p className="text-xs text-gray-400">{movie.release_date?.split('-')[0]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FINISH BUTTON */}
            <div className="flex justify-center">
              <button
                onClick={finishOnboarding}
                disabled={seedMovies.length < 3 || loading}
                className="px-10 py-4 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-500 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Generate My Feed</>}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}