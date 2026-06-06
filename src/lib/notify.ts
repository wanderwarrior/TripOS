import "server-only";

// Fire-and-forget admin notifications for time-sensitive events (new demo
// request, new trial signup) so the founder hears about them immediately
// instead of having to poll the owner console.
//
// Channel-agnostic: set ADMIN_NOTIFY_WEBHOOK_URL to any incoming webhook —
// Slack, Discord, a Telegram bot relay, Zapier/Make, etc. We POST a JSON body
// carrying the message under several common keys (`text`, `content`, `message`)
// so it works out-of-the-box with the popular targets. If the env var isn't
// set, this is a no-op (email remains the fallback notification).

export async function notifyAdmin(message: string): Promise<void> {
  const url = process.env.ADMIN_NOTIFY_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, content: message, message }),
      // Don't let a slow webhook hold up the user's request.
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Best-effort — never block or fail the user action on a notification.
  }
}
