'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = getSupabase();

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link, or sign in if email confirmation is disabled.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-950/80 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="text-3xl font-normal tracking-wide text-white hover:text-sky-400 transition-colors inline-block"
            style={{ fontFamily: "'Tilt Warp', cursive" }}
          >
            VOLTARIX
          </Link>
          <p className="text-xs text-neutral-400">
            {isSignUp ? 'Create your Voltarix account' : 'Sign in to access your library & history'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs p-3 rounded-xl">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-black font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-sky-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-900">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-sky-400 hover:underline font-semibold ml-1 cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </main>
  );
}