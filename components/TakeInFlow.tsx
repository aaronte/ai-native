"use client";

import { useMemo, useState } from "react";

import { MIN_FIRST_MESSAGE_CHARS } from "@/lib/coach/constants";

import { InstallQR } from "./InstallQR";

type Phase = "form" | "qr";

export function TakeInFlow() {
  const [phase, setPhase] = useState<Phase>("form");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [situation, setSituation] = useState("");
  const [authorizeUrl, setAuthorizeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const situationCount = situation.trim().length;
  const situationOk = situationCount >= MIN_FIRST_MESSAGE_CHARS;

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
          organization: organization.trim() || undefined,
          role: role.trim() || undefined,
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
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/25 px-4 py-3 text-center text-sm text-emerald-100/90">
          Your context is saved. Scan the code (or tap the link) to{" "}
          <strong className="text-emerald-50">install the coach on your Discord account</strong>
          — then open a DM with the bot to continue.
        </div>
        <InstallQR installUrl={authorizeUrl} />
        <button
          type="button"
          onClick={() => {
            setPhase("form");
            setAuthorizeUrl(null);
          }}
          className="text-center text-sm text-zinc-500 underline-offset-4 hover:text-zinc-400 hover:underline"
        >
          Edit intake and regenerate QR
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-left text-sm text-zinc-300"
    >
      <div className="space-y-1.5">
        <label htmlFor="organization" className="block text-xs font-medium text-zinc-400">
          Organization <span className="font-normal text-zinc-600">(optional)</span>
        </label>
        <input
          id="organization"
          name="organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-emerald-500/40 placeholder:text-zinc-600 focus:border-emerald-700 focus:ring-2"
          placeholder="Company or team name"
          autoComplete="organization"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="role" className="block text-xs font-medium text-zinc-400">
          Your role <span className="font-normal text-zinc-600">(optional)</span>
        </label>
        <input
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-emerald-500/40 placeholder:text-zinc-600 focus:border-emerald-700 focus:ring-2"
          placeholder="e.g. VP Engineering, Founder"
          autoComplete="organization-title"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="situation" className="block text-xs font-medium text-zinc-400">
          What&apos;s going on?
        </label>
        <textarea
          id="situation"
          name="situation"
          required
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-emerald-500/40 placeholder:text-zinc-600 focus:border-emerald-700 focus:ring-2"
          placeholder="Describe the challenge, constraints, and what you want to get unstuck on — product, engineering, or design."
        />
        <p className="text-xs text-zinc-500">
          {situationCount} / {MIN_FIRST_MESSAGE_CHARS}+ characters (minimum for a useful coaching thread)
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
      >
        {pending ? "Saving…" : "Continue — show install QR"}
      </button>
    </form>
  );
}
