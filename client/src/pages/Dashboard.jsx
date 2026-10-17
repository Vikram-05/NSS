import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { loadImpersonation, clearImpersonation } from "../api/impersonate.js";
import { getEvents, getGlobalCategories } from "../api/events.js";
import EventCard from "../components/EventCard.jsx";
import EventModal from "../components/EventModal.jsx";
import CreateEventPanel from "../components/CreateEventPanel.jsx";
import Pagination from "../components/Pagination.jsx";
import DashboardSkeleton from "../components/DashboardSkeleton.jsx";
import Loader from "../components/Loader.jsx";

const PAGE_SIZE = 10;

export default function Dashboard() {
  const navigate = useNavigate();
  const { state: navState } = useLocation();

  const [session, setSession] = useState(loadImpersonation());

  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [categories, setCategories] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);
  const [openEvent, setOpenEvent] = useState(null);

  const collegeId = session?.user?.id_college;

  // Auto-open create panel when coming from the Header CTA
  useEffect(() => {
    if (navState?.focus === "create-nss") setShowCreate(true);
  }, [navState]);

  // Redirect if not signed in
  useEffect(() => {
    if (!session) navigate("/", { replace: true });
  }, [session, navigate]);

  // Load categories once
  useEffect(() => {
    getGlobalCategories()
      .then((r) => setCategories(r?.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  // Load events whenever page / session / refreshKey changes
  useEffect(() => {
    if (!session) return;
    setLoading(true);

    const u = session.user;
    getEvents({
      page,
      length: PAGE_SIZE,
      search: "",
      from_date: "",
      to_date: "",
      id_university: u.id_university,
      id_college: u.id_college,
      eventType: "current,upcoming",
      eventID: "",
      id_category: "",
      id_department: u.id_department,
      id_role: String(u.id_role ?? 5),
      is_active: "1",
    })
      .then((r) => {
        setEvents(r?.data ?? []);
        setTotal(r?.total_records ?? 0);
      })
      .catch(() => {
        setEvents([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [session, page, refreshKey]);

  // Aggregate stats from the current page
  const stats = useMemo(() => {
    const totalVolunteers = events.reduce(
      (s, e) => s + (Number(e.total_volunteer) || 0),
      0
    );
    const current = events.filter((e) => e.event_status === "Current").length;
    const upcoming = events.filter((e) => e.event_status === "Upcoming").length;
    return { totalVolunteers, current, upcoming };
  }, [events]);

  if (!session) return null;
  const u = session.user;

  // Skeleton on the very first fetch
  if (loading && events.length === 0) {
    return <DashboardSkeleton />;
  }

  function logout() {
    clearImpersonation();
    setSession(null);
    navigate("/", { replace: true });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen">
      {/* ── Impersonation banner ─────────────────────────────── */}
      <div className="bg-ember text-paper">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-2 flex items-center justify-between text-xs font-mono tracking-widest uppercase">
          <span>
            ⚠️ Impersonating {u.first_name} {u.last_name} ({u.email})
          </span>
          <button onClick={logout} className="underline hover:no-underline">
            Log out
          </button>
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-4">
        <p className="num">Dashboard</p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-5xl leading-[0.95] mt-2">
              Welcome, <em className="text-ember">{u.first_name}</em>
            </h1>
            <p className="mt-3 text-ink/60">
              {u.role_name} · {u.department_name} · {u.college_name}
            </p>
          </div>
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="btn border-ember text-ember hover:bg-ember hover:text-paper"
          >
            {showCreate ? "Close" : "+ Create event"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total events" value={total} />
          <Stat label="Current" value={stats.current} />
          <Stat label="Upcoming" value={stats.upcoming} />
          <Stat label="Volunteers (pg)" value={stats.totalVolunteers} />
        </div>

        {/* ── Last created card with invite code + QR ───────── */}
        {lastCreated && (
          <div className="mt-6 hairline bg-ink text-paper p-5">
            <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-70">
                  Last created · Invitation code
                </p>
                <p className="font-mono text-3xl tracking-[0.15em] mt-2 break-all">
                  {lastCreated.inviteCode || lastCreated.eventID || "—"}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs opacity-80 font-mono">
                  <span>Event&nbsp;{lastCreated.eventID}</span>
                  <span>API&nbsp;{lastCreated.api_eventID}</span>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        String(lastCreated.inviteCode || "")
                      )
                    }
                    className="px-3 py-1.5 text-xs uppercase tracking-widest border border-paper/40 hover:bg-paper hover:text-ink"
                  >
                    Copy code
                  </button>
                  <button
                    onClick={() =>
                      setOpenEvent({
                        eventTitle: `Event ${lastCreated.eventID}`,
                        eventID: lastCreated.eventID,
                        api_eventID: lastCreated.api_eventID,
                        inviteCode: lastCreated.inviteCode,
                        event_status: "New",
                        status_color: "#c2452d",
                      })
                    }
                    className="px-3 py-1.5 text-xs uppercase tracking-widest border border-paper/40 hover:bg-paper hover:text-ink"
                  >
                    View details
                  </button>
                </div>
              </div>
              {lastCreated.inviteCode && (
                <div className="bg-paper p-3 justify-self-start md:justify-self-end">
                  <QRCodeSVG
                    value={String(lastCreated.inviteCode)}
                    size={116}
                    bgColor="#fbf7ef"
                    fgColor="#0e0e10"
                    level="M"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Create event panel ───────────────────────────── */}
        {showCreate && (
          <CreateEventPanel
            session={session}
            collegeId={collegeId}
            categories={categories}
            onCreated={(res) => {
              setShowCreate(false);
              setLastCreated(res);
              setPage(1);
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {/* ── Events list ──────────────────────────────────── */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="num">Events</p>
              <h2 className="font-display text-3xl mt-1">My college</h2>
            </div>
            <p className="num flex items-center gap-2">
              {loading && (
                <span className="inline-block w-2 h-2 rounded-full bg-ember animate-pulse" />
              )}
              {total} total
            </p>
          </div>
          <hr className="my-6 rule" />

          {events.length === 0 ? (
            <div className="hairline bg-cream p-10 text-center">
              <p className="font-display text-2xl">No events yet</p>
              <p className="text-sm text-ink/60 mt-2">
                Create your first event using the button above.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} onOpen={setOpenEvent} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                length={PAGE_SIZE}
                onPage={setPage}
                onLength={() => {}}
              />
            </>
          )}
        </section>
      </main>

      {/* ── Event detail modal ──────────────────────────────── */}
      {openEvent && (
        <EventModal event={openEvent} onClose={() => setOpenEvent(null)} />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="hairline bg-cream p-5">
      <p className="num">{label}</p>
      <p className="font-display text-4xl mt-1">
        {String(value).padStart(2, "0")}
      </p>
    </div>
  );
}