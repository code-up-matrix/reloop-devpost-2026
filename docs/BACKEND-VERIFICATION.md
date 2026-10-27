# ReLoop: live backend evidence

Verified 2026-10-27T17:13:35.226175+00:00. **31 live assertions passed** against this production URL and its dedicated Neon database. All inputs were synthetic.

The real product API and persistence path passed.

- Anonymous history, invalid access codes and foreign origins are rejected.
- Successful login uses Secure, HttpOnly, SameSite=Strict cookies; judge workspaces are isolated.
- The authenticated cleanup handler removed expired run, limiter and receipt fixtures. Its automatic scheduler invocation remains unobserved.
- Three concurrent one-unit claims against two available units produced exactly two successes. Only the donor could confirm a handover, once.

The database is in Frankfurt on the existing Free plan. The deployed pooled TLS connection uses app_service with table CRUD permissions and no inherited roles, superuser, database/role creation, replication, RLS bypass or schema creation privileges. Migrations use a separate direct app_owner connection. Both source migrations and all eight shared tables were verified.

Exact deployment, database and assertion records are in [live-backend-verification.json](../live-backend-verification.json). The tested application code is commit `7b3147f6a7a4c9ba642c2465f3de157460d80a48`; later documentation-only commits do not change that code. The runner lives in the combined source repository at scripts/verify-live-backends.py on devpost/portfolio-2026.

Browser rendering was checked separately; authenticated browser form submission was not exercised in this API run. Workspace identity remains appropriate for controlled demos. General consumer identity/recovery, backup restoration, budgets, record retention, sponsor success, event eligibility, demo video and final submission still require acceptance as applicable.
