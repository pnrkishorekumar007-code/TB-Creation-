'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';
import { formatNumber } from '../../lib/site';

const STATUS_STYLE = {
  draft: 'text-muted',
  pending: 'text-accent2',
  approved: 'text-green-400',
  rejected: 'text-accent',
};

function StatCard({ label, value, sub }) {
  return (
    <div className="ink-card rounded-lg p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [comics, setComics] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [followers, setFollowers] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    api.get('/comics/mine').then((res) => setComics(res.data)).finally(() => setLoaded(true));
    api.get('/scripts/mine').then((res) => setScripts(res.data)).finally(() => {});
    api.get(`/follows/count/${user.id}`).then((res) => setFollowers(res.data.followers)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

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
    return (
      <div className="max-w-4xl mx-auto px-5 py-10 text-center">
        <div className="ink-card rounded-lg p-10">
          <p className="font-display text-2xl uppercase mb-2">Author access only</p>
          <p className="text-sm text-muted mb-6">
            Publish comics and scripts with a creator account.
          </p>
          <Link
            href="/profile"
            className="inline-block px-5 py-2.5 bg-accent text-ink font-semibold rounded-md glow-btn transition"
          >
            Upgrade to creator
          </Link>
        </div>
      </div>
    );
  }

  const liveComics = comics.filter((c) => c.approvalStatus === 'approved').length;
  const totalViews =
    comics.reduce((sum, c) => sum + (c.views || 0), 0) +
    scripts.reduce((sum, s) => sum + (s.views || 0), 0);
  const pendingCount =
    comics.filter((c) => c.approvalStatus === 'pending').length +
    scripts.filter((s) => s.approvalStatus === 'pending').length;

  const stats = [
    { label: 'Total Series', value: comics.length + scripts.length, sub: `${liveComics} live` },
    { label: 'In Review', value: pendingCount },
    { label: 'Total Views', value: formatNumber(totalViews) },
    ...(followers != null ? [{ label: 'Followers', value: formatNumber(followers) }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Studio</p>
          <h1 className="font-display text-3xl uppercase">My Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/upload-comic" className="px-4 py-2 bg-accent text-ink text-sm font-semibold rounded-md glow-btn transition">
            + Upload Comic
          </Link>
          <Link href="/dashboard/upload-script" className="px-4 py-2 border border-paper/20 text-sm rounded-md hover:border-accent transition">
            + Upload Script
          </Link>
        </div>
      </div>
      <p className="text-sm text-muted mb-8">Welcome back, {user.name}.</p>

      {loaded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      <h2 className="font-display text-xl mb-3 uppercase">My Comics</h2>
      {comics.length === 0 ? (
        <div className="ink-card rounded-lg p-8 text-center mb-8 border-dashed border-paper/10 border">
          <p className="text-sm text-muted mb-4">You haven&apos;t uploaded any comics yet.</p>
          <Link href="/dashboard/upload-comic" className="px-4 py-2 bg-accent text-ink text-sm font-semibold rounded-md glow-btn transition">
            Upload your first comic
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {comics.map((c) => (
            <div key={c._id} className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="truncate">{c.title}</p>
                <p className={`text-xs uppercase ${STATUS_STYLE[c.approvalStatus] || 'text-muted'}`}>
                  {c.approvalStatus}
                  {c.chapterCount != null && <span className="text-muted normal-case"> · {c.chapterCount} chapters</span>}
                  {c.views > 0 && <span className="text-muted normal-case"> · {formatNumber(c.views)} views</span>}
                </p>
              </div>
              <div className="flex gap-4 items-center shrink-0">
                {c.approvalStatus === 'approved' && (
                  <Link href={`/comics/${c._id}`} className="text-accent2 text-xs hover:underline">
                    View
                  </Link>
                )}
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

      <h2 className="font-display text-xl mb-3 uppercase">My Scripts</h2>
      {scripts.length === 0 ? (
        <div className="ink-card rounded-lg p-8 text-center border-dashed border-paper/10 border">
          <p className="text-sm text-muted mb-4">No scripts uploaded yet.</p>
          <Link href="/dashboard/upload-script" className="px-4 py-2 bg-accent text-ink text-sm font-semibold rounded-md glow-btn transition">
            Upload your first script
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {scripts.map((s) => (
            <div key={s._id} className="ink-card rounded px-4 py-3 text-sm flex justify-between items-center gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="truncate">{s.title}</p>
                <p className={`text-xs uppercase ${STATUS_STYLE[s.approvalStatus] || 'text-muted'}`}>
                  {s.approvalStatus}
                  {s.views > 0 && <span className="text-muted normal-case"> · {formatNumber(s.views)} views</span>}
                </p>
              </div>
              <div className="flex gap-4 items-center shrink-0">
                {s.approvalStatus === 'approved' && (
                  <Link href={`/scripts/${s._id}`} className="text-accent2 text-xs hover:underline">
                    View
                  </Link>
                )}
                {(s.approvalStatus === 'draft' || s.approvalStatus === 'rejected') && (
                  <button onClick={() => submitScript(s._id)} className="text-accent text-xs hover:underline">
                    Submit for review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}