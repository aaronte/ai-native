/** Shown after Discord OAuth returns successfully (`?discord_oauth=ok`). */
export function DiscordLinkedBanner() {
  return (
    <div className="w-full rounded-xl border border-cyan-300/45 bg-cyan-950/25 px-4 py-3 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-slate-100/95 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.12)]">
      <span className="rounded-md bg-sky-400/35 px-2 py-0.5 font-semibold tracking-[0.2em] text-sky-50">
        Discord
      </span>{" "}
      linked. Open the bot and send a DM. Your context is already loaded.
    </div>
  );
}
