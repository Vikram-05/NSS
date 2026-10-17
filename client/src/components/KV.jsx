export default function KV({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-ink/10 last:border-0">
      <span className="num shrink-0">{label}</span>
      <span className="text-right text-sm break-all">{String(value)}</span>
    </div>
  );
}