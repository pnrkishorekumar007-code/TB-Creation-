'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  // Form state must sync once auth finishes loading — useState's initial
  // value runs while `user` is still null, leaving the fields empty.
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
    }
  }, [user]);

  if (loading) return null;
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <p className="font-display text-2xl mb-3">Sign In Required</p>
        <p className="text-muted mb-6">Create a free account to set up your profile.</p>
        <div className="flex justify-center gap-3">
          <Link href="/signup" className="px-5 py-3 bg-accent text-ink font-semibold rounded-md glow-btn">Sign Up</Link>
          <Link href="/login" className="px-5 py-3 border border-border/20 rounded-md hover:border-accent transition">Log In</Link>
        </div>
      </div>
    );
  }

  const isReader = user.role === 'reader';

  const upgrade = async () => {
    setUpgrading(true);
    setError('');
    try {
      const res = await api.put('/authors/me/upgrade');
      updateUser(res.data);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upgrade your account');
      setUpgrading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      const data = new FormData();
      data.append('name', name);
      data.append('bio', bio);
      if (avatar) data.append('avatar', avatar);

      const res = await api.put('/authors/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ name: res.data.name, bio: res.data.bio, avatarUrl: res.data.avatarUrl });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="page-title font-display text-4xl tracking-wide mb-2">My Profile</h1>
      <p className="text-muted mb-8">Update how other readers see you.</p>

      {isReader && (
        <div className="static-card rounded-lg p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display text-lg uppercase">Want to publish?</p>
            <p className="text-sm text-muted mt-1">
              Upgrade to a creator account to upload comics and scripts.
            </p>
          </div>
          <button
            type="button"
            onClick={upgrade}
            disabled={upgrading}
            className="px-4 py-2 bg-accent text-ink text-sm font-semibold rounded-md glow-btn transition disabled:opacity-50"
          >
            {upgrading ? 'Upgrading…' : 'Become a Creator'}
          </button>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio"
          className="bg-panel panel-border rounded px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <div>
          <label className="text-sm text-muted block mb-2">Avatar</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} className="text-sm" />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        {saved && <p className="text-sm text-success">Profile updated.</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-3 bg-accent text-ink font-semibold rounded-md disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/authors/${user.id}`)}
          className="text-sm text-accent hover:underline text-left"
        >
          View my public profile →
        </button>
      </form>
    </div>
  );
}
