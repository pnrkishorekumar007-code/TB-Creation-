'use client';

export default function Error({ error, reset }) {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="font-display text-5xl text-accent mb-3">Oops</p>
      <h1 className="font-display text-2xl mb-3 uppercase">Something Went Wrong</h1>
      <p className="text-muted mb-8">
        This page hit an unexpected error. You can try again, or head back home.
      </p>
      <div className="flex justify-center gap-3">
        <button onClick={reset} className="px-5 py-3 bg-accent text-ink font-semibold rounded-md glow-btn">
          Try Again
        </button>
        <a href="/" className="px-5 py-3 border border-paper/20 rounded-md hover:border-accent transition">
          Back to Home
        </a>
      </div>
    </div>
  );
}
