'use client';

import React from 'react';

interface CheckoutContactSectionProps {
  name: string;
  email: string;
  phone: string;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
}

export function CheckoutContactSection({
  name,
  email,
  phone,
  onNameChange,
  onEmailChange,
  onPhoneChange,
}: CheckoutContactSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
        Contact Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Mehedi Hasan"
            className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="name@example.com"
            className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
          Phone Number (for delivery SMS)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
        />
      </div>
    </div>
  );
}
