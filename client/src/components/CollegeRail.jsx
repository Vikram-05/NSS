import { useMemo, useState } from "react";

export default function CollegeRail({ colleges, activeId, onSelect }) {
    const [q, setQ] = useState("");
    const [openMobile, setOpenMobile] = useState(false);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return colleges;
        return colleges.filter((c) => c.college_name.toLowerCase().includes(t));
    }, [colleges, q]);

    const active = colleges.find((c) => c.id === activeId);

    return (
        <aside className="md:sticky md:top-6 md:h-fit">
            {/* Mobile: collapsible summary */}
            <button
                onClick={() => setOpenMobile((o) => !o)}
                className="md:hidden w-full hairline bg-cream shadow-grain px-4 py-3 flex items-center justify-between gap-3 text-left"
                aria-expanded={openMobile}
            >
                <div className="min-w-0 flex-1">
                    <p className="num">College</p>
                    <p
                        className="text-sm leading-snug mt-0.5 break-words"
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                        title={active?.college_name}
                    >
                        {active?.college_name ?? "Choose a college"}
                    </p>
                </div>
                <span className="font-mono text-xs text-ink/60 shrink-0">
                    {openMobile ? "▲" : "▼"}
                </span>
            </button>

            {/* Panel — hidden on mobile unless opened; always visible on md+ */}
            <div
                className={`${openMobile ? "block" : "hidden"
                    } md:block mt-3 md:mt-0 hairline bg-cream shadow-grain`}
            >
                <div className="px-4 py-3 border-b border-ink/10 flex items-center justify-between">
                    <span className="num">Colleges · {colleges.length}</span>
                    <span className="w-2 h-2 rounded-full bg-moss" />
                </div>

                <div className="p-3 border-b border-ink/10">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search college…"
                        className="w-full bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-ink/40 border-b border-ink/20 focus:border-ember"
                    />
                </div>

                <ul className="max-h-[55vh] md:max-h-[70vh] overflow-y-auto divide-y divide-ink/5 no-scrollbar">
                    {filtered.map((c) => {
                        const isActive = c.id === activeId;
                        return (
                            <li key={c.id}>
                                <button
                                    onClick={() => {
                                        onSelect(c);
                                        setOpenMobile(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm leading-snug transition-colors break-words ${isActive
                                            ? "bg-ink text-paper"
                                            : "hover:bg-sand/60 text-ink/80"
                                        }`}
                                    title={c.college_name}
                                >
                                    {c.college_name}
                                </button>
                            </li>
                        );
                    })}
                    {filtered.length === 0 && (
                        <li className="px-4 py-6 text-sm text-ink/50 italic">
                            No matches.
                        </li>
                    )}
                </ul>
            </div>
        </aside>
    );
}