import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Settings, Globe, RefreshCw, Database, ChevronRight, LogOut, MapPin } from 'lucide-react';
import { getCountryCode } from '@/lib/getCountry'; // We use the helper we made earlier

// Client Component for the "Reset" button logic
import ResetOnboardingButton from '@/components/ResetOnboardingButton';
import SignOutButton from '@/components/SignOutButton';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-20 text-white">Please log in.</div>;

  // 1. Fetch Profile Data (Taste DNA)
  const { data: profile } = await supabase
    .from('profiles')
    .select('taste_dna')
    .eq('id', user.id)
    .single();

  // 2. Get Detected Region
  const country = await getCountryCode();
  const countryNames: Record<string, string> = { 'IN': 'India', 'US': 'United States', 'GB': 'United Kingdom' };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        {/* SECTION 1: ACCOUNT */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" /> Account
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full">
                Verified
              </span>
            </div>
            
            <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-400">Streaming Region</p>
                 <div className="flex items-center gap-2 mt-1">
                   <MapPin className="w-4 h-4 text-gray-500" />
                   <p className="font-medium">{countryNames[country] || country} (Detected)</p>
                 </div>
               </div>
               {/* In V2, we can make this editable */}
               <span className="text-xs text-gray-600">Auto-detected</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: TASTE DNA (The Important Part) */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" /> Taste Preferences
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Selected Industries</p>
              <div className="flex flex-wrap gap-2">
                {profile?.taste_dna?.languages && profile.taste_dna.languages.length > 0 ? ( // Fix: Added null check for profile.taste_dna
                  profile.taste_dna.languages.map((lang: string) => (
                    <span key={lang} className="px-3 py-1 bg-white/10 border border-white/10 rounded text-sm uppercase">
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No preferences set</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div>
                <p className="font-bold">Retake Onboarding</p>
                <p className="text-sm text-gray-400">Reset your industries and seed movies.</p>
              </div>
              <ResetOnboardingButton />
            </div>
          </div>
        </div>

        {/* SECTION 3: DANGER ZONE */}
        <div className="border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="p-6 flex justify-between items-center">
             <div className="text-red-400">
               <p className="font-bold">Sign Out</p>
               <p className="text-sm opacity-70">End your current session.</p>
             </div>
             <SignOutButton />
          </div>
        </div>

      </div>
    </div>
  );
}