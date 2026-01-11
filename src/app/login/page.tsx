'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Film, Loader2, ArrowRight, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md">

        {/* Header Logo */}
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 relative mb-4">
            <Image
              src="/wtm.svg"
              alt="Logo"
              fill
              className="rounded drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white">WatchThisMovie</h1>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
              <p className="text-gray-400 mb-6">
                We sent a secure login link to <br /> <span className="text-white font-medium">{email}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-gray-500 hover:text-white underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-white">Sign In</h2>
                <p className="text-sm text-gray-400">Enter your email to receive a magic link.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue with Email <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  );
}