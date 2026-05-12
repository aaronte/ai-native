"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MIN_FIRST_MESSAGE_CHARS } from "@/lib/coach/constants";

import { DiscordLinkedBanner } from "./DiscordLinkedBanner";
import { InstallQR } from "./InstallQR";

/** Stub URL for `?intakePreview=qr` — valid shape for QR rendering; not a real OAuth client. */
const PREVIEW_QR_INSTALL_URL =
  "https://discord.com/oauth2/authorize?client_id=000000000000000000&redirect_uri=https%3A%2F%2Flocalhost%2Fcallback&response_type=code&scope=identify";

type Phase = "form" | "qr";

export function TakeInFlow() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewQr = searchParams.get("intakePreview") === "qr";
  const discordOAuthOk = searchParams.get("discord_oauth") === "ok";

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
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey)) return;
      const form = formRef.current;
      if (!form || !form.contains(document.activeElement)) return;
      if (!situationOk || pending) return;
      e.preventDefault();
      form.requestSubmit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [situationOk, pending]);

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

  const installUrl = previewQr ? PREVIEW_QR_INSTALL_URL : authorizeUrl;
  const showQrStep = Boolean(installUrl && (previewQr || phase === "qr"));

  if (discordOAuthOk) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4">
        <DiscordLinkedBanner />
        <p className="text-center text-xs leading-relaxed text-slate-500">
          You can close this page and continue in Discord when you&apos;re ready.
        </p>
      </div>
    );
  }

  if (showQrStep && installUrl) {
    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        {previewQr ? (
          <p className="rounded-lg border border-amber-400/25 bg-amber-950/25 px-3 py-2 text-center text-xs leading-relaxed text-amber-100/90">
            Design preview — post-submit UI (<span className="font-mono text-[11px] text-amber-50">intakePreview=qr</span>). The QR
            and install link use a stub.
          </p>
        ) : null}
        <InstallQR installUrl={installUrl} />
        <button
          type="button"
          onClick={() => {
            if (previewQr) {
              const next = new URLSearchParams(searchParams.toString());
              next.delete("intakePreview");
              const qs = next.toString();
              router.replace(qs ? `${pathname}?${qs}` : pathname);
              return;
            }
            setPhase("form");
            setAuthorizeUrl(null);
          }}
          className="text-center font-mono text-xs uppercase tracking-[0.22em] text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
        >
          {previewQr ? "Exit preview (remove URL flag)" : "Edit intake and regenerate QR"}
        </button>
      </div>
    );
  }

  const showShortcutHint = situationOk && !pending;

  return (
    <form
      ref={formRef}
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
        title={showShortcutHint ? "Continue (⌘ Enter or Ctrl Enter)" : undefined}
        className={`mt-auto inline-flex shrink-0 items-center rounded-lg bg-indigo-200 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-950 transition-[box-shadow,background-color] duration-300 hover:bg-white enabled:shadow-[0_0_28px_-6px_rgba(165,180,252,0.85),0_0_56px_-16px_rgba(99,102,241,0.35)] enabled:hover:shadow-[0_0_36px_-4px_rgba(226,232,255,0.9),0_0_64px_-12px_rgba(129,140,248,0.45)] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none ${showShortcutHint ? "relative w-full justify-center" : "w-full justify-center"}`}
      >
        {pending ? (
          "Saving..."
        ) : situationOk ? (
          <>
            <span className="inline-flex items-center justify-center">Continue</span>
            <span
              className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-1 opacity-85 sm:flex"
              aria-hidden
            >
              <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-slate-950/25 bg-slate-950/10 px-1 font-sans text-[10px] font-semibold normal-case tracking-normal text-slate-950/90">
                ⌘
              </kbd>
              <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-slate-950/25 bg-slate-950/10 px-1 font-sans text-[10px] font-semibold normal-case tracking-normal text-slate-950/90">
                ↵
              </kbd>
            </span>
          </>
        ) : (
          `Type ${situationRemaining} more character${situationRemaining === 1 ? "" : "s"}`
        )}
      </button>
    </form>
  );
}
