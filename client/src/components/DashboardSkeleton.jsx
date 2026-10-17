export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Top ember banner */}
      <div className="bg-ember/20">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-2 flex items-center justify-between">
          <div className="h-3 w-64 bg-ink/10 rounded" />
          <div className="h-3 w-16 bg-ink/10 rounded" />
        </div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-4">
        <div className="h-3 w-20 bg-ink/10 rounded" />
        <div className="flex items-end justify-between gap-4 flex-wrap mt-3">
          <div>
            <div className="h-12 w-72 max-w-full bg-ink/10 rounded mt-2" />
            <div className="h-4 w-56 bg-ink/5 rounded mt-3" />
          </div>
          <div className="h-10 w-36 bg-ink/10 rounded" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        {/* Stats row — 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="hairline bg-cream p-5">
              <div className="h-3 w-20 bg-ink/10 rounded" />
              <div className="h-10 w-12 bg-ink/10 rounded mt-3" />
            </div>
          ))}
        </div>

        {/* Events list */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="h-3 w-16 bg-ink/10 rounded" />
              <div className="h-8 w-40 bg-ink/10 rounded mt-2" />
            </div>
            <div className="h-3 w-16 bg-ink/10 rounded" />
          </div>
          <hr className="my-6 rule" />

          {/* 2-col on mobile, 3-col on desktop, 6 placeholder cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="hairline bg-cream overflow-hidden flex flex-col">
                <div className="aspect-[16/9] bg-ink/10" />
                <div className="p-3 md:p-4 flex flex-col flex-1 gap-2">
                  <div className="h-4 w-3/4 bg-ink/10 rounded" />
                  <div className="h-3 w-1/2 bg-ink/5 rounded" />
                  <div className="h-3 w-2/3 bg-ink/5 rounded" />
                  <div className="h-3 w-1/2 bg-ink/5 rounded" />
                  <div className="mt-auto pt-3 border-t border-ink/10 flex justify-between">
                    <div className="h-3 w-8 bg-ink/10 rounded" />
                    <div className="h-3 w-6 bg-ink/10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="h-3 w-24 bg-ink/10 rounded" />
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 bg-ink/10 rounded" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}