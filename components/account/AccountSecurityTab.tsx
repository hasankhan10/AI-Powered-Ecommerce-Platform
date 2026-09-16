'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from '@/lib/store/useToast';

interface AccountSecurityTabProps {
  onUpdatePassword: (password: string) => Promise<boolean>;
}

export function AccountSecurityTab({ onUpdatePassword }: AccountSecurityTabProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const success = await onUpdatePassword(newPassword);
    setSaving(false);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Your account password has been updated.', 'Password Changed');
    } else {
      setErrorMsg('Failed to update password.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
        <div className="border-b border-hairline/60 pb-4">
          <h3 className="font-serif text-xl text-text-ondark font-light">
            Password & Security
          </h3>
          <p className="text-xs text-text-ondark/60 font-light mt-0.5">
            Change your account credentials to keep your patron account secure.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 rounded">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-text-ondark/40 hover:text-text-ondark"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Confirm New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || !newPassword}
              className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-md shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Lock size={13} />
              <span>{saving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Badge & Information */}
      <div className="border border-hairline/60 bg-bg-deep/50 p-5 rounded-lg flex items-start gap-4">
        <div className="p-2.5 bg-accent-brass/10 border border-accent-brass/30 text-accent-brass rounded-md shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="space-y-1 text-xs font-light text-text-ondark/70">
          <h4 className="text-text-ondark font-medium uppercase tracking-wider text-[11px]">
            Account Security Assurance
          </h4>
          <p className="leading-relaxed">
            Your authentication credentials and transactions are encrypted with 256-bit SSL protocols. Always choose a unique password not used elsewhere.
          </p>
        </div>
      </div>
    </div>
  );
}
