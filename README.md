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

## Notes

- Letters are now stored in Postgres through `api/letters.js`.
- Notification and Twilio flow has been removed.
