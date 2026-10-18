'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import AuthLayout from '../../components/AuthLayout';

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
    <AuthLayout variant="forgot-password">
      <h1 className="font-display text-3xl mb-1 uppercase">Forgot Password</h1>
      <p className="text-sm text-muted mb-8">Enter your email and we&apos;ll send a reset link.</p>

      {status === 'sent' ? (
        <div className="static-card rounded-lg p-6">
          <p className="text-sm">If that email is registered, a reset link has been sent.</p>
          {devUrl && (
            <div className="mt-4 pt-4 border-t border-border/10">
              <p className="text-xs text-muted mb-2">
                Dev mode — no email service is configured yet, so here&apos;s your reset link directly:
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
            className="bg-panel panel-border rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-5 py-3 bg-accent text-ink font-bold rounded-md glow-btn transition disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-sm text-muted mt-5">
        <Link href="/login" className="text-accent hover:underline font-medium">Back to log in</Link>
      </p>
    </AuthLayout>
  );
}
