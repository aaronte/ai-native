"use client";

import { QRCodeSVG } from "qrcode.react";

export function InstallQR({
  installUrl,
}: {
  installUrl: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
      <p className="max-w-xs text-center text-sm text-zinc-400">
        Scan with your phone to connect Discord and install the coach on your
        account.
      </p>
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={installUrl} size={196} level="M" />
      </div>
      <a
        href={installUrl}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Open install link
      </a>
    </div>
  );
}
