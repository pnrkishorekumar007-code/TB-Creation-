'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import api from '../lib/api';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = () => {
    api.get('/notifications').then((res) => {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    });
  };

  useEffect(() => {
    if (!user) return;
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!user) return null;

  const toggleOpen = async () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await api.put('/notifications/mark-read');
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleOpen} className="relative flex items-center justify-center text-muted hover:text-accent transition p-1" aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8.5a6 6 0 0 1 12 0c0 6.5 2.75 8.25 2.75 8.25H3.25S6 15 6 8.5Z" />
          <path d="M10.3 20a1.85 1.85 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-ink text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-panel panel-border border rounded shadow-lg max-h-80 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted p-4">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n._id}
                href={n.link || '#'}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm border-b border-white/5 hover:bg-panel2 transition"
              >
                <p>{n.message}</p>
                <p className="text-xs text-muted mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
