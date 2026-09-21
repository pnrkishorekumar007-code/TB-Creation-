import Skeleton from '../components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="ink-card rounded-lg overflow-hidden">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}