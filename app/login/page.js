'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import AuthLayout from '../../components/AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <h1 className="font-display text-3xl mb-1 uppercase">Log In</h1>
      <p className="text-sm text-muted mb-8">Good to see you again.</p>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-panel panel-border rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
          className="bg-panel panel-border rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 bg-accent text-ink font-bold rounded-md glow-btn transition disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="flex items-center justify-between mt-5">
        <p className="text-sm text-muted">
          No account? <Link href="/signup" className="text-accent hover:underline font-medium">Sign up</Link>
        </p>
        <Link href="/forgot-password" className="text-sm text-accent hover:underline font-medium">
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}
