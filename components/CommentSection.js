'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import api from '../lib/api';

export default function CommentSection({ comicId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = () => {
    api.get(`/comments/comic/${comicId}`).then((res) => setComments(res.data));
  };

  useEffect(() => { load(); }, [comicId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await api.post('/comments', { comicId, text });
      setText('');
      load();
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/comments/${id}`);
    load();
  };

  const report = async (id) => {
    const reason = window.prompt('Why are you reporting this comment?');
    if (!reason || !reason.trim()) return;
    await api.post('/reports', { targetType: 'comment', targetId: id, reason });
    alert('Thanks — our team will review it.');
  };

  return (
    <div>
      {user ? (
        <form onSubmit={submit} className="flex gap-2 mb-6">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-panel panel-border rounded px-4 py-2 text-sm outline-none focus:border-accent"
          />
          <button disabled={posting} className="px-4 py-2 bg-accent text-ink text-sm font-semibold rounded disabled:opacity-50">
            Post
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted mb-6">
          <Link href="/login" className="text-accent hover:underline">Log in</Link> to leave a comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted">No comments yet — be the first.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c._id} className="ink-card rounded px-4 py-3">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold">{c.user?.name || 'Deleted user'}</p>
                <div className="flex gap-3">
                  {(user?.id === c.user?._id || user?.role === 'admin') && (
                    <button onClick={() => remove(c._id)} className="text-xs text-muted hover:text-accent">
                      Delete
                    </button>
                  )}
                  {user && user.id !== c.user?._id && (
                    <button onClick={() => report(c._id)} className="text-xs text-muted hover:text-accent">
                      Report
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted mt-1">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
