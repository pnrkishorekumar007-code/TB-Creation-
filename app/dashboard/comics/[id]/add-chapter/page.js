'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../../lib/api';

export default function AddChapterPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', order: 1, publishAt: '' });
  const [pages, setPages] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (pages.length === 0) {
      setError('Add at least one page image');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('order', form.order);
      if (form.publishAt) data.append('publishAt', form.publishAt);
      pages.forEach((p) => data.append('pages', p));

      await api.post(`/comics/${id}/chapters`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add chapter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-2">Add Chapter</h1>
      <p className="text-muted mb-8">Upload page images in reading order.</p>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Chapter title (e.g. Chapter 1: The Beginning)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          required
          type="number"
          min={1}
          placeholder="Chapter order (e.g. 1)"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: e.target.value })}
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <div>
          <label className="text-sm text-muted block mb-2">Publish date (leave blank to publish immediately)</label>
          <input
            type="datetime-local"
            value={form.publishAt}
            onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
            className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent w-full"
          />
        </div>
        <div>
          <label className="text-sm text-muted block mb-2">Page images (select multiple, in order)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPages(Array.from(e.target.files))}
            className="text-sm"
          />
          {pages.length > 0 && <p className="text-xs text-muted mt-1">{pages.length} page(s) selected</p>}
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" disabled={submitting} className="px-5 py-3 bg-accent text-ink font-semibold rounded disabled:opacity-50">
          {submitting ? 'Uploading...' : 'Publish Chapter'}
        </button>
      </form>
    </div>
  );
}
