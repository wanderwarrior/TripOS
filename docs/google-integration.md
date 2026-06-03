# Google Workspace integration (Gmail + Drive)

Lets each agency connect its **own** Google account to:

- **Send proposals from Gmail** — the proposal PDF is emailed from the agency's
  own address (replies land in their inbox), instead of a generic sender.
- **Save documents to Drive** — every proposal PDF is filed into a per-trip
  folder under a `TripCraft/` root in the agency's Drive.

Both are **owner-gated** and opt-in per agency from **Settings → Integrations**.

## Why this design

- **Per-agency, BYO account** — mirrors the existing WhatsApp/Razorpay pattern.
  Tokens live on the `GoogleConnection` model, refresh token encrypted at rest
  via [`crypto.ts`](../src/lib/crypto.ts).
- **Standalone OAuth, not Auth.js** — app login is Credentials/JWT only. We run
  our own consent flow with `access_type=offline` to get a long-lived refresh
  token for background sends. Code: [`src/lib/google/`](../src/lib/google/).
- **Minimal, non-restricted scopes** — `gmail.send`, `drive.file`,
  `userinfo.email`. None are "restricted", so **no Google CASA security
  assessment (and no fee) is required**. Reading the inbox (`gmail.readonly`)
  is intentionally *not* included — that's a future, paid phase.

## One-time Google Cloud setup (free, ~10 min)

1. Go to <https://console.cloud.google.com/> → create/select a project.
2. **APIs & Services → Enable APIs**: enable **Gmail API** and **Google Drive API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** (or Internal if you only connect Workspace accounts in your org).
   - Fill app name, support email, developer email.
   - **Scopes**: add `.../auth/gmail.send`, `.../auth/drive.file`,
     `.../auth/userinfo.email`, `openid`.
   - While in **Testing**, add the agency Google accounts as **Test users**.
     To go live for any account, click **Publish app** (these scopes only need
     the basic verification form — no CASA assessment).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized redirect URI**:
     `https://YOUR_DOMAIN/api/integrations/google/callback`
     (and `http://localhost:3000/api/integrations/google/callback` for dev).
   - Copy the **Client ID** and **Client secret**.

## App configuration

Add to `.env`:

```bash
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_APP_URL="https://YOUR_DOMAIN"   # must match the redirect URI host
# Recommended in production — encrypts stored tokens (else NEXTAUTH_SECRET is used)
CREDENTIALS_KEY="$(openssl rand -base64 32)"
```

Apply the schema (adds the `GoogleConnection` model + `Trip.driveFolderId`):

```bash
npm run db:push
```

## Using it

1. Agency **owner** → Settings → Integrations → **Connect Google account**.
2. Complete Google consent.
3. On a trip's **proposal preview**, the owner/staff now see **Save to Drive**
   and **Email via Gmail** actions (shown only when the agency is connected and
   the matching toggle is on).

## Files

| Area | File |
|---|---|
| OAuth (auth URL, token exchange/refresh, revoke) | `src/lib/google/oauth.ts` |
| Connection store + access-token refresh | `src/lib/google/connection.ts` |
| Gmail send (MIME + attachments) | `src/lib/google/gmail.ts` |
| Drive folders / upload / share | `src/lib/google/drive.ts` |
| Connect / callback routes | `src/app/api/integrations/google/{connect,callback}/route.ts` |
| Proposal actions (Drive save, Gmail email) | `src/server/actions/google-share.ts` |
| Settings UI | `src/components/settings/google-integration-card.tsx` |

## Not included (future, paid phase)

- **Inbound supplier-email parsing** needs `gmail.readonly` (a **restricted**
  scope → annual Google CASA security assessment, ~$500–$4.5k/yr). Deferred by
  design — everything above stays free.
- Traveler document vault + folder sharing UI (the `shareFolder` /
  `uploadToDrive` primitives exist in `drive.ts`; the UI is not wired yet).
