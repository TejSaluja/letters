# letters

Love letters app with shared cross-device persistence.

## Setup

1. Install dependencies.
2. Connect a Vercel Postgres database to this project.
3. Make sure the Postgres environment variables are available locally and in Vercel.
4. Start the app.

```bash
npm install
npm run dev
```

Or with pnpm:

```bash
pnpm install
pnpm dev
```

To run both the frontend and API routes locally (including password login), use Vercel dev:

```bash
npx vercel dev
```

Or via npm script:

```bash
npm run dev:vercel
```

## Notes

- Letters are now stored in Postgres through `api/letters.js`.
- Notification and Twilio flow has been removed.

## Authentication

- App access is protected with a password checked server-side by `api/auth.js`.
- Required environment variables:
  - `LETTER_APP_PASSWORD`: shared password used for login.
  - `LETTER_APP_SESSION_SECRET`: long random secret used to sign login sessions.
- Never commit real secret values to git.
