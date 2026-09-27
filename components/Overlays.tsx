"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CAMPUSES,
  LEGAL_DOCS,
  SEARCH_SUGGESTIONS,
  SERVICE_META,
  type ServiceId,
} from "@/lib/data";
import { scrollToId, useApp } from "@/lib/store";
import { Arrow, Mark, Wordmark } from "./Chrome";

/* --------------------------------------------------------------- shell */

function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      className="absolute inset-0 w-full"
      style={{
        background: "color-mix(in srgb, var(--bg) 62%, transparent)",
        backdropFilter: "blur(6px)",
        animation: "ck-fade .4s ease both",
      }}
    />
  );
}

function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, onClose]);
}

const keyframes = `
@keyframes ck-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes ck-pop { from { opacity: 0; transform: scale(.9) translateY(14px) } to { opacity: 1; transform: none } }
@keyframes ck-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
@keyframes ck-drawer { from { transform: translateX(100%) } to { transform: none } }
@keyframes ck-field { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
`;

/* --------------------------------------------------------------- search */

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { setService, openOverlay } = useApp();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement | null>(null);
  useEscape(true, onClose);

  useEffect(() => {
    const t = window.setTimeout(() => input.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, []);

  const results = useMemo(() => {
    const list = SEARCH_SUGGESTIONS.map((s) => ({ ...s }));
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((s) => s.text.toLowerCase().includes(needle));
  }, [q]);

  const run = (target: string, service: ServiceId) => {
    setService(service);
    onClose();
    window.setTimeout(() => scrollToId(target === "how" ? "how" : target), 260);
  };

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="Search">
      <style>{keyframes}</style>
      <Backdrop onClose={onClose} />
      <div className="relative mx-auto flex min-h-full w-full max-w-[880px] flex-col px-5 pt-24 sm:pt-32">
        <div className="flex items-center gap-4 border-b border-line pb-4" style={{ animation: "ck-rise .5s cubic-bezier(.22,1,.36,1) both" }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="var(--muted)" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) run(results[0].target, results[0].service);
            }}
            placeholder="Search the campus — food, rides, essentials"
            aria-label="Search CampusKart"
            className="w-full bg-transparent text-[clamp(1.3rem,3vw,2rem)] font-medium tracking-[-0.03em] outline-none placeholder:text-muted"
          />
          <button type="button" onClick={onClose} className="micro" aria-label="Close search">
            esc
          </button>
        </div>

        <p className="micro mt-6">Suggestions · campus index</p>
        <ul className="mt-3 flex flex-col">
          {results.map((s, i) => (
            <li key={s.text} style={{ animation: `ck-rise .5s ${0.06 + i * 0.05}s cubic-bezier(.22,1,.36,1) both` }}>
              <button
                type="button"
                onClick={() => run(s.target, s.service)}
                className="group flex w-full items-center justify-between border-b border-line py-4 text-left transition-colors hover:text-blue"
                data-cursor="link"
              >
                <span className="text-[clamp(1.05rem,2.2vw,1.5rem)] tracking-[-0.02em]">{s.text}</span>
                <span className="flex items-center gap-3">
                  <span className="micro" style={{ color: SERVICE_META[s.service].ink }}>
                    {SERVICE_META[s.service].label}
                  </span>
                  <Arrow />
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="py-6 text-sm text-muted">
              Nothing matches “{q}”. Try “charger”, “cab” or “partner”.
            </li>
          )}
        </ul>

        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 py-8">
          <span className="micro">Try</span>
          {["Food near hostel", "Cab to gate", "Need a charger"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQ(t)}
              className="text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            className="ml-auto text-sm text-muted underline decoration-line underline-offset-4 hover:text-ink"
            onClick={() => {
              onClose();
              window.setTimeout(() => openOverlay("support"), 240);
            }}
          >
            Talk to support
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- auth */

type AuthProps = { mode: "login" | "register"; onClose: () => void };

function AuthModal({ mode, onClose }: AuthProps) {
  const { origin, campus, setCampus, openOverlay } = useApp();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [values, setValues] = useState({
    name: "",
    contact: "",
    password: "",
    campus,
    verify: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEscape(true, onClose);

  const isRegister = mode === "register";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (isRegister && values.name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!/^(\+?\d[\d\s-]{7,}|[^@\s]+@[^@\s]+\.[^@\s]+)$/.test(values.contact.trim()))
      next.contact = "Enter a valid email or phone number.";
    if (values.password.length < 6) next.password = "At least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("loading");
    window.setTimeout(() => {
      setState("done");
      if (isRegister) setCampus(values.campus);
    }, 900);
  };

  const field = (
    key: "name" | "contact" | "password",
    label: string,
    type: string,
    placeholder: string,
    delay: number,
  ) => (
    <label className="block" style={{ animation: `ck-field .5s ${delay}s cubic-bezier(.22,1,.36,1) both` }}>
      <span className="micro">{label}</span>
      <input
        className="field mt-1"
        type={type}
        value={values[key]}
        data-invalid={errors[key] ? "true" : "false"}
        placeholder={placeholder}
        autoComplete={key === "password" ? "current-password" : "on"}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
      />
      {errors[key] && <span className="mt-1 block text-[12px] text-food">{errors[key]}</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={isRegister ? "Create account" : "Login"}>
      <style>{keyframes}</style>
      <Backdrop onClose={onClose} />
      <div
        className="overlay-sheet relative grid w-full max-w-[900px] overflow-hidden md:grid-cols-[1.05fr_1fr]"
        style={{
          transformOrigin: `${origin.x}px ${origin.y}px`,
          animation: "ck-pop .55s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        <div className="relative hidden flex-col justify-between p-8 md:flex" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-center gap-2.5">
            <Mark size={26} />
            <Wordmark />
          </div>
          <div>
            <p className="display text-[2.1rem] leading-[0.95]">
              {isRegister ? (
                <>
                  Join the
                  <br />
                  campus that
                  <br />
                  <span className="serif-accent text-blue">moves together.</span>
                </>
              ) : (
                <>
                  Welcome
                  <br />
                  back to
                  <br />
                  <span className="serif-accent text-blue">your campus.</span>
                </>
              )}
            </p>
            <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-muted">
              Food. Rides. Essentials. One account across every corner of campus life.
            </p>
          </div>
          <p className="micro">Campus account interface</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="micro">{isRegister ? "New here" : "Returning"}</p>
              <h2 className="mt-1 text-[1.5rem] font-semibold tracking-[-0.03em]">
                {isRegister ? "Create your account" : "Login"}
              </h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="micro">
              esc
            </button>
          </div>

          {state === "done" ? (
            <div className="mt-8" style={{ animation: "ck-rise .5s cubic-bezier(.22,1,.36,1) both" }}>
              <div className="hairline p-5">
                <p className="text-[15px] font-medium">Request complete.</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {isRegister
                    ? `Your campus: ${CAMPUSES.find((c) => c.id === values.campus)?.name}. In the live product this creates an account and starts student verification.`
                    : "In the live product this opens your campus feed with active food, ride and essentials requests."}
                </p>
              </div>
              <div className="mt-5 flex gap-3">
                <button type="button" className="btn btn-ghost flex-1 justify-center" onClick={() => setState("idle")}>
                  Back
                </button>
                <button type="button" className="btn btn-solid flex-1 justify-center" onClick={onClose}>
                  Done <Arrow />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 flex flex-col gap-5" noValidate>
              {isRegister && field("name", "Name", "text", "Your name", 0.1)}
              {field("contact", "Email or phone", "text", "you@campus.edu", isRegister ? 0.16 : 0.1)}
              {isRegister && (
                <label className="block" style={{ animation: "ck-field .5s .22s cubic-bezier(.22,1,.36,1) both" }}>
                  <span className="micro">Campus</span>
                  <select
                    className="field mt-1 appearance-none"
                    value={values.campus}
                    onChange={(e) => setValues({ ...values, campus: e.target.value })}
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.city}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {field("password", "Password", "password", "••••••••", isRegister ? 0.28 : 0.16)}

              {isRegister && (
                <label className="flex items-start gap-3 text-[13px] text-muted" style={{ animation: "ck-field .5s .34s cubic-bezier(.22,1,.36,1) both" }}>
                  <input
                    type="checkbox"
                    checked={values.verify}
                    onChange={(e) => setValues({ ...values, verify: e.target.checked })}
                    className="mt-0.5 accent-[var(--blue)]"
                  />
                  <span>Send me a student verification link after signup (optional).</span>
                </label>
              )}

              <div className="mt-1 flex items-center justify-between">
                {!isRegister && (
                  <button
                    type="button"
                    className="text-[13px] text-muted underline decoration-line underline-offset-4 hover:text-ink"
                    onClick={() => setState("done")}
                  >
                    Forgot password?
                  </button>
                )}
                {isRegister && <span className="micro">Min. 6 characters</span>}
              </div>

              <button type="submit" className="btn btn-solid justify-center" disabled={state === "loading"} data-cursor="cta">
                {state === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                    Checking campus…
                  </span>
                ) : (
                  <>
                    {isRegister ? "Create account" : "Continue"} <Arrow />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1" style={{ background: "var(--border)" }} />
                <span className="micro">or</span>
                <span className="h-px flex-1" style={{ background: "var(--border)" }} />
              </div>

              <button type="button" className="btn btn-ghost justify-center" onClick={() => setState("done")}>
                <svg width="15" height="15" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.3-.2-1.9H9v3.6h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z" />
                  <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3Z" />
                  <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-[13px] text-muted">
                {isRegister ? "Already have an account?" : "New on this campus?"}{" "}
                <button
                  type="button"
                  className="text-ink underline decoration-line underline-offset-4"
                  onClick={(e) =>
                    openOverlay(isRegister ? "login" : "register", { x: e.clientX, y: e.clientY })
                  }
                >
                  {isRegister ? "Login" : "Create one"}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- support */

const SUPPORT_TOPICS = [
  { id: "order", label: "Order issue", note: "Missing item, late order, wrong pouch" },
  { id: "ride", label: "Ride issue", note: "No-show, route, pickup point" },
  { id: "payment", label: "Payment issue", note: "Failed capture, refund status" },
  { id: "partner", label: "Partner support", note: "Storefront, listings, payouts" },
  { id: "general", label: "General help", note: "Accounts, campus access, feedback" },
];

function SupportDrawer({ onClose }: { onClose: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEscape(true, onClose);

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="Support">
      <style>{keyframes}</style>
      <Backdrop onClose={onClose} />
      <aside
        className="overlay-sheet absolute bottom-0 right-0 top-0 flex w-full max-w-[430px] flex-col"
        style={{ animation: "ck-drawer .6s cubic-bezier(.76,0,.24,1) both" }}
      >
        <div className="flex items-start justify-between border-b border-line p-6">
          <div>
            <p className="micro">Support · campus desk</p>
            <h2 className="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em]">How can we help?</h2>
          </div>
          <button type="button" onClick={onClose} className="micro" aria-label="Close support">
            esc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!picked ? (
            <ul className="flex flex-col gap-2">
              {SUPPORT_TOPICS.map((t, i) => (
                <li key={t.id} style={{ animation: `ck-rise .5s ${0.1 + i * 0.06}s cubic-bezier(.22,1,.36,1) both` }}>
                  <button
                    type="button"
                    onClick={() => setPicked(t.id)}
                    className="group flex w-full items-center justify-between border border-line p-4 text-left transition-all duration-300 hover:-translate-y-[2px] hover:border-ink"
                    data-cursor="link"
                  >
                    <span>
                      <span className="block text-[15px] font-medium">{t.label}</span>
                      <span className="mt-0.5 block text-[13px] text-muted">{t.note}</span>
                    </span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-line transition-colors group-hover:border-ink">
                      <Arrow />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ animation: "ck-rise .5s cubic-bezier(.22,1,.36,1) both" }}>
              <button type="button" className="micro mb-4" onClick={() => setPicked(null)}>
                ← all topics
              </button>
              <div className="hairline p-4">
                <p className="text-[15px] font-medium">
                  {SUPPORT_TOPICS.find((t) => t.id === picked)?.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  A human support agent for your campus will pick this up. Our support team is available 24/7.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {["Tell us what happened", "Add the campus, time and request ID"].map((s, i) => (
                  <div key={s} className="flex gap-3">
                    <span className="micro mt-1">0{i + 1}</span>
                    <p className="text-sm text-muted">{s}</p>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-solid mt-6 w-full justify-center" onClick={onClose}>
                Request submitted <Arrow />
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-line p-6">
          <p className="micro">Avg. first response · campus hours</p>
          <p className="mt-1 text-sm text-muted">Real response times are shown inside the product.</p>
        </div>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- legal */

function LegalSheet({ onClose }: { onClose: () => void }) {
  const { legalDoc } = useApp();
  useEscape(true, onClose);
  const doc = LEGAL_DOCS[legalDoc] ?? LEGAL_DOCS.privacy;

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto" role="dialog" aria-modal="true" aria-label={doc.title}>
      <style>{keyframes}</style>
      <Backdrop onClose={onClose} />
      <div
        className="overlay-sheet relative mx-auto my-6 w-full max-w-[760px] p-6 sm:p-10"
        style={{ animation: "ck-pop .5s cubic-bezier(.22,1,.36,1) both" }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="micro">Legal · placeholder copy</p>
            <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.03em]">
              {doc.title}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="micro" aria-label="Close">
            esc
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {doc.body.map((p, i) => (
            <p key={i} className={`text-[15px] leading-relaxed ${i === 0 ? "text-food" : "text-muted"}`}>
              {p}
            </p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {Object.entries(LEGAL_DOCS).map(([k, v]) => (
            <span
              key={k}
              className="micro"
              style={{ color: k === legalDoc ? "var(--blue-ink)" : undefined }}
            >
              {v.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- switch */

export default function Overlays() {
  const { overlay, closeOverlay } = useApp();
  return (
    <>
      {overlay === "search" && <SearchOverlay onClose={closeOverlay} />}
      {overlay === "login" && <AuthModal mode="login" onClose={closeOverlay} />}
      {overlay === "register" && <AuthModal mode="register" onClose={closeOverlay} />}
      {overlay === "support" && <SupportDrawer onClose={closeOverlay} />}
      {overlay === "legal" && <LegalSheet onClose={closeOverlay} />}
    </>
  );
}
