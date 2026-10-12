# Roadmap — SPEAK

Future improvements discussed but not yet scheduled. Shipped work lives in [`CHANGELOG.md`](./CHANGELOG.md).

---

## Waiting on the platform

### WebMCP — expose site tools to in-browser AI agents
*Evaluated 2026-10-12 · deferred until WebMCP ships in Chrome stable.*

[WebMCP](https://github.com/webmachinelearning/webmcp) lets a page register JavaScript "tools" (name, description, JSON input schema, `execute()`) that an AI agent running in the visitor's browser can call. Flagged by Lighthouse's experimental **Agentic browsing** audit ("Adopt WebMCP").

- **Status (Oct 2026):** Community Group draft. Chrome origin trial only (149–156), Edge behind a flag, nothing in Firefox/Safari. The API changed shape twice in 2026 (`provideContext()` removed; `navigator.modelContext` → `document.modelContext`).
- **Why wait:** near-zero reach today, likely rework when the trial ends, and the Lighthouse category is informational (no ranking effect).
- **Plan when it lands:** a new `src/components/scripts/webmcp.ts`, loaded behind a feature check, registering:
  - `search_quotes(query)`: reuses the Pagefind index
  - `get_random_quote()`
  - `list_categories()`: from `src/lib/categories.ts`
  - `get_post(slug)`
- **Estimate:** minimal (1–2 tools) 2–4 h · polished (4 tools, tests, docs) 8–14 h · $0 hosting.
- **Revisit when:** WebMCP is in Chrome stable without an origin-trial token, or the spec reaches W3C standards track.

### Server-side MCP endpoint (alternative to WebMCP)
*Only if we want Claude / ChatGPT connectors to query the quotes directly.*

A remote MCP server on the same Cloudflare Worker (Agents SDK, `/mcp` route via `run_worker_first`), exposing the same four tools. It changes the deploy from assets-only to a Worker script. Estimate 8–16 h; the Workers free tier (100k requests/day) should cover it.

---

## Small fixes

- **Zero-width spaces in author names**: 19 post files contain U+200B (e.g. `J.Krishnamurti​`), which leaks into search results, the RSS feed and `llms.txt`. Strip them from the frontmatter.
- **Malformed link in *negging***: `define.php?term=Negging/?term=Sarging` looks like two Urban Dictionary URLs pasted together.
- **Deploy retry on transient Cloudflare errors**: the 3.9.1 run went red on a `504` from `GET /workers/subdomain` *after* the upload had succeeded. Consider a retry around `wrangler deploy` in `.github/workflows/deploy.yml`.

---

## Housekeeping

- **Cloudflare API token**: if it was given an expiry, renew it before then (see `DEPLOY.md` → *CI secrets*). An expired token fails only the Deploy step.
