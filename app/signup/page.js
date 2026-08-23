'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reader' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(form.name, form.email, form.password, form.role);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-3xl mb-8 uppercase">Sign Up</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          required
          type="password"
          placeholder="Password (min 6 characters)"
          minLength={6}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.role === 'reader'}
              onChange={() => setForm({ ...form, role: 'reader' })}
            />
            I'm a reader
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.role === 'author'}
              onChange={() => setForm({ ...form, role: 'author' })}
            />
            I'm an author
          </label>
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" className="px-5 py-3 bg-accent text-ink font-semibold rounded">
          Create Account
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        Already have an account? <Link href="/login" className="text-accent hover:underline">Log in</Link>
      </p>
    </div>
  );
}
