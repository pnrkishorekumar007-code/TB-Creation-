'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [devUrl, setDevUrl] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('sent');
      if (res.data.devResetUrl) setDevUrl(res.data.devResetUrl);
    } catch {
      setStatus('sent'); // Same message either way, so we never reveal whether an email is registered.
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-3xl mb-2">Forgot Password</h1>
      <p className="text-muted mb-8">Enter your email and we'll send a reset link.</p>

      {status === 'sent' ? (
        <div className="ink-card rounded-lg p-6">
          <p className="text-sm">If that email is registered, a reset link has been sent.</p>
          {devUrl && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-muted mb-2">
                Dev mode — no email service is configured yet, so here's your reset link directly:
              </p>
              <Link href={devUrl.replace(/^https?:\/\/[^/]+/, '')} className="text-accent text-sm hover:underline break-all">
                {devUrl}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button type="submit" disabled={status === 'sending'} className="px-5 py-3 bg-accent text-ink font-semibold rounded disabled:opacity-50">
            {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-sm text-muted mt-4">
        <Link href="/login" className="text-accent hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
