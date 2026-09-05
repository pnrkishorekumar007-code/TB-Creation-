import Link from 'next/link';

export default function ScriptCard({ script }) {
  return (
    <Link href={`/scripts/${script._id}`} className="block ink-card rounded-lg p-5">
      <p className="font-display text-lg leading-tight uppercase">{script.title}</p>
      <p className="text-sm text-muted mt-2 line-clamp-2">{script.synopsis}</p>
      <div className="flex items-center justify-between mt-4 text-xs">
        <span className="text-accent2 font-semibold uppercase tracking-wide">{script.genre}</span>
        <span className="text-muted">by {script.author?.name || 'Unknown'}</span>
      </div>
    </Link>
  );
}
