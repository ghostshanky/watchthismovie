'use client';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 border border-red-500/30 text-red-400 font-bold text-sm rounded-full hover:bg-red-500/10 flex items-center gap-2 transition-colors"
    >
      <LogOut className="w-4 h-4" /> Sign Out
    </button>
  );
}