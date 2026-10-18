'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import AuthLayout from '../../components/AuthLayout';

const ROLE_OPTIONS = [
  { value: 'reader', label: 'Reader', desc: 'Browse and read comics & scripts' },
  { value: 'author', label: 'Author', desc: 'Publish your own comics & scripts' },
];

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'author' ? 'author' : 'reader';

  const [form, setForm] = useState({ name: '', email: '', password: '', role: initialRole });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="signup">
      <h1 className="font-display text-3xl mb-1 uppercase">Sign Up</h1>
      <p className="text-sm text-muted mb-8">Free, and takes less than a minute.</p>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-panel panel-border rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition"
        />
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
          placeholder="Password (min 6 characters)"
          minLength={6}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-panel panel-border rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition"
        />

        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setForm({ ...form, role: opt.value })}
              className={`text-left rounded-md border px-3.5 py-3 transition ${
                form.role === opt.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border/15 hover:border-border/30'
              }`}
            >
              <p className={`text-sm font-semibold ${form.role === opt.value ? 'text-accent' : 'text-paper'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 bg-accent text-ink font-bold rounded-md glow-btn transition disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-muted mt-5">
        Already have an account? <Link href="/login" className="text-accent hover:underline font-medium">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
