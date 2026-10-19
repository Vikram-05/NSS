import { useState } from "react";

export default function CollegeRail({ colleges, activeId, onSelect }) {
  const [q, setQ] = useState("");
  
  const active = colleges.find((c) => c.id === activeId);
  const isSearching = q.trim().length > 0;

  const filtered = colleges.filter((c) => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return c.college_name.toLowerCase().includes(t);
  });

  return (
    <aside className="md:sticky md:top-6 md:h-fit">
      <div className="hairline bg-cream shadow-grain">
        <div className="px-4 py-3 border-b border-ink/10 flex items-center justify-between">
          <span className="num">College</span>
          <span className="w-2 h-2 rounded-full bg-moss" />
        </div>

        {/* Search bar is always visible */}
        <div className="p-3 border-b border-ink/10">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search to change college…"
            className="w-full bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-ink/40 border-b border-ink/20 focus:border-ember"
          />
        </div>

        {/* 
          If searching, show the filtered list. 
          If not searching, ONLY show the currently selected college.
        */}
        <ul className="max-h-[55vh] overflow-y-auto divide-y divide-ink/5 no-scrollbar">
          {isSearching ? (
            // Show filtered list while typing
            filtered.map((c) => {
              const isActive = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onSelect(c);
                      setQ(""); // Clear search and collapse back to selected
                    }}
                    className={`w-full text-left px-4 py-3 text-sm leading-snug transition-colors break-words ${
                      isActive
                        ? "bg-ink text-paper"
                        : "hover:bg-sand/60 text-ink/80"
                    }`}
                  >
                    {c.college_name}
                  </button>
                </li>
              );
            })
          ) : (
            // Show ONLY the currently selected college when not searching
            active && (
              <li>
                <button
                  className="w-full text-left px-4 py-3 text-sm leading-snug bg-ink text-paper cursor-default break-words"
                >
                  <span className="font-mono text-[10px] tracking-widest opacity-60 block mb-1">
                  </span>
                  {active.college_name}
                </button>
              </li>
            )
          )}

          {/* No results message */}
          {isSearching && filtered.length === 0 && (
            <li className="px-4 py-6 text-sm text-ink/50 italic">
              No matches found.
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}