# AI-native executive coach (Discord + web)

Tech executives describe an org challenge on the web app, install a Discord integration, then get **one-on-one DM coaching** grounded in ~20 playbooks (product, engineering, design, org change).  
**Stack:** Next.js (Vercel or Railway) · Supabase Postgres + Drizzle · Anthropic Claude · `discord.js` gateway on **Railway**.

## Monorepo layout

| Path | Role |
|------|------|
| `app/` | Web UI, `POST /api/sessions`, Discord OAuth callback, `/install/[id]` QR |
| `bot/src/main.ts` | Long-lived Discord client: DMs, `/skills`, `/reset`, coach loop |
| `lib/` | DB client, skills loader + router, prompts, coach + memory compression |
| `content/skills/` | Markdown playbooks (frontmatter + body) |
| `scripts/register-commands.ts` | Registers global slash commands |
| [`railway.toml`](railway.toml) | **Discord bot** on Railway — install-only build, `npm run bot` start |

## Prerequisites

- Node **20+**
- [Discord application](https://discord.com/developers/applications) with a **bot user**
- [Supabase](https://supabase.com/) project (Postgres)
- [Anthropic API](https://www.anthropic.com/) key

## 1. Supabase / database

1. Create a project → **Project Settings → Database**.  
2. Use the **Transaction pooler** connection string (port **6543**) as `DATABASE_URL` for the app and bot.  
3. Optionally set `DIRECT_URL` to the direct/session connection (port **5432**) if `drizzle-kit push` against the pooler fails.

Apply schema from your machine:

```bash
cp .env.example .env.local
# fill DATABASE_URL (and DIRECT_URL if needed)

npm run db:push
```

## 2. Discord application

1. **Bot** tab: enable **MESSAGE CONTENT INTENT** (privileged). Copy **token** → `DISCORD_BOT_TOKEN` (bot host only; keep off Vercel if you prefer).  
2. **OAuth2 → General**: add redirect  
   `https://<your-app-host>/api/discord/callback`  
   (for local dev e.g. `http://localhost:3000/api/discord/callback`).  
3. Copy **Client ID** → `DISCORD_CLIENT_ID`, **Client Secret** → `DISCORD_CLIENT_SECRET`.  
4. **Installation**: prefer **User Install** so individuals authorize without a server.  
5. **Discord Provided Install Link** scopes used in code: `identify`, `applications.commands`.  
6. **Interactions Endpoint URL:** leave **blank** — slash commands are handled on the **gateway** via `INTERACTION_CREATE`.  
7. (Optional) Set `DISCORD_BOT_USER_ID` on your **web** host (Vercel or Railway) for a direct “open DM” link on `/installed` (Developer Mode → right‑click bot → Copy User ID).  
8. Register slash commands **once** after deploy:

```bash
DISCORD_BOT_TOKEN=... DISCORD_APPLICATION_ID=... npm run register-commands
```

Global commands may take up to an hour to propagate everywhere.

## 3. Environment variables

See [`.env.example`](.env.example). Minimum:

**Web host (Vercel or Railway)**

- `APP_URL` – public site origin, no trailing slash  
- `DATABASE_URL` – Supabase pooler  
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`  
- `DISCORD_BOT_USER_ID` (optional, for deeplink)  

**Bot on Railway**

- `APP_URL` – same public URL as the web app  
- `DATABASE_URL` – Supabase pooler  
- `DISCORD_BOT_TOKEN`  
- `ANTHROPIC_API_KEY`  
- Optional: `ANTHROPIC_COACH_MODEL` (default `claude-sonnet-4-20250514`)  
- Optional: `ANTHROPIC_SUMMARY_MODEL` for long-thread compression (default Haiku)

## 4. Local development

```bash
npm install
npm run db:push
npm run dev
```

In another terminal (with `.env.local` or env vars loaded):

```bash
npm run bot
```

## 5. Deploy

### Discord bot on Railway (recommended)

Repo root includes [`railway.toml`](railway.toml): **build** runs `npm ci` only (no `next build`), **start** runs `npm run bot`. That keeps the gateway lean and avoids Railpack auto-picking a Next.js production build for this service.

1. [Railway](https://railway.com/) → **New Project** → **Deploy from GitHub** → select this repo.  
2. After the first deploy, open the service → **Variables** → add the **Bot on Railway** variables from [§3](#3-environment-variables).  
3. **Settings → Networking → Generate Domain** if you want a public URL (optional for the bot; DMs only need outbound internet).  
4. **Settings → Source**  
   - **Branch:** `main` (or your default).  
   - **Watch paths** (optional, fewer redeploys): e.g. `bot/`, `lib/`, `content/skills/`, `package.json`, `railway.toml`.  
5. Every push to the watched branch triggers a **new deploy** automatically (GitHub-connected projects).

`tsx` and `dotenv` live in `dependencies` so Railway’s production install (no devDependencies) can still run `npm run bot`.

### Optional: Next.js web on Railway (second service)

If you want **both** web and bot on Railway instead of Vercel:

1. Add a **second service** from the same repo (or duplicate the repo connection).  
2. In that service’s **Settings**, override (dashboard overrides `railway.toml` for this service only):  
   - **Build command:** `npm ci && npm run build`  
   - **Start command:** `npm run start` (listens on `0.0.0.0`; Railway sets `PORT`).  
3. Copy the **Web host** variables from [§3](#3-environment-variables) into this service.  
4. Set `APP_URL` to this service’s **public Railway URL** (or your custom domain).

### Web on Vercel (alternative)

Connect the repo to Vercel, set **Web host** variables, deploy. `APP_URL` should be your Vercel production URL.

### After any deploy

Run `npm run register-commands` when slash command definitions change.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm run start` | Production web |
| `npm run bot` | Discord gateway |
| `npm run db:push` | `drizzle-kit push` schema to Postgres |
| `npm run register-commands` | Push `/skills` and `/reset` to Discord |

## License

Private / unlicensed unless you add one.
