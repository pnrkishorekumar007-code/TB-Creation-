import Skeleton from './ui/Skeleton.js';

export default function ScriptCardSkeleton() {
  return (
    <div className="ink-card rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mt-3" />
      <Skeleton className="h-3 w-4/5 mt-2" />
      <div className="flex justify-between mt-6 pt-3 border-t border-border/10">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}