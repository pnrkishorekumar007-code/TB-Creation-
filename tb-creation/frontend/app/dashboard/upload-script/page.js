'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function UploadScriptPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', synopsis: '', genre: 'General' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e, publishNow) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please attach a script file');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('publish', publishNow ? 'true' : 'false');
      data.append('file', file);

      await api.post('/scripts', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-2 uppercase">Upload Script</h1>
      <p className="text-muted mb-8">Share a manga script — PDF, DOC, or TXT.</p>

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <textarea
          rows={4}
          placeholder="Synopsis"
          value={form.synopsis}
          onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          placeholder="Genre"
          value={form.genre}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <div>
          <label className="text-sm text-muted block mb-2">Script file (PDF, DOC, DOCX, or TXT)</label>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => submit(e, false)}
            className="flex-1 px-5 py-3 border border-paper/20 rounded text-sm hover:border-accent transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => submit(e, true)}
            className="flex-1 px-5 py-3 bg-accent text-ink font-semibold rounded disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
        <p className="text-xs text-muted">Drafts stay private until you submit them.</p>
      </form>
    </div>
  );
}
