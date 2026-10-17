import { useMemo, useState } from "react";

export default function DepartmentTabs({ departments, activeId, onSelect }) {
  const [showAll, setShowAll] = useState(false);

  const visible = useMemo(
    () => (showAll ? departments : departments.slice(0, 3)),
    [departments, showAll]
  );

  const hiddenCount = departments.length - visible.length;

  return (
    <>
      {/* ── Mobile: vertical list, 3 items + Show more ─────── */}
      <div className="md:hidden space-y-2">
        {visible.map((d) => {
          const active = d.id_department === activeId;
          return (
            <button
              key={d.id_department}
              onClick={() => onSelect(d)}
              className={`w-full text-left px-3 py-2.5 text-[9px] uppercase tracking-widest border transition-colors flex items-center justify-between gap-3 ${
                active
                  ? "bg-ink text-paper border-ink"
                  : "bg-cream text-ink/70 border-ink/20 hover:border-ink"
              }`}
            >
              <span className="truncate">{d.department_name}</span>
              
            </button>
          );
        })}

        {departments.length > 3 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="w-full px-3 py-2 text-[10px] uppercase tracking-widest text-center border border-dashed border-ink/25 hover:border-ink text-ink/60 hover:text-ink transition-colors"
          >
            {showAll
              ? "Show fewer"
              : `Show ${hiddenCount} more department${hiddenCount === 1 ? "" : "s"}`}
          </button>
        )}
      </div>

      {/* ── Desktop: original wrapping pills ──────────────── */}
      <div className="hidden md:flex flex-wrap gap-2">
        {departments.map((d) => {
          const active = d.id_department === activeId;
          return (
            <button
              key={d.id_department}
              onClick={() => onSelect(d)}
              className={`chip ${active ? "chip-active" : ""}`}
            >
              {d.department_name}
            </button>
          );
        })}
      </div>
    </>
  );
}