import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { loadImpersonation, clearImpersonation } from "../api/impersonate.js";
import { getEvents, getGlobalCategories } from "../api/events.js";
import EventCard from "../components/EventCard.jsx";
import EventModal from "../components/EventModal.jsx";
import CreateEventPanel from "../components/CreateEventPanel.jsx";
import Pagination from "../components/Pagination.jsx";
import DashboardSkeleton from "../components/DashboardSkeleton.jsx";

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

  // Load events
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
    <div className="min-h-screen pb-20">
      {/* Warning banner */}
      <div className="bg-ember text-paper">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-2 flex items-center justify-between text-[10px] md:text-xs font-mono tracking-widest uppercase">
          <span className="truncate pr-4">⚠️ Impersonating {u.first_name} {u.last_name}</span>
          <button onClick={logout} className="underline hover:no-underline shrink-0">
            Log out
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 md:px-10 pt-6 md:pt-10 pb-2">
        <p className="num">Dashboard</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
          <div>
            <h1 className="font-display text-3xl md:text-5xl leading-[0.95]">
              Welcome, <em className="text-ember">{u.first_name}</em>
            </h1>
            <p className="mt-2 text-sm md:text-base text-ink/60">
              {u.role_name} · {u.department_name}
            </p>
          </div>
          <button
            onClick={() => setShowCreate((s) => !s)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors shrink-0 ${
              showCreate 
                ? "bg-ink text-paper border-ink" 
                : "border-ember text-ember hover:bg-ember hover:text-paper"
            }`}
          >
            {showCreate ? "Close Form" : "+ Create event"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-10 py-4 md:py-6">

        {/* Animated Create Panel */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", overflow: "visible" }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <div className="pt-6">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Stat label="Total" value={total} />
          <Stat label="Current" value={stats.current} />
          <Stat label="Upcoming" value={stats.upcoming} />
          <Stat label="Volunteers" value={stats.totalVolunteers} />
        </div>

        

        {/* Last Created Card */}
        {lastCreated && (
          <div className="mt-6 hairline bg-ink text-paper p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-70">
                  Last created · Invitation code
                </p>
                <p className="font-mono text-2xl md:text-3xl tracking-[0.15em] mt-1">
                  {lastCreated.inviteCode || lastCreated.eventID || "—"}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-mono opacity-80">
                  <span>Event {lastCreated.eventID}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard?.writeText(String(lastCreated.inviteCode || ""))}
                  className="px-3 py-1.5 text-xs uppercase tracking-widest border border-paper/40 hover:bg-paper hover:text-ink"
                >
                  Copy Code
                </button>
                {lastCreated.inviteCode && (
                  <div className="bg-paper p-1.5 hidden sm:block">
                    <QRCodeSVG value={String(lastCreated.inviteCode)} size={60} bgColor="#fbf7ef" fgColor="#0e0e10" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="num">Events</p>
              <h2 className="font-display text-2xl md:text-3xl">My college</h2>
            </div>
            <p className="num flex items-center gap-2">
              {loading && <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />}
              {total} total
            </p>
          </div>
          <hr className="mb-6 rule" />

          {events.length === 0 ? (
            <div className="hairline bg-cream p-8 text-center">
              <p className="font-display text-xl">No events yet</p>
              <p className="text-sm text-ink/60 mt-1">Create your first event above.</p>
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

      {/* Event Detail Modal */}
      {openEvent && (
        <EventModal event={openEvent} onClose={() => setOpenEvent(null)} />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="hairline bg-cream p-3 md:p-5 flex flex-col justify-center">
      <p className="text-[9px] md:text-[11px] font-mono tracking-widest uppercase text-ink/50 mb-1 truncate">
        {label}
      </p>
      <p className="font-display text-2xl md:text-4xl leading-none">
        {String(value).padStart(2, "0")}
      </p>
    </div>
  );
}