'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [pendingComics, setPendingComics] = useState([]);
  const [pendingScripts, setPendingScripts] = useState([]);
  const [reports, setReports] = useState([]);

  const load = () => {
    api.get('/admin/comics/pending').then((res) => setPendingComics(res.data));
    api.get('/admin/scripts/pending').then((res) => setPendingScripts(res.data));
    api.get('/reports/open').then((res) => setReports(res.data));
  };

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user]);

  const reviewComic = async (id, status) => {
    await api.put(`/admin/comics/${id}/review`, { status });
    load();
  };

  const reviewScript = async (id, status) => {
    await api.put(`/admin/scripts/${id}/review`, { status });
    load();
  };

  const resolveReport = async (id, status) => {
    await api.put(`/reports/${id}/resolve`, { status });
    load();
  };

  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <p className="max-w-4xl mx-auto px-5 py-10 text-muted">Admin access only.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-8 uppercase">Admin — Approval Queue</h1>

      <h2 className="font-display text-xl mb-3">Open Reports</h2>
      {reports.length === 0 ? (
        <p className="text-muted text-sm mb-8">Nothing reported.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {reports.map((r) => (
            <div key={r._id} className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm">
              <div>
                <p className="uppercase text-xs text-accent">{r.targetType}</p>
                <p>{r.reason}</p>
                <p className="text-xs text-muted mt-1">reported by {r.reporter?.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => resolveReport(r._id, 'reviewed')} className="px-3 py-1 bg-accent text-ink rounded text-xs font-semibold">
                  Mark Reviewed
                </button>
                <button onClick={() => resolveReport(r._id, 'dismissed')} className="px-3 py-1 border border-paper/20 rounded text-xs">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl mb-3">Pending Comics</h2>
      {pendingComics.length === 0 ? (
        <p className="text-muted text-sm mb-8">Nothing pending.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {pendingComics.map((c) => (
            <div key={c._id} className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm">
              <div>
                <p>{c.title}</p>
                <p className="text-xs text-muted">by {c.author?.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => reviewComic(c._id, 'approved')} className="px-3 py-1 bg-accent text-ink rounded text-xs font-semibold">
                  Approve
                </button>
                <button onClick={() => reviewComic(c._id, 'rejected')} className="px-3 py-1 border border-paper/20 rounded text-xs">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl mb-3">Pending Scripts</h2>
      {pendingScripts.length === 0 ? (
        <p className="text-muted text-sm">Nothing pending.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {pendingScripts.map((s) => (
            <div key={s._id} className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm">
              <div>
                <p>{s.title}</p>
                <p className="text-xs text-muted">by {s.author?.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => reviewScript(s._id, 'approved')} className="px-3 py-1 bg-accent text-ink rounded text-xs font-semibold">
                  Approve
                </button>
                <button onClick={() => reviewScript(s._id, 'rejected')} className="px-3 py-1 border border-paper/20 rounded text-xs">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
