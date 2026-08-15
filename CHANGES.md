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

## 2026-08-10

### Authentication hardening

- Rejected inactive accounts during JWT and refresh-token authentication.
- Added rotating, revocable opaque refresh sessions backed by persistent storage.
- Replaced predictable OTPs with CSPRNG-generated, HMAC-protected, single-use
  codes with transactional attempt exhaustion.
- Enabled strict request property whitelisting and replaced self-service profile
  mass assignment with an explicit update allowlist.
- Added fail-closed Redis throttling for authentication, signup, and verification
  endpoints, with explicit trusted-proxy hop configuration.
- Added atomic refresh rotation, password-reset revocation, and cleanup of expired
  or old revoked sessions.
- Added short-lived onboarding-only tokens and revoked active sessions when
  passwords change or accounts are disabled.
### Production containment and infrastructure access
- Disabled test event endpoints and the Bull Board queue administration UI in production.
- Restricted task redistribution to platform administrators.
- Disabled withdrawals by default and introduced configuration validation for the
  withdrawal and payment-provider settings.
- Removed public Docker port mappings for PostgreSQL, Redis, RabbitMQ, and the
  RabbitMQ management UI; added Redis authentication and non-default RabbitMQ
  credentials for the private application network.
- Added a credential-rotation runbook for local infrastructure and external
  payment, SMS, and email providers.

### Financial integrity
- Added validated withdrawal amounts, atomic wallet reservations, payout state
  tracking, ES256 Santim Pay request signing, and scheduled provider-status
  reconciliation.
- Added migration-level constraints for valid ledger signs, non-negative wallet
  balances, non-negative task payment rates, and unique provider references.
- Prevented task payment-rate changes after task distribution starts.
- Made dataset wallet credits idempotent by locking the dataset row and recording
  contributor/reviewer payment completion in the same transaction as the ledger
  credit.
- Added unit coverage for payout signing and withdrawal reservation validation.

## How to record future changes

When making non-trivial modifications, add a short entry under a new dated
section below (or extend an existing category) so downstream users can identify
what diverges from upstream.

## Commit policy

- Before committing implementation changes, record a concise, dated summary in
  this file.
- Split commits by cohesive behavior or deployable concern, and use Conventional
  Commit messages such as `fix(finance): reserve payout funds atomically`.
- Do not include documentation-only files in implementation commits. The sole
  exception is this file, which may be committed separately to record the
  corresponding modifications.

<!--
## YYYY-MM-DD
- Short description of change
-->
