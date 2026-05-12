import { Suspense } from "react";

import { HeroBackdrop } from "@/components/HeroBackdrop";
import { TakeInFlow } from "@/components/TakeInFlow";

function oauthBanner(code: string | undefined) {
  if (!code) return null;
  /** Success copy lives in `TakeInFlow` (right column) so it stays with the install / QR context. */
  if (code === "ok") return null;
  const msg =
    code === "denied"
      ? "Authorization was canceled. You can try again from the QR step."
      : code === "invalid_state"
        ? "That install link expired or was already used. Submit the intake form again for a fresh QR."
        : "Something went wrong connecting Discord. Check redirect URI and secrets, then try again.";
  return (
    <div className="w-full max-w-2xl rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-center text-sm text-red-100/95">
      {msg}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ discord_oauth?: string }>;
}) {
  const sp = await searchParams;
  const oauthCode =
    typeof sp.discord_oauth === "string" ? sp.discord_oauth : undefined;
  const oauthNotice = oauthBanner(oauthCode);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#050b0b] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0">
        <HeroBackdrop />
        <div className="absolute inset-0 bg-[#050b0b]/28" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b0b]/12 via-[#050b0b]/38 to-[#050b0b]/72" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(92,225,196,0.06),transparent_45%),radial-gradient(circle_at_18%_88%,rgba(148,163,184,0.10),transparent_28%),radial-gradient(circle_at_86%_80%,rgba(125,211,252,0.08),transparent_24%)]" />
        <div className="absolute -bottom-24 left-[-10%] h-72 w-96 rounded-full bg-slate-500/15 blur-3xl" />
        <div className="absolute -bottom-28 right-[-12%] h-72 w-96 rounded-full bg-slate-400/8 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-cyan-300/20" />

      <header className="relative z-10 mx-auto w-full max-w-6xl shrink-0 px-5 pt-6 sm:px-8 sm:pt-8">
        <nav className="flex items-center gap-4">
          <a href="#" className="font-mono text-sm tracking-[0.34em] text-slate-200">
            AI/NATIVE
          </a>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-5 pb-5 pt-4 sm:px-8 sm:pb-6 sm:pt-5">
        <section
          id="intake"
          className="relative isolate flex min-h-0 w-full max-w-5xl flex-1 flex-col rounded-xl shadow-[0_28px_90px_-16px_rgba(0,0,0,0.55)] ring-1 ring-white/30"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl backdrop-saturate-125"
          />
          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
            <div className="flex shrink-0 items-center gap-2 border-b border-white/20 bg-transparent px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h1 className="ml-2 font-mono text-xs uppercase tracking-[0.42em] text-emerald-300/80">
                AI-native org coach
              </h1>
            </div>

            <div className="shrink-0 border-t border-white/10 bg-transparent px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <span className="text-cyan-300">$</span> intake attach-context --channel discord-dm
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-6 border-t border-white/15 bg-transparent px-5 py-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:gap-8 sm:px-8 sm:py-8">
              {oauthNotice ? (
                <div className="shrink-0 [&>div]:max-w-none">{oauthNotice}</div>
              ) : null}

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 min-[420px]:grid-cols-[0.9fr_1fr]">
                <div className="flex min-h-0 flex-col justify-between gap-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.34em] text-emerald-300/80">
                      Start here
                    </p>
                    <h2 className="mt-4 text-balance font-mono text-3xl leading-tight tracking-[-0.04em] text-indigo-100 sm:text-4xl">
                      Send the messy context. Get a sharper next move.
                    </h2>
                    <p className="mt-5 text-sm leading-snug text-slate-400">
                      Tell the coach what is stuck: the team shape, the product pressure, the engineering bottleneck, or the executive question nobody has made concrete yet.
                    </p>
                    <p className="mt-4 text-balance text-left text-sm leading-snug text-slate-400">
                      The teams pulling ahead are changing how decisions get made, how code ships, what leaders inspect, and what work stops existing. This AI coach helps you make that shift concrete: clearer tradeoffs, tighter shipping loops, and fewer motions that never should have existed.
                    </p>
                  </div>
                  <div id="notes" className="space-y-3 text-sm text-slate-500">
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">
                      What happens next
                    </p>
                    <p>
                      We save the context, generate a Discord install QR, and continue the thread in DM with an AI-native Org Coach equipped with the skills your organization needs to operate as an AI-native organization.
                    </p>
                  </div>
                </div>

                <div className="flex min-h-0 h-full flex-col min-[420px]:min-h-0">
                  <Suspense
                    fallback={
                      <div
                        className="h-full min-h-[min(50vh,18rem)] w-full max-w-md animate-pulse rounded-xl border border-white/15 bg-white/[0.02]"
                        aria-hidden
                      />
                    }
                  >
                    <TakeInFlow />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
