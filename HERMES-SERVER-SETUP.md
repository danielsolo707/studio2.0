# Hermes Agent Server Setup

This guide installs the full **NousResearch/hermes-agent** on your own server/VPS and connects it to this Next.js site.

## What you get

- Hermes Agent running 24/7 on your server.
- Telegram control of the site (`/status`, `/messages`, `/reply`, `/rebuild`, `/rollback`, `/heal`).
- Instant Telegram alerts when someone submits the contact form.
- Self-healing health checks from Hermes to the site.
- Complete isolation from your laptop — your server keeps running whether your laptop is on or off.

## Requirements

- A VPS or always-on server (Ubuntu/Debian recommended).
- Docker + Docker Compose installed.
- A Telegram bot token from [@BotFather](https://t.me/BotFather).
- Your Telegram chat ID.
- A model provider API key (OpenRouter, Nous Portal, OpenAI, etc.).

## 1. Prepare the site environment

Add these variables to your deployed Next.js site (`.env.local` on your host, or Vercel/Cloudflare dashboard):

```env
# Hermes local chat assistant
HERMES_API_BASE_URL=https://your-provider.example/v1
HERMES_API_KEY=your-provider-key
HERMES_MODEL=NousResearch/Hermes-3-Llama-3.1-8B

# Hermes remote control (server-side agent)
HERMES_REMOTE_SECRET=generate-a-long-random-secret-min-32-chars
HERMES_REBUILD_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy

# Telegram notifications
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789
```

- `HERMES_REMOTE_SECRET` must be a long random string. It is shared only between this site and the Hermes server.
- `HERMES_REBUILD_HOOK` is optional. If you use Vercel, get it from Project Settings → Git → Deploy Hooks. If you self-host, leave it blank and use `/heal` commands instead.

## 2. Get your Telegram chat ID

1. Message [@userinfobot](https://t.me/userinfobot) on Telegram.
2. It will reply with your numeric user ID — that is `TELEGRAM_CHAT_ID`.
3. Start a conversation with your new bot so it can message you.

## 3. Install Hermes Agent on the server

SSH into your server and run:

```bash
# Install Docker if you haven't already
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Create a home for Hermes
mkdir -p ~/hermes-agent && cd ~/hermes-agent

# Clone the official repo
git clone https://github.com/NousResearch/hermes-agent.git .

# Build and run with Docker Compose
docker compose up -d
```

The official repo includes a `docker-compose.yml`. If you prefer a minimal custom setup, create this `docker-compose.yml`:

```yaml
services:
  hermes:
    build: .
    container_name: hermes-agent
    restart: unless-stopped
    environment:
      - HERMES_MODEL_PROVIDER=openrouter
      - HERMES_API_KEY=${HERMES_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
      - HERMES_SITE_URL=${HERMES_SITE_URL}
      - HERMES_REMOTE_SECRET=${HERMES_REMOTE_SECRET}
      - HERMES_REBUILD_HOOK=${HERMES_REBUILD_HOOK}
    volumes:
      - ./data:/app/data
      - ./skills:/app/skills
      - ./memory:/app/memory
      - /var/run/docker.sock:/var/run/docker.sock
```

Then create `.env` next to it:

```env
HERMES_API_KEY=your-openrouter-or-provider-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
HERMES_SITE_URL=https://yourdomain.com
HERMES_REMOTE_SECRET=the-same-secret-as-the-site
HERMES_REBUILD_HOOK=https://api.vercel.com/v1/integrations/deploy/...
```

## 4. Configure Hermes to talk to your site

Hermes Agent has a skills/plugins system. Create a custom skill so Hermes knows how to call your site API.

Create `~/hermes-agent/skills/site_bridge.py`:

```python
import os
import requests

SITE_URL = os.getenv("HERMES_SITE_URL", "").rstrip("/")
SECRET = os.getenv("HERMES_REMOTE_SECRET", "")
REBUILD_HOOK = os.getenv("HERMES_REBUILD_HOOK", "")


def _post(path: str, payload: dict) -> dict:
    url = f"{SITE_URL}/api/hermes-remote{path}"
    body = {"secret": SECRET, **payload}
    r = requests.post(url, json=body, timeout=30)
    r.raise_for_status()
    return r.json()


def site_health() -> str:
    data = _post("/health", {})
    return f"Site OK: {data.get('projectCount', 0)} projects, DB latency {data.get('dbLatencyMs')}ms"


def list_messages(limit: int = 5) -> str:
    data = _post("/messages", {"action": "list", "limit": limit})
    msgs = data.get("messages", [])
    if not msgs:
        return "No messages."
    lines = []
    for m in msgs:
        status = "UNREAD" if not m.get("isRead") else "read"
        lines.append(f"[{status}] {m['name']} <{m['email']}>: {m['message'][:120]}...")
    return "\n".join(lines)


def reply_to_message(message_id: str, to: str, subject: str, body: str) -> str:
    _post("/messages", {"action": "reply", "messageId": message_id, "to": to, "subject": subject, "body": body})
    return f"Reply drafted and saved for {to}."


def list_projects() -> str:
    data = _post("/projects", {"action": "list"})
    projects = data.get("projects", [])
    return "\n".join(f"- {p['id']}: {p['name']} ({p.get('category', 'N/A')})" for p in projects)


def create_project(project: dict) -> str:
    _post("/projects", {"action": "create", "project": project})
    return f"Project '{project.get('name')}' created."


def rebuild_site() -> str:
    if not REBUILD_HOOK:
        return "No rebuild hook configured."
    _post("/site/rebuild", {})
    return "Rebuild triggered."


def rollback_site(commits: int = 1) -> str:
    data = _post("/site/rollback", {"commits": commits})
    return f"Rolled back to {data.get('target', 'unknown')}."


def heal_site() -> str:
    try:
        health = _post("/health", {})
        if health.get("ok"):
            return site_health()
    except Exception as e:
        return f"Health check failed: {e}. Try /rebuild or check server logs."
    return site_health()
```

Register the skill in Hermes following its documentation (usually by adding a `skill.yaml` or mentioning the file in `cli-config.yaml`).

## 5. Telegram commands

Once the Telegram gateway is running (`hermes gateway start`), you can message your bot:

```
/status       - Check site health
/messages     - List recent contact messages
/reply id     - Draft a reply to a message
/projects     - List portfolio projects
/rebuild      - Trigger site rebuild
/rollback 1   - Roll back 1 git commit
/heal         - Diagnose and suggest fixes
```

## 6. Self-healing with cron

Hermes has a built-in cron scheduler. Add a job that pings your site every 5 minutes:

```
/hermes cron add "*/5 * * * *" "check site health; if not ok then heal site"
```

Or use a simple Linux cron job outside Hermes:

```bash
crontab -e
# add:
*/5 * * * * cd ~/hermes-agent && docker compose exec hermes python -c "from skills.site_bridge import heal_site; print(heal_site())" >> /tmp/hermes-health.log 2>&1
```

## 7. Security checklist

- [ ] `HERMES_REMOTE_SECRET` is at least 32 random characters.
- [ ] The secret is identical on the site and the Hermes server.
- [ ] Telegram bot is set to only respond to your chat ID.
- [ ] Hermes container has limited permissions (no root, read-only filesystem except `/app/data`).
- [ ] `/api/hermes-remote/*` is never exposed without HTTPS.
- [ ] The `/site/rollback` endpoint requires confirmation from Hermes before use.

## 8. Test everything

1. Go to `/dashboard/hermes` on your site.
2. Click **Test Telegram**. You should receive a message.
3. Submit the contact form. You should receive a Telegram alert.
4. From Telegram, send `/status` to your bot. It should reply with site health.

## Troubleshooting

- **Hermes cannot reach the site**: Check `HERMES_SITE_URL`, `HERMES_REMOTE_SECRET`, and that `/api/hermes-remote/health` returns 200.
- **Telegram not working**: Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Make sure you messaged the bot first.
- **Rebuild fails**: Check `HERMES_REBUILD_HOOK` is correct and the hook URL is reachable from the server.
