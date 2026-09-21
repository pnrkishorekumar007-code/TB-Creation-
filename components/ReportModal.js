'use client';

import { useEffect, useRef, useState } from 'react';
import api from '../lib/api';

const REASONS = [
  'Spam or misleading',
  'Harassment or hateful content',
  'Copyright infringement',
  'Content breaks platform rules',
  'Something else',
];

export default function ReportModal({ open, onClose, targetType, targetId }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setDone(false);
    setError('');
    setDetails('');
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/reports', {
        targetType,
        targetId,
        reason: reason === 'Something else' ? 'Other' : reason,
        details,
      });
      setDone(true);
    } catch {
      setError('Could not submit the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Report content">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-panel panel-border rounded-lg shadow-card p-6">
        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-display text-xl uppercase mb-2">Report submitted</h2>
            <p className="text-sm text-muted mb-6">Thanks — our team will review it.</p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-accent text-ink text-sm font-bold rounded-md glow-btn transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 className="font-display text-xl uppercase mb-1">Report content</h2>
            <p className="text-sm text-muted mb-5">Tell us what&apos;s wrong. Reports are reviewed by our team.</p>

            <label htmlFor="report-reason" className="block text-xs uppercase tracking-widest text-muted font-semibold mb-2">
              Reason
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-panel2/60 panel-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent mb-4"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <label htmlFor="report-details" className="block text-xs uppercase tracking-widest text-muted font-semibold mb-2">
              Details <span className="normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              id="report-details"
              ref={textareaRef}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Anything specific our team should know?"
              className="w-full bg-panel2/60 panel-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent resize-none mb-5"
            />

            {error && <p className="text-sm text-accent mb-4">{error}</p>}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-muted hover:text-paper border border-border/20 rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-accent text-ink text-sm font-bold rounded-md glow-btn transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}