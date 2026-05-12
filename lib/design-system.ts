export const designSystem = {
  brand: {
    name: "AI/NATIVE",
    tone: "terminal-native, executive, terse, technical, premium",
  },

  colors: {
    canvas: {
      page: "#050b0b",
      pageMid: "slate-950",
      surface: "slate-900/60",
      surfaceStrong: "slate-950/80",
      field: "slate-950/80",
      inverse: "indigo-100",
    },
    text: {
      primary: "indigo-100",
      body: "slate-300",
      muted: "slate-400",
      subtle: "slate-500",
      disabled: "slate-500",
      inverse: "slate-950",
    },
    border: {
      default: "slate-700/50",
      field: "slate-700",
      muted: "slate-700/40",
      success: "emerald-400/25",
      danger: "red-400/30",
    },
    accent: {
      primary: "emerald-400",
      primaryHover: "emerald-300",
      focus: "cyan-300/30",
      text: "emerald-300/80",
      textStrong: "emerald-50",
      surface: "emerald-950/25",
      surfaceStrong: "emerald-950/35",
    },
    secondary: {
      primary: "indigo-200",
      primaryHover: "white",
    },
    danger: {
      text: "red-200",
      surface: "red-950/40",
      bannerSurface: "red-950/30",
      bannerText: "red-100/95",
    },
  },

  typography: {
    font: {
      sans: "Geist",
      mono: "Geist Mono",
    },
    display:
      "text-balance font-mono text-5xl leading-[0.95] tracking-[-0.06em] text-indigo-200 sm:text-7xl lg:text-8xl",
    eyebrow:
      "font-mono text-xs uppercase tracking-[0.42em] text-emerald-300/80",
    lead: "text-pretty text-base leading-8 text-slate-400 sm:text-lg",
    body: "text-sm text-slate-300",
    bodyMuted: "text-sm text-slate-400",
    label:
      "font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400",
    helper:
      "font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500",
    link:
      "font-mono text-xs uppercase tracking-[0.22em] text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline",
  },

  layout: {
    page:
      "relative min-h-screen overflow-hidden bg-[#050b0b] text-slate-100",
    glow:
      "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(92,225,196,0.13),transparent_32%)]",
    main:
      "relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-5 pb-20 pt-20 sm:px-8 lg:pt-24",
    header: "flex w-full flex-col items-center text-center",
    stack: {
      section: "space-y-1.5",
      form: "flex w-full max-w-md flex-col gap-5",
      qr: "flex w-full max-w-md flex-col gap-6",
    },
  },

  radius: {
    field: "rounded-lg",
    card: "rounded-xl",
    featureCard: "rounded-2xl",
  },

  shadow: {
    focus: "focus:ring-2",
  },

  components: {
    card:
      "rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 text-left text-sm text-slate-300 shadow-2xl shadow-emerald-950/20",
    featureCard:
      "rounded-2xl border border-slate-700/50 bg-slate-950/80 p-6 shadow-2xl shadow-emerald-950/20",
    input:
      "w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-300/30 placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-2",
    textarea:
      "w-full resize-y rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-300/30 placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-2",
    buttonPrimary:
      "inline-flex items-center justify-center rounded-lg bg-indigo-200 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-950 hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500",
    buttonSecondary:
      "inline-flex items-center justify-center rounded-lg border border-slate-600/70 bg-slate-950/35 px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 hover:border-slate-300/70 hover:text-white",
    qrFrame: "rounded-lg bg-indigo-100 p-3",
    successBanner:
      "rounded-xl border border-emerald-400/25 bg-emerald-950/25 px-4 py-3 text-center text-sm text-emerald-100/90",
    successToast:
      "rounded-xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.22em] text-emerald-100/95",
    errorBanner:
      "rounded-lg border border-red-400/30 bg-red-950/40 px-3 py-2 text-xs text-red-200",
    errorToast:
      "rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-center text-sm text-red-100/95",
  },

  motion: {
    hover: "Use subtle color shifts only; avoid scale on form controls.",
    focus: "Use cyan focus rings for all interactive fields.",
  },
} as const;

export type DesignSystem = typeof designSystem;
