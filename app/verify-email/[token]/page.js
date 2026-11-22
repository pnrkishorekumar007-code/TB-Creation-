'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';
import AuthLayout from '../../../components/AuthLayout';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [email, setEmail] = useState('');
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .post('/auth/verify-email', { token })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [token]);

  const resend = async (e) => {
    e.preventDefault();
    setResent(true);
    try {
      await api.post('/auth/resend-verification', { email });
    } catch {
      // The endpoint always answers the same way, so there is nothing to report.
    }
  };

  return (
    <AuthLayout variant="signup">
      <h1 className="font-display text-3xl mb-1 uppercase">
        {status === 'ok' ? 'Email Verified' : status === 'error' ? 'Link Problem' : 'Verifying...'}
      </h1>
      <p className="text-sm text-muted mb-8">
        {status === 'ok'
          ? 'Your account is ready. Welcome to TB Creation.'
          : status === 'error'
            ? 'This link is invalid, expired, or already used.'
            : 'One moment while we confirm your email.'}
      </p>

      {status === 'ok' && (
        <Link
          href="/login"
          className="block text-center px-5 py-3 bg-accent text-ink font-bold rounded-md glow-btn transition"
        >
          Log In
        </Link>
      )}

      {status === 'error' && (
        <div className="static-card rounded-lg p-6">
          <p className="text-sm">Verification links work for 24 hours. Enter your email to get a new one.</p>
          <form onSubmit={resend} className="flex flex-col gap-3 mt-4">
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
              disabled={resent}
              className="px-5 py-3 bg-accent text-ink font-bold rounded-md glow-btn transition disabled:opacity-50"
            >
              {resent ? 'Sent — check your inbox' : 'Send New Link'}
            </button>
          </form>
        </div>
      )}

      <p className="text-sm text-muted mt-5">
        <Link href="/login" className="text-accent hover:underline font-medium">Back to log in</Link>
      </p>
    </AuthLayout>
  );
}
