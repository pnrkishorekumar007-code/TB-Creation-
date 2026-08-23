'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';

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

  if (done) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <p className="font-display text-2xl mb-2">Password Updated</p>
        <p className="text-muted">Redirecting you to log in...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-3xl mb-8">Set a New Password</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          type="password"
          placeholder="New password (min 6 characters)"
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          required
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" disabled={submitting} className="px-5 py-3 bg-accent text-ink font-semibold rounded disabled:opacity-50">
          {submitting ? 'Saving...' : 'Reset Password'}
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        <Link href="/login" className="text-accent hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
