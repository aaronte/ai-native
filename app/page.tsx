import { TakeInFlow } from "@/components/TakeInFlow";

function oauthBanner(code: string | undefined) {
  if (!code) return null;
  if (code === "ok") {
    return (
      <div className="w-full max-w-md rounded-xl border border-emerald-800/60 bg-emerald-950/35 px-4 py-3 text-center text-sm text-emerald-100/95">
        Discord is linked. Open the bot in Discord and send a DM — your intake is already loaded for this account.
      </div>
    );
  }
  const msg =
    code === "denied"
      ? "Authorization was canceled. You can try again from the QR step."
      : code === "invalid_state"
        ? "That install link expired or was already used. Submit the intake form again for a fresh QR."
        : "Something went wrong connecting Discord. Check redirect URI and secrets, then try again.";
  return (
    <div className="w-full max-w-md rounded-xl border border-red-900/55 bg-red-950/30 px-4 py-3 text-center text-sm text-red-100/95">
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

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-16 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%)]" />
      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
            AI-native org coach
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Bring your team into the AI-native era
          </h1>
          <p className="mx-auto max-w-lg text-pretty text-base text-zinc-400">
            Tell us what you&apos;re navigating — then scan the QR code to install the coach on Discord with{" "}
            <strong className="text-zinc-200">that context already attached</strong> to your account.
          </p>
        </header>

        {oauthBanner(oauthCode)}

        <TakeInFlow />
      </main>
    </div>
  );
}
