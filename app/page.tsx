import { ProblemInput } from "@/components/ProblemInput";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorParam } = await searchParams;
  const initialError =
    typeof errorParam === "string"
      ? (() => {
          try {
            return decodeURIComponent(errorParam);
          } catch {
            return errorParam;
          }
        })()
      : undefined;

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
            Share the challenge you’re facing in product, engineering, or design.
            We’ll connect you with a Discord coach loaded with playbooks for
            operational excellence and upskilling.
          </p>
        </header>
        <ProblemInput initialError={initialError} />
      </main>
    </div>
  );
}
