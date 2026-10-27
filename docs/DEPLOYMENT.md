# ReLoop: deployment

Use a dedicated Vercel project and Postgres database. The intended team is team_64IDAvx3sgtTRCQpQavfF3cG (emmanuel-dukes-projects); team access is authorized and the app is hosted at https://reloop-devpost-2026.vercel.app.

1. Repository: https://github.com/code-up-matrix/reloop-devpost-2026. Preserve SOURCE.json and the MIT license.
2. A dedicated Neon database is now attached to this Vercel project. Reuse the identifiers in live-backend-verification.json; use separate databases/branches for development and previews. Use this directory as the Next.js project root.
3. Configure the names in .env.example in the provider secret store. Use an exact HTTPS APP_ORIGIN, random secrets of at least 32 characters, and independent access codes of at least 12 characters.
4. Run npm ci and npm run check, then npm run db:migrate using a direct, non-pooled app_owner DATABASE_URL against the selected database. The deployed app_service credential intentionally has no DDL privileges. Both migration files must apply; do not reset an existing database. The shared migration includes empty unused product tables for compatibility with the cleanup endpoint.
5. Deploy and verify the full browser, API, provider and database flow. Record real provider identifiers with secrets redacted.
6. Verify ownership, expiry, the daily cleanup cron, failure handling and private judge access. Record the event-specific demonstration only after this succeeds.

Provider requirements: Postgres atomic stock reservation and confirmation ledger.


## Operations

Workspace cookies last eight hours. Operator logins share an operator workspace; each judge login has a fresh identity. Saved run records expire after 24 hours and are physically removed by the daily cleanup job. The authenticated cleanup handler passed against expired fixtures; the next automatic daily scheduler invocation has not yet been observed. Manual deletion removes local records only. Product-specific handovers and game records do not have automatic deletion.

This access design is for a controlled hackathon demo. Before broad public use, add account recovery and stronger tenant identity, define retention, assign an operations owner, set budget limits and test database backup restoration. Vercel hosting is verified. Live database operations are verified in docs/BACKEND-VERIFICATION.md. Sponsor runs, event eligibility, required recordings and final submission remain pending where applicable.
