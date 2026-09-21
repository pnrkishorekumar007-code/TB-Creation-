import Skeleton from './ui/Skeleton.js';

export default function ComicCardSkeleton() {
  return (
    <div className="ink-card rounded-lg overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}