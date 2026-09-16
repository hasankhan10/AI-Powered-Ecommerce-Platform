'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { content } from '@/config/content';
import { brandConfig } from '@/config/brand.config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccessMsg(content.auth.otpSent);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
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
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate Google sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md border border-hairline bg-bg-primary p-8 shadow-2xl rounded-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-ondark/60 hover:text-accent-brass transition-colors p-1 rounded-md"
          aria-label="Close auth modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            {brandConfig.name}
          </span>
          <h2 className="font-serif text-2xl tracking-wide text-text-ondark font-light">
            {isSignUp ? content.auth.signUpTitle : content.auth.signInTitle}
          </h2>
        </div>

        {/* Error / Success Notices */}
        {errorMsg && (
          <div className="mb-6 border border-red-500/30 bg-red-950/20 p-3 text-center text-xs text-red-300 rounded-md">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 border border-accent-brass/40 bg-accent-brass/10 p-3 text-center text-xs text-accent-brass rounded-md">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-text-ondark/70">
              {content.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-text-ondark/40" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full border border-hairline bg-bg-deep/60 py-2.5 pl-10 pr-4 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-text-ondark/70">
              {content.auth.passwordLabel}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-text-ondark/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-hairline bg-bg-deep/60 py-2.5 pl-10 pr-10 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
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

          {!isSignUp && (
            <div className="text-right">
              <a
                href="#forgot"
                className="text-[11px] text-text-ondark/50 hover:text-accent-brass transition-colors"
              >
                {content.auth.forgotPassword}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-brass py-3 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 rounded-md shadow-md"
          >
            {loading
              ? 'Processing...'
              : isSignUp
              ? content.auth.signUpCta
              : content.auth.signInCta}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline" />
          </div>
          <span className="relative bg-bg-primary px-3 text-[10px] uppercase tracking-[0.2em] text-text-ondark/40">
            or
          </span>
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border border-hairline bg-bg-deep/40 py-2.5 text-xs text-text-ondark hover:border-accent-brass/50 transition-colors flex items-center justify-center gap-3 rounded-md"
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

        {/* Toggle Mode Footer */}
        <div className="mt-6 text-center text-xs text-text-ondark/60">
          {isSignUp ? content.auth.haveAccount : content.auth.noAccount}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-accent-brass hover:underline font-medium ml-1"
          >
            {isSignUp ? content.auth.signInCta : content.auth.signUpCta}
          </button>
        </div>
      </div>
    </div>
  );
}
