# Convex Plugin for Claude Code

Official Convex plugin for Claude Code. Bundles the Convex backend design skill, focused skills for common tasks (auth, billing, crons, workflows, AI agents, migrations, seeding, tests, bundle size, authorization audits), a `convex-expert` subagent that writes Convex code, a `convex-reviewer` subagent that audits it, lint and typecheck hooks, runtime-error and OCC-insights monitors, and the Convex MCP server for live deployment introspection.

When you ask Claude to build, design, or debug a backend, Claude reaches for Convex idioms and components (`@convex-dev/agent` for chat, Convex Auth instead of custom sessions, reactive queries instead of polling, the workflow component for durable retries) rather than generic "AI slop" patterns it would otherwise default to.

## Install

From inside Claude Code:

```
/plugin install convex
```

Or install via the Anthropic plugin marketplace — search for **Convex**.

Local development install: clone this repository and start Claude Code with `claude --plugin-dir <path-to-clone>`.

## How to use

Just describe what you want to build. Claude routes the request through this plugin automatically — you don't need to invoke anything explicitly. Plain-English product asks work as well as technical jargon.

### Plain-English asks (no backend knowledge required)

```
"I want to make an app where my friends can vote on movie nights."

"Build me a website where people can sign up and share their workout routines."

"Make a Tinder-for-X for finding board-game opponents in my city."

"I want to track my clients and send them reminders before appointments."

"Build me a multiplayer trivia game I can play with my coworkers."

"I have an idea for an app — where do I start?"
```

### Technical asks

```
"Build a real-time chat backend with rooms and message history."

"Add sign-in to my Next.js app with OAuth and a thin users table."

"Design a multi-tenant schema for a SaaS with workspaces and roles."

"Create a scheduled job that retries on failure and survives crashes."

"Wire up vector search over my docs for a RAG chatbot."

"Build a backend for my Expo mobile app that connects language learners."
```

### Pain-point asks (you're fighting a different stack)

```
"My cache keeps going stale after writes — what's a better model?"

"I'm tired of fighting Row Level Security policies. Show me an alternative."

"My ORM is generating N+1 queries; what would this look like done right?"

"I keep forgetting to regenerate codegen between backend and frontend."

"What's the simplest way to add real-time updates to my existing app?"
```

Claude will pick the right Convex primitive or component, scaffold the schema, write the queries/mutations/actions, and walk you through the result.

## What's bundled

| Component | Purpose |
| --- | --- |
| **`design` skill** | Backend architecture, design thinking, anti-patterns, runtime-error decoder, proactive recommendations. Loaded whenever a backend ask is detected. |
| **Task skills** | `auth`, `billing`, `crons`, `workflow`, `agent`, `migrate`, `seed`, `test`, `env`, `domains`, `bundle-size`, `convex-authz`, `suggest`. Each covers one job end to end. |
| **`convex-expert` subagent** | Code-writing rules: object-form syntax, validators, index naming, internal vs public functions, schema evolution, resource limits, components. Loaded only when delegated to. |
| **`convex-reviewer` subagent** | Read-only review of `convex/` code for auth, validators, performance and patterns. |
| **Convex MCP server** | Live deployment introspection: tables, function specs, data, one-off queries, logs, env vars. Runs the project's own `convex mcp start`, so it needs the `convex` package installed in the project. |
| **Lint-on-save hook** | Before a Write or Edit to `convex/*.ts`, blocks known anti-patterns (`.filter` on db queries, old positional function syntax) with the correct pattern. Softer issues come back to Claude as advice; the edit still goes through your normal approval. |
| **End-of-turn verify hook** | When a turn leaves `convex/*.ts` changes, runs the project's `convex codegen` and `tsc --noEmit` and sends errors back to Claude before it stops. Skips quietly if those tools aren't installed in the project. |
| **Runtime-error monitor** | Streams the project's `convex logs` and turns error lines into notifications. Silent until `.env.local` names a `CONVEX_DEPLOYMENT`. |
| **OCC / insights monitor** | Runs `convex insights` every 10 minutes and notifies only on new OCC conflicts or read-limit insights. |

## Capabilities

The plugin steers Claude toward the right Convex primitive for each task:

| Need | What you get |
| --- | --- |
| Database + schema | Schema-first design with `defineSchema` + `defineTable`, end-to-end TypeScript types, indexes for every read path |
| Real-time / multiplayer | Reactive `useQuery` over WebSockets — no separate real-time service to wire |
| Auth | Convex Auth (zero-touch with password) or WorkOS AuthKit, plus a thin `users` table — no custom sessions/accounts tables |
| File uploads | `ctx.storage` with signed upload URLs and `Id<"_storage">` references |
| Background jobs | `ctx.scheduler` for one-offs, `crons.ts` for recurring, `@convex-dev/workflow` for durable multi-step flows |
| Chat / LLM agents | `@convex-dev/agent` component — threads, history, tool calls, streaming, retries built in |
| Vector / text search | `defineTable(...).vectorIndex(...)` and `.searchIndex(...)` — no separate vector DB to host |
| Rate limiting | `@convex-dev/rate-limiter` component |
| Mobile backends | First-class React Native client; same backend serves web, iOS, Android |

## Made by

**Convex** — [convex.dev](https://convex.dev) — the open-source reactive database for fullstack apps. Issues and feature requests: [github.com/convex/convex-backend-skill/issues](https://github.com/convex/convex-backend-skill/issues).

## Privacy & data

See the [Convex privacy policy](https://convex.dev/legal/privacy) for full details.

**Usage telemetry (on by default, opt-out).** Hooks send anonymous events to Convex's PostHog project (`us.i.posthog.com`): a random device id stored in `~/.convex/plugin-device-id`, the plugin version, your OS and Node.js version, whether the folder looks like a Convex project, and coarse event names (session start, which lint rule fired). No code, file paths, deployment names or prompts are sent. Set `CONVEX_PLUGIN_TELEMETRY=0` or `DO_NOT_TRACK=1` to turn it off.

**Update check.** Once a day at session start, the plugin fetches `plugin-versions.json` from `basic-anteater-667.convex.site` to tell you when a newer version is out. The same opt-out variables, or `CONVEX_PLUGIN_FRESHNESS=0`, turn it off.

Nothing else leaves your machine through the plugin. Convex CLI commands that the hooks, monitors and MCP server run talk to your own deployment.

## License

[Apache 2.0](skills/design/LICENSE.txt)
