import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-6">
      <div className="w-full max-w-[900px]">
        <p className="micro">404 · route unresolved</p>

        <svg viewBox="0 0 900 260" className="mt-6 h-[26vh] w-full" role="img" aria-label="A route that never reaches its destination">
          <defs>
            <pattern id="nf-tick" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 0 H40 M0 0 V40" fill="none" stroke="var(--scene-line)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="900" height="260" fill="url(#nf-tick)" opacity="0.7" />
          <path
            d="M40,200 C 220,200 260,80 440,80 C 560,80 600,150 660,150"
            fill="none"
            stroke="var(--blue)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="8 10"
            style={{ animation: "dash-run 1.4s linear infinite" }}
          />
          <circle cx="40" cy="200" r="7" fill="var(--bg)" stroke="var(--blue)" strokeWidth="2" />
          <circle cx="40" cy="200" r="2.5" fill="var(--blue)" />
          <g>
            <circle cx="760" cy="150" r="14" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 6" />
            <text x="760" y="196" textAnchor="middle" fontSize="13" letterSpacing="2" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
              DESTINATION?
            </text>
          </g>
          <text x="40" y="234" fontSize="13" letterSpacing="2" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
            YOU
          </text>
        </svg>

        <h1 className="display mt-8 text-[clamp(2.4rem,7vw,5.4rem)]">
          THIS ROUTE
          <br />
          <span className="serif-accent text-blue">goes nowhere.</span>
        </h1>
        <p className="lede mt-5">
          The page you asked for isn&apos;t on this campus. Let&apos;s get you back to a place
          that moves.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-solid">
            Back to campus <span className="arrow">→</span>
          </Link>
          <Link href="/#map" className="btn btn-ghost">
            Open the map <span className="arrow">→</span>
          </Link>
        </div>
      </div>
      <style>{`@keyframes dash-run { to { stroke-dashoffset: -36 } }`}</style>
    </main>
  );
}
