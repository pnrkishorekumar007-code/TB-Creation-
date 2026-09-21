'use client';

export default function Error({ error, reset }) {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="font-display text-6xl text-accent mb-2">Oops</p>
      <h1 className="font-display text-2xl mb-3 uppercase">Something went wrong</h1>
      <p className="text-sm text-muted mb-8">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 bg-accent text-ink font-semibold rounded-md glow-btn transition"
      >
        Try again
      </button>
    </div>
  );
}