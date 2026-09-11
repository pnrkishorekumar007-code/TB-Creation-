'use client';

import { useState } from 'react';
import api from '../lib/api';

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/reports', { targetType, targetId, reason });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5" onClick={onClose}>
      <div
        className="ink-card rounded-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <>
            <p className="font-display text-xl mb-2">Report Submitted</p>
            <p className="text-sm text-muted mb-5">Thanks for flagging this — our team will take a look.</p>
            <button onClick={onClose} className="w-full px-4 py-2.5 bg-accent text-ink font-semibold rounded-md">
              Close
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <p className="font-display text-xl mb-1">Report {targetType}</p>
            <p className="text-sm text-muted mb-4">Let us know what's wrong — our team reviews every report.</p>
            <textarea
              autoFocus
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full bg-panel2 panel-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent mb-3"
            />
            {error && <p className="text-sm text-accent mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-paper/20 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-accent text-ink font-semibold rounded-md text-sm disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
