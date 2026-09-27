"use client";

import { useState } from "react";
import { scrollToId, useApp } from "@/lib/store";
import { Arrow, Magnetic } from "./Chrome";

export default function Partner() {
  const { openOverlay } = useApp();
  const [form, setForm] = useState({ name: "", email: "", campus: "", role: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Your name?";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = "A valid email, please.";
    if (form.campus.trim().length < 2) next.campus = "Which campus?";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("loading");
    window.setTimeout(() => setState("done"), 950);
  };

  return (
    <section id="partner" className="relative px-5 pb-[12vh] pt-[6vh] sm:px-8 lg:px-[4vw]">
      <div className="mx-auto max-w-[1400px]">
        <div className="border-t border-line pt-6">
          <div className="flex items-center justify-between">
            <span className="micro">join</span>
            <span className="micro">Lead generation · no backend attached</span>
          </div>
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <h2 className="display text-[clamp(2.5rem,6.6vw,5.6rem)]">
              BRING CAMPUSKART
              <br />
              TO YOUR <span className="serif-accent text-blue">campus.</span>
            </h2>
            <p className="lede mt-6 max-w-[46ch]">
              Students, vendors or institutions — if your campus moves, we want to build its
              ecosystem with you. Tell us where you are and a human replies.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={(e) =>
                    openOverlay("register", { x: e.clientX, y: e.clientY })
                  }
                  data-cursor="cta"
                >
                  Register as a campus partner <Arrow />
                </button>
              </Magnetic>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={(e) => openOverlay("support", { x: e.clientX, y: e.clientY })}
                data-cursor="cta"
              >
                Talk to the team <Arrow />
              </button>
            </div>

            <ul className="mt-10 grid gap-px sm:grid-cols-3" style={{ background: "var(--border)" }}>
              {[
                ["Restaurants & cafés", "List menus, keep hours honest"],
                ["Stores & services", "Shelf, stock, campus hours"],
                ["Institutions", "A campus that runs on one map"],
              ].map(([t, d]) => (
                <li key={t} className="p-4" style={{ background: "var(--bg)" }}>
                  <p className="text-[14.5px] font-medium">{t}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{d}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* lead form */}
          <div className="panel p-6 sm:p-8">
            {state === "done" ? (
              <div style={{ animation: "ck-rise .5s cubic-bezier(.22,1,.36,1) both" }}>
                <p className="micro" style={{ color: "var(--blue-ink)" }}>Interaction complete</p>
                <h3 className="display mt-3 text-[1.8rem]">Thanks, {form.name.split(" ")[0]}.</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  In the live product this reaches the campus partnerships team for{" "}
                  <strong className="text-ink">{form.campus}</strong>. This landing page stores
                  nothing — nothing was sent.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost mt-6"
                  onClick={() => {
                    setState("idle");
                    setForm({ name: "", email: "", campus: "", role: "" });
                  }}
                >
                  Send another <Arrow />
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="micro">Partner enquiry</p>
                <div className="mt-5 space-y-5">
                  {(
                    [
                      ["name", "Your name", "text", "Ankan Sen"],
                      ["email", "Email", "text", "you@college.edu"],
                      ["campus", "Campus / city", "text", "Riyana Institute, Pune"],
                      ["role", "I am a… (optional)", "text", "Student · vendor · administrator"],
                    ] as const
                  ).map(([key, label, type, ph]) => (
                    <label key={key} className="block">
                      <span className="micro">{label}</span>
                      <input
                        className="field mt-1"
                        type={type}
                        placeholder={ph}
                        value={form[key]}
                        data-invalid={errors[key] ? "true" : "false"}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      />
                      {errors[key] && <span className="mt-1 block text-[12px] text-food">{errors[key]}</span>}
                    </label>
                  ))}
                </div>

                <button type="submit" className="btn btn-solid mt-7 w-full justify-center" data-cursor="cta">
                  {state === "loading" ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      Sending…
                    </span>
                  ) : (
                    <>
                      Start the conversation <Arrow />
                    </>
                  )}
                </button>
                <p className="micro mt-4 text-center">
                  Partner form · validated
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14">
          <button
            type="button"
            className="group flex w-full items-center justify-between border-y border-line py-6 text-left"
            onClick={() => scrollToId("map")}
            data-cursor="link"
          >
            <span className="display text-[clamp(1.8rem,5vw,4rem)] transition-transform duration-500 group-hover:translate-x-3">
              SEE THE CAMPUS MAP AGAIN
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-full border border-line transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-bg">
              <Arrow />
            </span>
          </button>
        </div>
      </div>

      <style>{`@keyframes ck-rise { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }`}</style>
    </section>
  );
}
