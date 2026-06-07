# Changes

This file documents modifications made to the upstream project in compliance with
Section 4(b) of the Apache License, Version 2.0.

## Upstream

- **Original project:** [Dave-lab12/leyu-backend](https://github.com/Dave-lab12/leyu-backend)
- **License:** Apache License 2.0
- **Fork:** [iCog-Labs-Dev/hyperdata-backend](https://github.com/iCog-Labs-Dev/hyperdata-backend)

The upstream `LICENSE` file is retained unmodified in the repository root.
Any copyright headers present in upstream source files are preserved.

## Modifications

All changes made in this fork relative to the upstream `leyu-backend` are
tracked in the Git history of this repository. The list below summarizes the
notable categories of modification; consult `git log` for the authoritative
record.

### Bootstrap, error handling, and configuration safety
- Removed a duplicate `ProjectModule` registration from `AppModule`.
- Registered `AllExceptionsFilter` globally and added consistent formatting for
  array-style validation errors.
- Sanitized credential-bearing URLs (Database, Redis, RabbitMQ) in startup logs.
- Blocked wildcard `CORS_ORIGIN` in production and tightened CORS configuration
  (explicit methods, allowed headers, credentials).
- Removed a stray `console.log` of the database URL from `src/database/data-source.ts`.
- Expanded `.env.example` with previously undocumented variables
  (`NODE_ENV`, `AFRO_SMS_API_KEY`, `AFRO_SMS_API_SECRET`, `CORS_ORIGIN`,
  `LOG_LEVEL`).

### CI / deployment pipeline
- Replaced placeholder unit-test and lint jobs in `.gitlab-ci.yml` with real
  `npm ci` + `npm run test` / `npm run lint` invocations.
- Fixed the `push_iamge` job name typo to `push_image`.
- Parameterized the deploy SSH target via `DEPLOY_HOST` / `DEPLOY_USER`
  environment variables instead of a hard-coded IP.
- Added a post-deploy `/api/health` smoke-test job.

### Documentation
- Updated `README.md` to reflect the Apache 2.0 license and upstream attribution.
- Added this `CHANGES.md` file.

## How to record future changes

When making non-trivial modifications, add a short entry under a new dated
section below (or extend an existing category) so downstream users can identify
what diverges from upstream.

<!--
## YYYY-MM-DD
- Short description of change
-->
