'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, Sparkles, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function checkExistingSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          const verifyRes = await fetch(`/api/admin/verify-role?email=${encodeURIComponent(user.email || '')}`);
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.admin) {
              window.location.href = '/admin';
              return;
            }
          }
        } catch {
          // Ignore
        }

        const dest = redirectTo && redirectTo !== '/login' ? redirectTo : '/account';
        window.location.href = dest;
      }
    }

    checkExistingSession();
  }, [router, redirectTo, supabase]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      // Check if logged in user is an Administrator
      let targetDestination = redirectTo && redirectTo !== '/login' ? redirectTo : '/account';
      try {
        const verifyRes = await fetch(`/api/admin/verify-role?email=${encodeURIComponent(email.trim())}`);

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.admin) {
            // Admin role detected! Automatically redirect to /admin dashboard
            targetDestination = '/admin';
          }
        }
      } catch (e) {
        console.warn('Role verification check:', e);
      }

      setSuccessMsg('Authenticated successfully. Redirecting...');
      setTimeout(() => {
        window.location.href = targetDestination;
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to Google OAuth.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border border-hairline bg-bg-primary p-8 sm:p-10 shadow-2xl rounded-xl space-y-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-accent-brass/10 blur-[50px] pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative">
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Patron Concierge
          </span>
          <h1 className="font-serif text-3xl font-light tracking-tight text-text-ondark">
            {content.auth.signInTitle}
          </h1>
          <p className="text-xs text-text-ondark/60 font-light">
            Sign in to access your orders, curated preferences, and bespoke concierge.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="border border-red-500/40 bg-red-950/20 p-3.5 text-xs text-red-300 flex items-center gap-2.5 rounded-md">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="border border-emerald-500/40 bg-emerald-950/20 p-3.5 text-xs text-emerald-300 flex items-center gap-2.5 rounded-md">
            <Check size={16} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70 font-medium">
              {content.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3 text-text-ondark/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@example.com"
                className="w-full border border-hairline bg-bg-deep py-2.5 pl-10 pr-4 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded-md transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70 font-medium">
                {content.auth.passwordLabel}
              </label>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-text-ondark/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-hairline bg-bg-deep py-2.5 pl-10 pr-10 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded-md transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-text-ondark/40 hover:text-accent-brass transition-colors p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-accent-brass py-3 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : content.auth.signInCta}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-hairline w-full" />
          <span className="bg-bg-primary px-3 text-[10px] uppercase tracking-widest text-text-ondark/40">
            or
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border border-hairline bg-bg-deep py-2.5 text-xs text-text-ondark hover:border-accent-brass transition-colors rounded-md flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{content.auth.googleCta}</span>
        </button>

        {/* Sign up prompt */}
        <div className="text-center pt-2 text-xs text-text-ondark/60 font-light">
          {content.auth.noAccount}{' '}
          <Link
            href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="text-accent-brass hover:underline font-medium ml-1"
          >
            {content.auth.signUpCta}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <Suspense fallback={<div className="text-center text-xs text-text-ondark/50">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
