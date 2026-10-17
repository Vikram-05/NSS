import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function EventModal({ event, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!event) return null;

  const img =
    event.eventBanner || event.eventImage || event.rideBanner || event.rideLogo;
  const statusColor = event.status_color || "#198754";
  const start = formatDate(event.startDate);
  const end = formatDate(event.endDate);
  const created = formatDate(event.createdDate);

  const inviteCode =
    event.id ??
    event.inviteCode ??
    event.invite_code ??
    event.invitationCode ??
    null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/70 overflow-y-auto"
      onClick={onClose}
    >
      {/* Centered wrapper — leaves room on tiny screens and centers on big ones */}
      <div className="min-h-full flex items-start md:items-center justify-center p-3 md:p-6">
        <div
          className="hairline bg-cream w-full max-w-3xl shadow-grain my-3 md:my-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Banner ─────────────────────────────────────── */}
          {img && (
            <div className="aspect-[2.2/1] md:aspect-[3/1] overflow-hidden bg-sand relative">
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <button
                onClick={onClose}
                className="absolute top-2 right-2 md:top-3 md:right-3 w-9 h-9 md:w-8 md:h-8 grid place-items-center bg-ink/75 text-paper hover:bg-ink text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          )}

          {/* Close button for events with no banner */}
          {!img && (
            <div className="flex justify-end p-2">
              <button
                onClick={onClose}
                className="w-9 h-9 grid place-items-center bg-ink text-paper hover:bg-ember text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          )}

          <div className="p-4 md:p-8">
            {/* ── Title ────────────────────────────────── */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="num text-[10px] md:text-[11px]">
                  {event.event_status || "Event"} · {event.category || "event"}
                </p>
                <h2 className="font-display text-xl md:text-4xl leading-tight mt-1.5 md:mt-2 break-words">
                  {event.eventTitle || event.eventName || "Untitled event"}
                </h2>
              </div>
              {event.event_status && (
                <span
                  className="text-[9px] md:text-[10px] uppercase tracking-widest px-2 py-1 text-paper shrink-0"
                  style={{ backgroundColor: statusColor }}
                >
                  {event.event_status}
                </span>
              )}
            </div>

            {event.categoryName && (
              <p className="text-xs md:text-sm text-ink/70 mt-2 md:mt-3">
                {event.categoryName}
              </p>
            )}

            {/* ── Invite code + QR ─────────────────────── */}
            {inviteCode && (
              <div className="mt-4 md:mt-5 hairline bg-ink text-paper">
                <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 md:gap-5 items-center">
                  <div className="min-w-0">
                    <p className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-70">
                      Invitation code
                    </p>
                    <p className="font-mono text-2xl md:text-4xl tracking-[0.12em] mt-1.5 md:mt-2 break-all">
                      {inviteCode}
                    </p>
                    <div className="flex gap-2 mt-3 md:mt-4">
                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(String(inviteCode))
                        }
                        className="px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest border border-paper/40 hover:bg-paper hover:text-ink"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          const payload = String(inviteCode);
                          navigator
                            .share?.({ text: payload, title: "Invitation code" })
                            .catch(() => {});
                        }}
                        className="hidden sm:inline-block px-3 py-1.5 text-xs uppercase tracking-widest border border-paper/40 hover:bg-paper hover:text-ink"
                      >
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="bg-paper p-2 md:p-3 justify-self-start sm:justify-self-end">
                    <QRCodeSVG
                      value={String(inviteCode)}
                      size={104}
                      bgColor="#fbf7ef"
                      fgColor="#0e0e10"
                      level="M"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── About ───────────────────────────────── */}
            {(event.about || event.description) && (
              <div className="mt-4 md:mt-6">
                <p className="num mb-1">About</p>
                <p className="text-xs md:text-sm leading-relaxed whitespace-pre-line">
                  {event.description || event.about}
                </p>
              </div>
            )}

            {/* ── Detail panels ───────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mt-4 md:mt-6">
              <Panel title="Schedule">
                <Row label="Starts" value={start} />
                <Row label="Ends" value={end} />
                <Row label="Created" value={created} />
              </Panel>

              <Panel title="Location">
                <Row label="Place" value={event.eventLocation} />
                <Row label="Address" value={event.address} />
                {event.locationMap && (
                  <a
                    href={event.locationMap}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-[11px] md:text-xs text-ember hover:underline"
                  >
                    Open in Google Maps ↗
                  </a>
                )}
              </Panel>

              <Panel title="Participants">
                <Row label="Volunteers" value={event.total_volunteer} />
                <Row label="Hours logged" value={event.total_hours} />
                <Row label="Locations" value={event.locationCount} />
              </Panel>

              <Panel title="Organizer">
                <Row label="Faculty" value={event.creatorName} />
                <Row label="Email" value={event.facultyEmail} />
                <Row label="Contact" value={event.contactDetail} />
                <Row label="College" value={event.collegeName} />
              </Panel>
            </div>

            {/* ── Identifiers ─────────────────────────── */}
            <div className="mt-3 md:mt-6">
              <Panel title="Identifiers">
                <Row label="Record ID (invite)" value={event.id} />
                <Row
                  label="Event ID"
                  value={event.eventID || event.challengeID}
                />
                <Row label="API ID" value={event.api_eventID} />
                <Row label="Challenge ID" value={event.challengeID} />
                <Row label="Master league" value={event.masterLeague} />
                <Row label="Category ID" value={event.id_category} />
              </Panel>
            </div>

            {/* ── Footer ──────────────────────────────── */}
            <div className="mt-4 md:mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 md:px-5 py-2 text-[10px] md:text-sm uppercase tracking-widest border border-ink hover:bg-ink hover:text-paper"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── small building blocks ─────────────────────────────────── */
function Panel({ title, children }) {
  return (
    <div className="hairline bg-paper p-3 md:p-5">
      <p className="num mb-1.5 md:mb-2">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-2 md:gap-4 py-1 md:py-1.5 border-b border-ink/10 last:border-0">
      <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-ink/50 shrink-0">
        {label}
      </span>
      <span className="text-right text-[11px] md:text-sm break-all">
        {String(value)}
      </span>
    </div>
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