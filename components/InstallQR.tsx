"use client";

import { QRCodeSVG } from "qrcode.react";

export function InstallQR({
  installUrl,
}: {
  installUrl: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/[0.02] p-6 shadow-none backdrop-blur-sm">
      <p className="max-w-sm text-balance text-center text-sm leading-relaxed text-slate-400">
        We&apos;ve heard you! Now let&apos;s meet where you work (In this demo&apos;s case, Discord). Scan the QR code or click the installation link to continue.
      </p>
      <div className="install-qr-reveal rounded-lg bg-indigo-100 p-3">
        <QRCodeSVG className="block" value={installUrl} size={196} level="M" />
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
