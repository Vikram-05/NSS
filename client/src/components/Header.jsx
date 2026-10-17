import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header({ count, user }) {
  const navigate = useNavigate();
  const [openGuide, setOpenGuide] = useState(false);

  function goCreate() {
    navigate("/dashboard", {
      state: { focus: "create-nss", source: "header" },
    });
  }

  return (
    <header className="max-w-7xl mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-5 md:pb-6">
      {/* Issue line */}
      <p className="num">
        Vol. I · Issue {String(count || 0).padStart(3, "0")}
      </p>

      {/* Title + CTA row */}
      <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[2.6rem] leading-[0.95] sm:text-5xl md:text-7xl tracking-tight">
            Faculty <em className="text-ember">Ledger</em>
          </h1>
          <p className="mt-3 md:mt-4 max-w-xl text-sm md:text-base text-ink/70 leading-relaxed">
            A working index of engineering faculty across Visvesvaraya
            Technological University. Browse colleges, filter by department,
            and inspect the roster.
          </p>
        </div>

        {/* CTA — right-aligned on desktop, full-width-ish on mobile */}
        <div className="relative self-start md:self-auto shrink-0">
          <button
            onClick={() => setOpenGuide((o) => !o)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-ink text-paper text-[11px] md:text-xs uppercase tracking-widest hover:bg-ember transition-colors w-full md:w-auto justify-center md:justify-start"
            aria-expanded={openGuide}
          >
            <span aria-hidden>＋</span>
            Create NSS event
            <span className="font-mono text-[10px] opacity-70">
              {openGuide ? "▲" : "▼"}
            </span>
          </button>

          {openGuide && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setOpenGuide(false)}
                aria-hidden
              />
              <div
                role="tooltip"
                className="absolute left-0 md:left-auto md:right-0 top-full mt-2 z-40 w-[calc(100vw-2.5rem)] max-w-sm md:w-80 hairline bg-cream shadow-grain p-4 text-left"
              >
                <p className="num mb-2">To create an event</p>
                <ol className="space-y-2 text-sm text-ink/80">
                  <Step n="01">
                    Choose your <strong>college</strong> from the rail
                  </Step>
                  <Step n="02">
                    Select your <strong>department</strong>
                  </Step>
                  <Step n="03">
                    Click <strong>Log in as</strong> on your own faculty card
                  </Step>
                  <Step n="04">
                    Your dashboard opens — use <strong>+ Create event</strong>{" "}
                    there
                  </Step>
                </ol>

                {user && (
                  <button
                    onClick={goCreate}
                    className="mt-3 w-full px-3 py-2 bg-ember text-paper text-[11px] uppercase tracking-widest hover:opacity-90"
                  >
                    Go to dashboard
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <hr className="mt-5 md:mt-8 rule" />
    </header>
  );
}

function Step({ n, children }) {
  return (
    <li className="flex gap-2">
      <span className="font-mono text-[10px] tracking-widest text-ember shrink-0 mt-0.5">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}