import { useNavigate } from "react-router-dom";

export default function DetailShell({ kicker, title, subtitle, initials, children, aside }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 md:px-10 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink text-paper font-mono text-[11px] tracking-widest uppercase hover:bg-ember transition-colors"
        >
          <span aria-hidden>←</span> Back
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-8 grid md:grid-cols-[1fr_320px] gap-10">
        <section>
          <p className="num">{kicker}</p>
          <div className="flex items-start gap-5 mt-3">
            <div className="w-16 h-16 rounded-full bg-ink text-paper grid place-items-center font-display text-2xl shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl leading-[1.02]">{title}</h1>
              {subtitle && <p className="text-ink/60 mt-2">{subtitle}</p>}
            </div>
          </div>
          <hr className="my-8 rule" />
          {children}
        </section>

        <aside className="md:sticky md:top-6 h-fit">
          <div className="hairline bg-cream shadow-grain p-5">
            <p className="num mb-3">Record</p>
            {aside}
          </div>
        </aside>
      </main>
    </div>
  );
}