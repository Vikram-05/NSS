import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { impersonateFaculty } from "../api/impersonate.js";

const IMPERSONATION_ALLOWED =
  import.meta.env.VITE_ALLOW_IMPERSONATION === "true";

export default function FacultyCard({ person, index }) {
  const navigate = useNavigate();
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const initials = `${person.first_name?.[0] ?? ""}${person.last_name?.[0] ?? ""}`
    .replace(/\s+/g, "")
    .toUpperCase();

  const roleStyles =
    person.role_code === "hod"
      ? { bg: "bg-ember text-paper", hover: "hover:bg-ember/90" }
      : person.role_code === "dept-coordinator"
      ? { bg: "bg-moss text-paper", hover: "hover:bg-moss/90" }
      : { bg: "bg-sand text-ink", hover: "hover:bg-sand/80" };

  function openDetail(e) {
    e.stopPropagation();
    sessionStorage.setItem(
      "person:" + person.id_adminuser,
      JSON.stringify(person)
    );
    navigate(`/person/${person.id_adminuser}`, { state: { person } });
  }

  async function loginAs(e) {
    e.stopPropagation();
    if (!IMPERSONATION_ALLOWED) {
      openDetail(e);
      return;
    }
    setLoggingIn(true);
    setLoginError(null);
    const result = await impersonateFaculty(person);
    if (!result.ok) {
      setLoggingIn(false);
      setLoginError(result.reason || "Login failed.");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <article
      onClick={openDetail}
      className="hairline bg-cream hover:shadow-grain transition-shadow cursor-pointer relative overflow-hidden group min-w-0 flex flex-col"
    >
      {/* Row number */}
      <span className="absolute top-2 right-2.5 md:top-3 md:right-4 font-mono text-[9px] md:text-[10px] text-ink/25">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Identity block */}
      <div className="p-3 md:p-5 pb-2 md:pb-3 flex items-start gap-2.5 md:gap-4 min-w-0">
        <div className="w-9 h-9 md:w-12 md:h-12 shrink-0 rounded-full bg-ink text-paper grid place-items-center font-display text-[11px] md:text-lg">
          {initials || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="font-display text-[13px] md:text-xl leading-snug truncate"
            title={`${person.first_name} ${person.last_name}`}
          >
            {person.first_name} {person.last_name}
          </h3>
          <p className="num mt-0.5 md:mt-1 truncate text-[9px] md:text-[11px]">
            {person.email}
          </p>
        </div>
      </div>

      {/* Role tag */}
      <div className="px-3 md:px-5 pb-2">
        <span
          className={`inline-block px-1.5 py-0.5 text-[8px] md:text-[10px] uppercase tracking-widest ${roleStyles.bg}`}
        >
          {person.role_name}
        </span>
      </div>

      {/* Department */}
      <p className="px-3 md:px-5 text-[10px] md:text-xs text-ink/55 leading-snug line-clamp-2">
        {person.department_name}
      </p>

      {/* Phone row */}
      <div className="px-3 md:px-5 py-2 md:py-3 mt-auto flex items-center gap-1.5 text-[10px] md:text-xs">
        <span className="font-mono text-ink/40 uppercase tracking-widest text-[8px] md:text-[10px]">
          Mob
        </span>
        <a
          href={`tel:${person.mobile}`}
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-ink/70 hover:text-ember truncate"
        >
          {person.mobile}
        </a>
      </div>

      {/* Error */}
      {loginError && (
        <p className="px-3 md:px-5 pb-2 text-[9px] md:text-xs text-ember leading-snug">
          {loginError}
        </p>
      )}

      {/* Login button */}
      <button
        onClick={loginAs}
        disabled={loggingIn}
        className={`w-full px-3 py-2 md:py-2.5 text-[9px] md:text-[11px] uppercase tracking-widest text-center transition-colors disabled:opacity-60 border-t border-ink/10 bg-transparent text-ink/70 hover:text-paper ${roleStyles.hover} hover:text-paper`}
        title={`Log in as ${person.first_name} ${person.last_name} (${person.role_name})`}
      >
        {loggingIn ? "Signing in…" : `Login as ${person.role_name}`}
      </button>
    </article>
  );
}