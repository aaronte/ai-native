import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/** OpenRouter model slugs; override with env. See https://openrouter.ai/models */
export const DEFAULT_COACH_MODEL = "anthropic/claude-sonnet-4.6";
export const DEFAULT_SUMMARY_MODEL = "google/gemini-2.5-flash";

function openRouterOptions() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    compatibility: "strict" as const,
    appName: process.env.OPENROUTER_APP_NAME,
    appUrl: process.env.OPENROUTER_APP_URL ?? process.env.APP_URL,
  };
}

/** Coach path: key required. */
export function requireOpenRouter() {
  const opts = openRouterOptions();
  if (!opts) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return createOpenRouter(opts);
}

/** Memory compression: skip if key unset. */
export function openRouterIfConfigured() {
  const opts = openRouterOptions();
  if (!opts) return null;
  return createOpenRouter(opts);
}
