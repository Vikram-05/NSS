export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 py-16 justify-center text-ink/60">
      <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
      <span className="font-mono text-xs tracking-widest uppercase">{label}…</span>
    </div>
  );
}