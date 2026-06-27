# Hermes Agent

This folder contains the project-contained Hermes integration for the portfolio.

The website has two Hermes-related layers:

1. **Local dashboard assistant** (`src/agents/hermes/`) — a lightweight chat widget inside `/dashboard/hermes` that talks to any OpenAI-compatible Hermes endpoint. It runs inside the Next.js app and can draft projects, replies, and copy changes with confirmation.
2. **Remote Hermes Agent** (runs on your own server) — the full NousResearch/hermes-agent Python framework. It lives outside this repo, connects to the site via `/api/hermes-remote/*`, and can monitor health, receive Telegram alerts, and trigger rebuilds/rollbacks.

## Optional Upstream Installer

Nous Research currently documents this PowerShell installer:

```powershell
irm https://hermes-agent.nousresearch.com/install.ps1 | iex
```

Do not run that command from the app runtime. If it is used, it should be treated as an upstream/local tooling install, separate from this site's isolated integration.

## Environment

```env
HERMES_API_BASE_URL=https://your-provider.example/v1
HERMES_API_KEY=your-provider-key
HERMES_MODEL=NousResearch/Hermes-3-Llama-3.1-8B
NEXT_PUBLIC_HERMES_PUBLIC_NAME=Studio Assistant
```

`HERMES_API_BASE_URL` should be an OpenAI-compatible base URL. The app sends requests to:

```txt
{HERMES_API_BASE_URL}/chat/completions
```

## Public Naming

The public website should not expose the internal Hermes name. Public UI labels use `Studio Assistant` by default. The internal name `Hermes` is only referenced in this README and the dashboard UI for the authenticated owner.

## Architecture

- `manifest.ts` — agent metadata and defaults.
- `config.ts` — env-based configuration.
- `client.ts` — OpenAI-compatible HTTP client.
- `prompts/` — system prompts; updateable when Hermes format changes.
- `schemas/` — chat and tool-call parsing schemas.
- `runtime/` — context builders and the main chat runner.
- `tools/` — tool registry and executor for dashboard actions.

## Admin Tools

The admin assistant can propose actions. Every write action is returned as a draft and shown in the chat UI with **Apply / Cancel** buttons. Nothing is persisted until you confirm.

Supported tools:

- `draft_email_reply` — draft a reply to a contact message.
- `create_project_draft` — create a new portfolio project.
- `update_project_draft` — edit an existing project.
- `reorder_media_draft` — reorder a project's media list.
- `add_project_link_draft` — add a link to a project.
- `mark_message_read` — mark a contact message as read.
- `update_site_copy_draft` — edit hero or about copy.

## Remote Hermes Agent API

When you run the full Hermes Agent on a separate server/VPS, it authenticates with `HERMES_REMOTE_SECRET` and calls:

- `POST /api/hermes-remote/health` — site health + project count.
- `POST /api/hermes-remote/projects` — list/create/update projects.
- `POST /api/hermes-remote/messages` — list/reply/mark-read contact messages.
- `POST /api/hermes-remote/site/rebuild` — trigger a rebuild via `HERMES_REBUILD_HOOK`.
- `POST /api/hermes-remote/site/rollback` — `git reset --hard HEAD~N`.
- `POST /api/hermes-remote/notify` — forward Hermes alerts to Telegram.

Every remote endpoint requires `{ "secret": "HERMES_REMOTE_SECRET" }`.

## Telegram Alerts

The site can send Telegram alerts directly when a new contact message arrives. Configure:

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

The Hermes dashboard has a **Test Telegram** button to verify the setup.

## Updating When Hermes Changes

When a new Hermes version or prompt format is released, usually only these files change:

- `manifest.ts` — model name and capabilities.
- `config.ts` — defaults.
- `prompts/` — system prompt text.
- `schemas/tool-call.ts` — if the tool-call format changes.
- `client.ts` — if the API shape changes.

The tool registry, executor, and UI should stay stable across model updates.
