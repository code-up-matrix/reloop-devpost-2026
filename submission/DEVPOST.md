# ReLoop

Reserve surplus and count only confirmed handovers.

DRAFT — not submitted. Event: https://arbiter-hacks-v1.devpost.com/

## Inspiration

A surplus listing is not the same as a completed reuse. ReLoop separates offers, reservations and donor-confirmed handovers.

## What it does

Lists usable materials, atomically reserves available units and lets only the donor confirm each handover once. The impact view counts confirmed, self-declared mass.

## How it was built

Next.js provides the listing and claim workflow. PostgreSQL performs bounded stock updates and confirmation checks, with signed workspaces, ownership controls and same-origin protection.

## Challenges

Concurrent claims must not oversell inventory or inflate the impact ledger. The integration tests exercise contention and donor-only confirmation against PostgreSQL.

## What is verified

Six standalone tests and the production build pass. No real-world waste reduction or emissions savings have been measured.

## Technical lessons

An impact metric should reflect the event it actually measures. Confirmed declared mass is more defensible than treating every listing as a diversion from landfill.

## Next steps

Resolve the event's student eligibility requirement, deploy with a dedicated database and conduct a small consented reuse trial before making outcome claims.

## Judging requirements

Maps to Rethinking Waste: confirmed reuse for impact, atomic reservation for technology, a small local exchange for feasibility and a two-workspace demonstration. Student eligibility remains a submission hold.

## Demo sequence

1. List a clearly labeled synthetic surplus item.
2. Reserve units from a second workspace.
3. Show that an excessive or competing claim cannot oversell.
4. Confirm once as the donor and inspect the confirmed-mass ledger.

## Authorship

Prepared with ChatGPT/Codex assistance. Shared Next.js/workspace infrastructure originates in code-up-matrix/axios-fx-compliance-agent; the product module was developed on 27 October 2026. Shared code must be disclosed under the event’s reuse rules.

## Outstanding artifacts

Repository: https://github.com/code-up-matrix/reloop-devpost-2026. The deployed demo URL, required video, private judge access and entrant declarations must be completed from real outputs. No success receipt is claimed.
