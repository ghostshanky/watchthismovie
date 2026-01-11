'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Menu, X, LogOut, Film, Settings, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect, useRef } from 'react';
import { searchMovies } from '@/app/actions';
import Image from 'next/image';
import { Movie } from '@/app/types';
// FIX: Import the strictly defined User type from Supabase
import { User } from '@supabase/supabase-js';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  // FIX: Explicitly type the user state
  const [user, setUser] = useState<User | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false); // <--- NEW STATE

  const profileRef = useRef<HTMLDivElement>(null);

  // Check Session on Mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        // We cast this safely because we know the shape matches our Movie interface
        const results = await searchMovies(searchQuery) as unknown as Movie[];
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    setShowSignOutModal(false);
  };

  // Hiding logic: Don't show on /login page
  if (pathname === '/login') return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/10'
            : 'bg-gradient-to-b from-black/80 to-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
  
            {/* LOGO */}
<Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
  {/* Custom SVG Logo */}
  <div className="w-10 h-10 relative">
     <Image 
       src="/wtm.svg" 
       alt="WatchThisMovie" 
       fill
       className="object-contain rounded"
       priority
     />
  </div>
  <span className="hidden md:block font-bold text-white tracking-tight">WatchThisMovie</span>
</Link>
  
            {/* IF LOGGED IN: SHOW SEARCH & MENU */}
          {user ? (
            <>
              {/* SEARCH BAR */}
              <div className="flex-1 max-w-xl relative hidden md:block group">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    placeholder="Search titles..."
                    className="w-full bg-black/50 border border-white/10 text-sm text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:bg-black focus:border-white/30 transition-all placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                    {searchResults.map((movie) => (
                      <Link
                        key={movie.id}
                        href={`/movie/${movie.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-0"
                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      >
                        {movie.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} width={30} height={45} className="rounded" />}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{movie.title}</span>
                          <span className="text-xs text-gray-500">{movie.release_date?.split('-')[0]}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex items-center gap-4 md:gap-6">
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                  <Link href="/dashboard" className="text-gray-300 hover:text-white">Home</Link>
                  <Link href="/results" className="text-gray-300 hover:text-white">My List</Link>
                </nav>

                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-white transition-colors">
                    {/* AVATAR LOGIC */}
                    {user.user_metadata?.avatar_url ? (
                      <Image src={user.user_metadata.avatar_url} alt="User" width={32} height={32} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-black border border-white/10 rounded-lg shadow-xl py-1">
                      <div className="px-4 py-3 border-b border-white/10 mb-1">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      </div>
                      <Link href="/results" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white">
                        <Film className="w-4 h-4" /> My Ratings
                      </Link>
                      <Link
                        href="/settings"
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={() => setProfileOpen(false)} // Close menu on click
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => { setProfileOpen(false); setShowSignOutModal(true); }} // <--- CHANGE THIS
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* IF NOT LOGGED IN: SHOW LOGIN BUTTON */
            <div className="flex items-center gap-4">
              <Link href="/login" className="px-6 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-200 transition-colors">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSignOutModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sign Out?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  You will need to verify your email to log back in.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}