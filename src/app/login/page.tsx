'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Film, Loader2, ArrowRight, Mail, CheckCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  // 1. Handle Google Login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      alert(error.message);
      setIsGoogleLoading(false);
    }
  };

  // 2. Handle Magic Link Login
  const handleMagicLink = async (e: React.FormEvent) => {
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

  // 3. Smart "Open Inbox" Logic
  const handleOpenInbox = () => {
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain?.includes('gmail')) {
      window.open('https://mail.google.com/mail/u/0/#inbox', '_blank');
    } else if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live')) {
      window.open('https://outlook.live.com/mail/0/inbox', '_blank');
    } else if (domain?.includes('yahoo')) {
      window.open('https://mail.yahoo.com', '_blank');
    } else {
      // Default fallback (most likely Gmail anyway)
      window.open('https://mail.google.com', '_blank');
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
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 relative mb-4">
             <Image 
               src="/wtm.svg" 
               alt="Logo" 
               fill
               className="object-contain drop-shadow-2xl"
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
                We sent a secure login link to <br/> <span className="text-white font-medium">{email}</span>
              </p>
              
              {/* NEW: Open Inbox Button */}
              <button
                onClick={handleOpenInbox}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-4 transition-colors"
                suppressHydrationWarning={true}
              >
                Open Inbox <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSent(false)}
                className="text-sm text-gray-500 hover:text-white underline"
                suppressHydrationWarning={true}
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-white">Sign In</h2>
                <p className="text-sm text-gray-400">Welcome back to your personal curator.</p>
              </div>

              <div className="space-y-4">
                {/* 1. GOOGLE LOGIN BUTTON */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                  suppressHydrationWarning={true}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {/* Google G Logo SVG */}
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="relative flex items-center">
                   <div className="flex-grow border-t border-white/10"></div>
                   <span className="flex-shrink-0 mx-4 text-xs text-gray-500">OR</span>
                   <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* 2. EMAIL FORM */}
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      suppressHydrationWarning={true}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white/5 text-white font-bold py-3.5 rounded-xl hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
                    suppressHydrationWarning={true}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send Magic Link <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          By clicking continue, you agree to our Terms of Service.
        </p>

      </div>
    </div>
  );
}