export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 bg-blush/60 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square bg-blush/60 rounded-card" />
              <div className="h-4 w-3/4 bg-blush/60 rounded" />
              <div className="h-4 w-1/2 bg-blush/60 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
