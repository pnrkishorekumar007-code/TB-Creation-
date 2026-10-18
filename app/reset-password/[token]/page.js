'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import AuthLayout from '../../../components/AuthLayout';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="reset-password">
      {done ? (
        <div className="text-center">
          <p className="font-display text-2xl mb-2 uppercase">Password Updated</p>
          <p className="text-muted text-sm">Redirecting you to log in...</p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl mb-1 uppercase">Set a New Password</h1>
          <p className="text-sm text-muted mb-8">Make it something you&apos;ll remember this time.</p>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              required
              type="password"
              placeholder="New password (min 6 characters)"
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-panel panel-border rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition"
            />
            <input
              required
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-panel panel-border rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 bg-accent text-ink font-bold rounded-md glow-btn transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
          <p className="text-sm text-muted mt-5">
            <Link href="/login" className="text-accent hover:underline font-medium">Back to log in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
