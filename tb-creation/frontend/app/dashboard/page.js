'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

const STATUS_STYLE = {
  draft: 'text-muted',
  pending: 'text-accent2',
  approved: 'text-green-400',
  rejected: 'text-accent',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [comics, setComics] = useState([]);
  const [scripts, setScripts] = useState([]);

  const load = () => {
    api.get('/comics/mine').then((res) => setComics(res.data));
    api.get('/scripts/mine').then((res) => setScripts(res.data));
  };

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const submitComic = async (id) => {
    await api.put(`/comics/${id}/submit`);
    load();
  };

  const submitScript = async (id) => {
    await api.put(`/scripts/${id}/submit`);
    load();
  };

  if (loading) return null;
  if (!user || (user.role !== 'author' && user.role !== 'admin')) {
    return <p className="max-w-4xl mx-auto px-5 py-10 text-muted">Author access only. Sign up as an author to publish.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-display text-3xl uppercase">My Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/dashboard/upload-comic" className="px-4 py-2 bg-accent text-ink text-sm font-semibold rounded">
            + Upload Comic
          </Link>
          <Link href="/dashboard/upload-script" className="px-4 py-2 border border-paper/20 text-sm rounded hover:border-accent transition">
            + Upload Script
          </Link>
        </div>
      </div>

      <h2 className="font-display text-xl mb-3">My Comics</h2>
      {comics.length === 0 ? (
        <p className="text-muted text-sm mb-8">No comics uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {comics.map((c) => (
            <div key={c._id} className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm">
              <div>
                <p>{c.title}</p>
                <p className={`text-xs uppercase ${STATUS_STYLE[c.approvalStatus]}`}>{c.approvalStatus}</p>
              </div>
              <div className="flex gap-3 items-center">
                {(c.approvalStatus === 'draft' || c.approvalStatus === 'rejected') && (
                  <button onClick={() => submitComic(c._id)} className="text-accent text-xs hover:underline">
                    Submit for review
                  </button>
                )}
                <Link href={`/dashboard/comics/${c._id}/add-chapter`} className="text-accent2 text-xs hover:underline">
                  + Add Chapter
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl mb-3">My Scripts</h2>
      {scripts.length === 0 ? (
        <p className="text-muted text-sm">No scripts uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {scripts.map((s) => (
            <div key={s._id} className="ink-card rounded px-4 py-3 text-sm flex justify-between items-center">
              <div>
                <p>{s.title}</p>
                <p className={`text-xs uppercase ${STATUS_STYLE[s.approvalStatus]}`}>{s.approvalStatus}</p>
              </div>
              {(s.approvalStatus === 'draft' || s.approvalStatus === 'rejected') && (
                <button onClick={() => submitScript(s._id)} className="text-accent text-xs hover:underline">
                  Submit for review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
