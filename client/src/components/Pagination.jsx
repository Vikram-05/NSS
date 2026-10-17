export default function Pagination({
  page, totalPages, total, rangeStart, rangeEnd,
  length, onPage, onLength,
}) {
  if (total === 0) return null;

  const pages = [];
  const push = (p) => pages.push(p);
  push(1);
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) push(p);
  if (totalPages > 1) push(totalPages);

  const uniq = [...new Set(pages)].sort((a, b) => a - b);

  return (
    <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
      <p className="font-mono text-[11px] tracking-widest uppercase text-ink/60">
        {rangeStart}–{rangeEnd} of {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs uppercase tracking-widest hairline bg-cream hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        {uniq.map((p, i) => {
          const prev = uniq[i - 1];
          const gap = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center">
              {gap && <span className="px-1 text-ink/40">…</span>}
              <button
                onClick={() => onPage(p)}
                className={`px-3 py-1.5 text-xs font-mono ${
                  p === page
                    ? "bg-ink text-paper"
                    : "hairline bg-cream hover:bg-sand"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs uppercase tracking-widest hairline bg-cream hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      <select
        value={length}
        onChange={(e) => onLength(Number(e.target.value))}
        className="hairline bg-cream px-2 py-1.5 text-xs font-mono"
      >
        {[10, 25, 50, 100].map((n) => (
          <option key={n} value={n}>{n} / page</option>
        ))}
      </select>
    </div>
  );
}