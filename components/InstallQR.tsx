"use client";

import { QRCodeSVG } from "qrcode.react";

export function InstallQR({
  installUrl,
}: {
  installUrl: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/[0.02] p-6 shadow-none backdrop-blur-sm">
      <p className="max-w-xs text-center text-sm text-slate-400">
        Scan with your phone (or tap below). Discord will ask you to authorize;
        then install the coach on your account with the context you just shared.
      </p>
      <div className="rounded-lg bg-indigo-100 p-3">
        <QRCodeSVG value={installUrl} size={196} level="M" />
      </div>
      <a
        href={installUrl}
        className="rounded-lg bg-indigo-200 px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-950 hover:bg-white"
      >
        Open install link
      </a>
    </div>
  );
}
