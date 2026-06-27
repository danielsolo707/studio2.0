"""
Hermes Agent -> Next.js Site Bridge

Copy this file into your Hermes Agent skills folder on the server, for example:
  ~/hermes-agent/skills/site_bridge.py

Environment variables required:
  HERMES_SITE_URL       - public URL of the Next.js site (e.g. https://motionverse.design)
  HERMES_REMOTE_SECRET  - the same secret set in the site's .env.local
  HERMES_REBUILD_HOOK   - optional deploy hook URL for /rebuild
"""

import os
import requests

SITE_URL = os.getenv("HERMES_SITE_URL", "").rstrip("/")
SECRET = os.getenv("HERMES_REMOTE_SECRET", "")
REBUILD_HOOK = os.getenv("HERMES_REBUILD_HOOK", "")


def _post(path: str, payload: dict) -> dict:
    if not SITE_URL:
        raise RuntimeError("HERMES_SITE_URL is not set")
    if not SECRET:
        raise RuntimeError("HERMES_REMOTE_SECRET is not set")

    url = f"{SITE_URL}/api/hermes-remote{path}"
    body = {"secret": SECRET, **payload}
    response = requests.post(url, json=body, timeout=30)
    response.raise_for_status()
    return response.json()


def site_health() -> str:
    """Check site health."""
    data = _post("/health", {})
    if not data.get("ok"):
        return f"Site health check failed: {data.get('error', 'unknown')}"
    return (
        f"Site OK. Projects: {data.get('projectCount', 0)}, "
        f"DB latency: {data.get('dbLatencyMs')}ms, "
        f"time: {data.get('timestamp')}"
    )


def list_messages(limit: int = 5) -> str:
    """List recent contact messages."""
    data = _post("/messages", {"action": "list", "limit": limit})
    messages = data.get("messages", [])
    if not messages:
        return "No contact messages."

    lines = []
    for message in messages:
        status = "UNREAD" if not message.get("isRead") else "read"
        text = message.get("message", "")[:120]
        lines.append(
            f"[{status}] {message.get('name')} <{message.get('email')}>: {text}..."
        )
    return "\n".join(lines)


def reply_to_message(message_id: str, to: str, subject: str, body: str) -> str:
    """Draft and save a reply to a contact message."""
    _post(
        "/messages",
        {
            "action": "reply",
            "messageId": message_id,
            "to": to,
            "subject": subject,
            "body": body,
        },
    )
    return f"Reply to {to} saved."


def mark_message_read(message_id: str) -> str:
    """Mark a contact message as read."""
    _post("/messages", {"action": "mark-read", "messageId": message_id})
    return f"Message {message_id} marked as read."


def list_projects() -> str:
    """List all portfolio projects."""
    data = _post("/projects", {"action": "list"})
    projects = data.get("projects", [])
    if not projects:
        return "No projects."
    return "\n".join(
        f"- {p.get('id')}: {p.get('name')} ({p.get('category', 'N/A')})"
        for p in projects
    )


def create_project(project: dict) -> str:
    """Create a new portfolio project."""
    _post("/projects", {"action": "create", "project": project})
    return f"Project '{project.get('name')}' created."


def update_project(project_id: str, updates: dict) -> str:
    """Update an existing portfolio project."""
    _post("/projects", {"action": "update", "projectId": project_id, "updates": updates})
    return f"Project '{project_id}' updated."


def rebuild_site() -> str:
    """Trigger a site rebuild via the configured hook."""
    _post("/site/rebuild", {"hook": REBUILD_HOOK} if REBUILD_HOOK else {})
    return "Rebuild triggered."


def rollback_site(commits: int = 1) -> str:
    """Rollback the site's git repo by N commits. Use with caution."""
    data = _post("/site/rollback", {"commits": commits})
    return f"Rolled back {commits} commit(s). Target: {data.get('target', 'unknown')}."


def heal_site() -> str:
    """Diagnose site health and attempt a safe fix."""
    try:
        return site_health()
    except Exception as error:
        return f"Health check failed: {error}. Try /rebuild or check server logs."


def notify(text: str, level: str = "info") -> str:
    """Forward a notification to Telegram via the site."""
    _post("/notify", {"text": text, "level": level})
    return "Notification forwarded to Telegram."


if __name__ == "__main__":
    # Quick sanity test when run directly on the server.
    print(site_health())
    print(list_messages(2))
