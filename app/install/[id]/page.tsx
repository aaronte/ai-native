import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InstallQR } from "@/components/InstallQR";
import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { getDiscordAuthorizeUrl } from "@/lib/discord/oauth";

export const dynamic = "force-dynamic";

export default async function InstallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  if (!session) notFound();

  const installUrl = getDiscordAuthorizeUrl({ sessionId: id });

  const preview =
    session.problem.length > 160
      ? `${session.problem.slice(0, 157)}…`
      : session.problem;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="flex w-full max-w-2xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-2xl font-semibold text-white">
            Connect your Discord account
          </h1>
          <p className="text-sm text-zinc-400">
            Authorize the app so we can link your session and open your DM coach.
            You’ll finish a quick OAuth screen, then return here with a link to
            Discord.
          </p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
            <p className="font-medium text-zinc-200">Your topic</p>
            <p className="mt-1 text-zinc-400">{preview}</p>
          </div>
          <Link
            href="/"
            className="text-sm text-emerald-400/90 hover:text-emerald-300"
          >
            ← Back to edit
          </Link>
        </div>
        <InstallQR installUrl={installUrl} />
      </div>
    </div>
  );
}
