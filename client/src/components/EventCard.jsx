export default function EventCard({ event, onOpen }) {
  const img = event.eventImage || event.rideLogo;
  const statusColor = event.status_color || "#198754";
  const start = formatDate(event.startDate);
  const end = formatDate(event.endDate);

  return (
    <article
      onClick={() => onOpen?.(event)}
      className="hairline bg-cream overflow-hidden flex flex-col cursor-pointer hover:shadow-grain transition-shadow min-w-0"
    >
      {img && (
        <div className="aspect-[16/9] overflow-hidden bg-sand">
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
      )}

      <div className="p-2.5 md:p-4 flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="font-display text-xs md:text-lg leading-tight line-clamp-2 flex-1 break-words">
            {event.eventTitle || event.eventName}
          </h3>
          {event.event_status && (
            <span
              className="text-[8px] md:text-[10px] uppercase tracking-widest px-1 md:px-2 py-0.5 shrink-0 text-paper"
              style={{ backgroundColor: statusColor }}
            >
              {event.event_status}
            </span>
          )}
        </div>

        <p className="text-[10px] md:text-xs text-ink/60 mt-1 md:mt-2 line-clamp-2">
          {event.categoryName || event.event_category}
        </p>

        <div className="mt-1.5 md:mt-3 space-y-0.5 md:space-y-1 text-[10px] md:text-xs text-ink/70">
          <p className="truncate">
            <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-ink/40">
              From{" "}
            </span>
            {start}
          </p>
          <p className="hidden md:block truncate">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              To{" "}
            </span>
            {end}
          </p>
          <p className="truncate">
            <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-ink/40">
              At{" "}
            </span>
            {event.eventLocation}
          </p>
        </div>

        <div className="mt-auto pt-2 md:pt-3 mt-2 md:mt-3 border-t border-ink/10 flex items-center justify-between text-[9px] md:text-[11px] font-mono text-ink/50 gap-1">
          <span>{event.total_volunteer || 0}v</span>
          <span className="hidden md:inline">{event.total_hours || "00:00:00"}</span>
          <span className="text-ember">→</span>
        </div>
      </div>
    </article>
  );
}

function formatDate(s) {
  if (!s) return "—";
  const d = new Date(String(s).replace(" ", "T"));
  if (isNaN(d.getTime())) return String(s);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}