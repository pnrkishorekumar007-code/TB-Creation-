'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import api from '../lib/api';

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

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
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative p-1 text-muted hover:text-paper transition"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-accent text-ink text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold leading-none ring-2 ring-ink">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-panel panel-border rounded shadow-card max-h-80 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted px-4 py-4 text-center">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n._id}
                href={n.link || '#'}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm border-b border-white/5 last:border-b-0 hover:bg-panel2 transition"
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
