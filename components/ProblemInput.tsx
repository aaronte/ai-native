"use client";

import { useCallback, useState } from "react";

export function ProblemInput({
  initialError,
}: {
  initialError?: string;
}) {
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const submit = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem }),
      });
      const data = (await res.json()) as {
        sessionId?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      if (!data.sessionId) throw new Error("Missing session");
      window.location.href = `/install/${data.sessionId}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }, [problem]);

  const startListening = useCallback(() => {
    setError(null);
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalText = problem;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i]![0]!.transcript;
        if (event.results[i]!.isFinal) {
          finalText = `${finalText} ${chunk}`.trim();
        } else {
          interim += chunk;
        }
      }
      setProblem(`${finalText} ${interim}`.trim());
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Could not capture speech. Try typing instead.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    setListening(true);
    recognition.start();
  }, [problem]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <label className="sr-only" htmlFor="problem">
        What is going on?
      </label>
      <textarea
        id="problem"
        name="problem"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        rows={6}
        placeholder="Example: Engineering ships fast with AI but reviews bottleneck; PMs feel specs go stale overnight…"
        className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy || problem.trim().length < 20}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Saving…" : "Continue to Discord"}
        </button>
        <button
          type="button"
          onClick={startListening}
          disabled={listening || busy}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-600 disabled:opacity-40"
        >
          {listening ? "Listening…" : "Speak"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-amber-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
