# Deploying SPEAK

Production: **<https://speak.junglestar.org>** — hosted on **Cloudflare Workers** (static assets, serving `dist/`).

There are two ways to ship:

1. **Automatic (normal):** push to `source` → GitHub Actions builds, tests, and deploys.
2. **Manual (this guide):** deploy from your own machine with Wrangler — useful when CI is down or you want to push a local build right now.

---

## TL;DR — the normal way

```sh
git push
```

That's it. Pushing to the `source` branch triggers `.github/workflows/deploy.yml`, which runs `install → build → test → deploy`. A failing test blocks the deploy. Watch it with the commands in [Check a deploy](#check-a-deploy).

---

## One-time setup (manual deploys only)

You only do this block **once per machine**.

```sh
corepack enable
```
> **What:** Corepack is a tool that ships *inside* Node.js; this turns it on so the `pnpm` command becomes available at the exact version pinned in `package.json` (the `packageManager` field). **Why:** everyone — you, teammates, CI — then uses the identical pnpm version, which avoids "works on my machine" install bugs. No `npm install -g pnpm` needed. (Run it once; if your shell already has `pnpm`, you can skip it.)

```sh
pnpm install
```
> **What:** downloads every dependency into `node_modules`, including Wrangler (Cloudflare's deploy CLI) and Pagefind (the search indexer). **Why:** the build and the deploy command can't run without these present locally.

```sh
pnpm exec wrangler login
```
> **What:** opens your browser to authorize Wrangler with your Cloudflare account. **Why:** Wrangler needs permission to upload your site — without logging in, `deploy` is rejected. (Done once per machine; it stores a token.)

```sh
pnpm exec wrangler whoami
```
> **What:** prints the Cloudflare account/email Wrangler is currently logged in as. **Why:** a 5-second sanity check that you're about to deploy to the *right* account before anything goes live.

---

## Manual deploy

```sh
pnpm deploy
```
> **What:** the whole thing in one command — runs `pnpm build` then `wrangler deploy`. **Why:** this is the everyday manual-deploy command; the two steps below are the same thing split apart if you want to inspect `dist/` in between.

If you want to do it in two explicit steps instead:

```sh
pnpm build
```
> **What:** compiles the site into `dist/` and writes the Pagefind search index. **Why:** `dist/` is exactly what gets uploaded — no `dist/`, nothing to deploy.

```sh
pnpm exec wrangler deploy
```
> **What:** uploads `dist/` to the `speak` Worker on Cloudflare (per `wrangler.jsonc`) and prints the live URL. **Why:** this is the step that actually makes your changes public.

Dry run first (recommended when unsure):

```sh
pnpm build && pnpm exec wrangler deploy --dry-run
```
> **What:** validates `wrangler.jsonc` and counts the files it *would* upload, but uploads nothing. **Why:** a safe way to confirm the deploy is wired correctly without touching production.

---

## Trigger the CI deploy manually

No local build needed — runs the same GitHub Actions pipeline on demand.

```sh
gh workflow run deploy.yml --ref source
```
> **What:** kicks off the CI deploy workflow from the latest `source` commit (needs the GitHub CLI — run `gh auth login` once). **Why:** re-deploy the current code without making a new commit, e.g. to retry after a flaky failure.

---

## Check a deploy

```sh
gh run list --workflow=deploy.yml --limit 5
```
> **What:** lists the recent CI deploy runs and their status. **Why:** confirms whether your push actually triggered a deploy and how it ended (success / failure / in-progress).

```sh
gh run watch --exit-status
```
> **What:** follows the most recent run live, exiting non-zero if it failed. **Why:** lets you watch a deploy finish instead of refreshing the dashboard.

```sh
gh run view --log-failed
```
> **What:** prints only the *failing* step's logs from the last run. **Why:** your first stop when a deploy goes red — skips straight to what broke.

---

## Verify production

```sh
curl -sI https://speak.junglestar.org/ | grep -iE 'HTTP|server'
```
> **What:** fetches just the response headers of the homepage. **Why:** quickest "is it up and on Cloudflare?" check — expect `HTTP/2 200` and `server: cloudflare`.

```sh
curl -s "https://speak.junglestar.org/?cb=$RANDOM" | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1
```
> **What:** prints the version shown in the live footer (the `?cb=` query busts any cache). **Why:** confirms the deploy actually shipped your latest build — it should match `version` in `package.json`.

```sh
curl -sI "https://speak.junglestar.org$(curl -s https://speak.junglestar.org/ | grep -oE '/_astro/[^"]+\.css' | head -1)" | grep -i cache-control
```
> **What:** grabs a real fingerprinted asset and reads its cache header. **Why:** verifies the long immutable cache from `public/_headers` is being applied — expect `max-age=31536000, immutable`.

---

## Rollback

```sh
pnpm exec wrangler versions list
```
> **What:** lists past deployments of the Worker with their version IDs and timestamps. **Why:** you need a version ID (and to spot the last good one) before rolling back.

```sh
pnpm exec wrangler rollback
```
> **What:** instantly reverts the Worker to the previous version (add an ID to target a specific one: `wrangler rollback <VERSION_ID>`). **Why:** the fastest way to undo a bad deploy in production while you fix the real cause.

> ⚠️ Rollback only changes what the Worker serves — it does **not** touch git. Follow up with a real fix + commit so the next deploy doesn't re-ship the bad build.

---

## Where things live

| File | What it does |
|---|---|
| `wrangler.jsonc` | Cloudflare config — points the `speak` Worker at `dist/` |
| `public/_headers` | Security + cache headers applied to every response |
| `.github/workflows/deploy.yml` | The automatic CI deploy pipeline |
| `package.json` → `scripts.deploy` | `pnpm build && wrangler deploy` |

**Custom domain & DNS** are managed in the Cloudflare dashboard (Worker → *Domains & Routes*), not in this repo.
