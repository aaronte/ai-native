"use client";

import { useMemo, useState } from "react";

import { MIN_FIRST_MESSAGE_CHARS } from "@/lib/coach/constants";

import { InstallQR } from "./InstallQR";

type Phase = "form" | "qr";

export function TakeInFlow() {
  const [phase, setPhase] = useState<Phase>("form");
  const [nameAndTitle, setNameAndTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [authorizeUrl, setAuthorizeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const situationCount = situation.trim().length;
  const situationOk = situationCount >= MIN_FIRST_MESSAGE_CHARS;
  const situationRemaining = Math.max(0, MIN_FIRST_MESSAGE_CHARS - situationCount);

  const canSubmit = useMemo(() => situationOk && !pending, [situationOk, pending]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAndTitle: nameAndTitle.trim() || undefined,
          situation: situation.trim(),
        }),
      });
      const data = (await res.json()) as { authorizeUrl?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong saving your intake.");
        return;
      }
      if (!data.authorizeUrl) {
        setError("Missing install link from server.");
        return;
      }
      setAuthorizeUrl(data.authorizeUrl);
      setPhase("qr");
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  if (phase === "qr" && authorizeUrl) {
    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-950/25 px-4 py-3 text-center text-sm text-emerald-100/90">
          Your context is saved. Scan the code (or tap the link) to{" "}
          <strong className="text-emerald-50">install the coach on your Discord account</strong>
          {" "}and open a DM with the bot to continue.
        </div>
        <InstallQR installUrl={authorizeUrl} />
        <button
          type="button"
          onClick={() => {
            setPhase("form");
            setAuthorizeUrl(null);
          }}
          className="text-center font-mono text-xs uppercase tracking-[0.22em] text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
        >
          Edit intake and regenerate QR
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-full min-h-0 w-full max-w-md flex-col gap-5 rounded-xl border border-white/20 bg-white/[0.02] p-6 text-left text-sm text-slate-200 shadow-none backdrop-blur-sm"
    >
      <div className="shrink-0 space-y-1.5">
        <label htmlFor="name-job-title" className="block font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Name, job title <span className="font-normal text-slate-600">(optional)</span>
        </label>
        <input
          id="name-job-title"
          name="nameAndTitle"
          value={nameAndTitle}
          onChange={(e) => setNameAndTitle(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-slate-100 outline-none ring-cyan-300/20 backdrop-blur-[2px] placeholder:text-slate-400 focus:border-cyan-300/55 focus:ring-2"
          placeholder="Jane Doe, VP Engineering"
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <label htmlFor="situation" className="shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
          What&apos;s going on?
        </label>
        <textarea
          id="situation"
          name="situation"
          required
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          className="min-h-[6rem] w-full flex-1 resize-y rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-slate-100 outline-none ring-cyan-300/20 backdrop-blur-[2px] placeholder:text-slate-400 focus:border-cyan-300/55 focus:ring-2"
          placeholder="Describe the challenge, constraints, and what you want to get unstuck on (product, engineering, or design). When you continue, your AI coach keeps helping you where work already happens; for this demo, that's Discord."
        />
      </div>

      {error ? (
        <p className="shrink-0 rounded-lg border border-red-400/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-auto inline-flex shrink-0 items-center justify-center rounded-lg bg-indigo-200 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-950 transition-[box-shadow,background-color] duration-300 hover:bg-white enabled:shadow-[0_0_28px_-6px_rgba(165,180,252,0.85),0_0_56px_-16px_rgba(99,102,241,0.35)] enabled:hover:shadow-[0_0_36px_-4px_rgba(226,232,255,0.9),0_0_64px_-12px_rgba(129,140,248,0.45)] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
      >
        {pending
          ? "Saving..."
          : situationOk
            ? "Continue"
            : `Type ${situationRemaining} more character${situationRemaining === 1 ? "" : "s"}`}
      </button>
    </form>
  );
}
