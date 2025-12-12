---
id: INFRASTRUCTURE-20251212-121403-TQK
status: completed
title: Replace Cloudflare pipeline with Build and Test
priority: medium
created: 2025-12-12 12:14:03
category: infrastructure
dependencies:
type: task
---

# Replace Cloudflare pipeline with Build and Test

## Context
The user wants to remove an obsolete Cloudflare Pages pipeline and replace it with a standard build and test pipeline that follows the repository architecture.
The current `ci.yml` uses `pnpm` but the repo has `package-lock.json`. It did not have any test steps.

## Plan
1.  **Add Testing Infrastructure**:
    *   [x] Install `vitest` and `@nuxt/test-utils` and `happy-dom`.
    *   [x] Add `test` script to `package.json`.
    *   [x] Create a sample test file `tests/basic.test.ts`.
    *   [x] Create `vitest.config.ts`.
2.  **Create New Pipeline**:
    *   [x] Create `.github/workflows/build-and-test.yml`.
    *   [x] Use `npm` to match `package-lock.json`.
    *   [x] Include `build` and `test` jobs.
3.  **Cleanup**:
    *   [x] Remove `.github/workflows/ci.yml`.

## Status
- [x] Install dependencies and update package.json
- [x] Create sample test
- [x] Create new workflow file
- [x] Remove old workflow file
- [x] Verify locally

## Verification
- Ran `npm run test` -> Passed (with one warning about nuxt colors but test passed).
- Ran `npm run build` -> Passed.
- Pipeline config uses `npm ci` matching the `package-lock.json` file.
