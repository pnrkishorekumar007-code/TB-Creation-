'use client';

import { useState } from 'react';
import api from '../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/contact', form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-16">
      <h1 className="font-display text-3xl mb-2 uppercase">Contact Us</h1>
      <p className="text-muted mb-8">Questions, feedback, or partnership ideas — send them our way.</p>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          required
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <textarea
          required
          rows={5}
          placeholder="Your message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-5 py-3 bg-accent text-ink font-semibold rounded disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
        {status === 'sent' && <p className="text-sm text-green-400">Message sent — we'll get back to you soon.</p>}
        {status === 'error' && <p className="text-sm text-accent">Something went wrong. Try again.</p>}
      </form>
    </div>
  );
}
