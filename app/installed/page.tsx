import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function InstalledPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionId } = await searchParams;
  if (!sessionId) {
    redirect("/");
  }

  const db = getDb();
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session || !session.discordUserId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100">
        <p className="max-w-md text-zinc-400">
          We couldn’t confirm your Discord link. Go back to the install page and
          try authorizing again.
        </p>
        <Link
          href={`/install/${sessionId}`}
          className="mt-6 text-emerald-400 hover:text-emerald-300"
        >
          Return to install
        </Link>
      </div>
    );
  }

  const botUserId = process.env.DISCORD_BOT_USER_ID;
  const openDiscordHref = botUserId
    ? `https://discord.com/channels/@me/${botUserId}`
    : "https://discord.com/app";

  const preview =
    session.problem.length > 200
      ? `${session.problem.slice(0, 197)}…`
      : session.problem;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="w-full max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-white">You’re connected</h1>
        <p className="text-sm text-zinc-400">
          Open Discord and message <strong className="text-zinc-200">your coach</strong>{" "}
          in DMs. Your session was seeded with the problem below. Try{" "}
          <code className="rounded bg-zinc-900 px-1 py-0.5 text-emerald-300">
            /skills
          </code>{" "}
          or{" "}
          <code className="rounded bg-zinc-900 px-1 py-0.5 text-emerald-300">
            /reset
          </code>{" "}
          anytime.
        </p>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left text-sm text-zinc-300">
          <p className="font-medium text-zinc-200">Your topic</p>
          <p className="mt-1 text-zinc-400">{preview}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={openDiscordHref}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Open Discord
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 hover:border-zinc-600"
          >
            Home
          </Link>
        </div>
        {!botUserId ? (
          <p className="text-xs text-amber-400/90">
            Set{" "}
            <code className="rounded bg-zinc-900 px-1">DISCORD_BOT_USER_ID</code>{" "}
            for a direct DM deep link (Discord → Developer Mode → right-click bot
            → Copy User ID).
          </p>
        ) : null}
      </div>
    </div>
  );
}
