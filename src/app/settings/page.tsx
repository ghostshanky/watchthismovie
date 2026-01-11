'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
// FIX: Import the strictly defined User type
import { User } from '@supabase/supabase-js';
import { Save, Loader2, Camera } from 'lucide-react';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // FIX: Typed correctly as User | null
  const [user, setUser] = useState<User | null>(null);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setFullName(session.user.user_metadata?.full_name || '');
        setUsername(session.user.user_metadata?.username || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Save to Supabase Auth Metadata
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, username: username }
    });

    setSaving(false);
    if (error) {
      alert("Failed to update profile");
    } else {
      alert("Profile updated successfully!");
      window.location.reload(); 
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-12">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-gray-400">Manage your profile and preferences.</p>
        </div>

        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold">
                   {/* Fallback to Initials */}
                   {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-white">Profile Photo</h3>
                <p className="text-xs text-gray-500">Synced with your email provider or auto-generated.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. moviebuff99"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email}
                  disabled
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-500">Email cannot be changed for security reasons.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>

          </form>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
          <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-400 mb-4">Deleting your account is permanent. All your ratings will be lost.</p>
          <button type="button" className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}