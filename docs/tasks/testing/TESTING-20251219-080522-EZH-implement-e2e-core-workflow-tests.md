---
id: TESTING-20251219-080522-EZH
status: completed
title: Implement E2E Core Workflow Tests
priority: medium
created: 2025-12-19 08:05:22
category: testing
dependencies:
type: task
---

# Implement E2E Core Workflow Tests

## Objective
Implement end-to-end (E2E) tests for the core workflows of the application using Playwright. This ensures that critical user paths (Login, Add Expense, View Expense, Edit Expense) are functioning correctly and prevents regressions.

## Context
The application currently has unit and component tests (Vitest), and uses temporary Python scripts for manual/agent verification. We need a permanent E2E test suite integrated into the project and CI.

## Implementation Plan
1.  **Install Playwright**: Add `@playwright/test` to devDependencies. (Completed)
2.  **Configuration**: Create `playwright.config.ts`. (Completed)
    *   Use `webServer` to launch the Nuxt app in a test mode (`DATA_DIR=./data-e2e`).
    *   Target Chromium.
    *   Base URL: `http://localhost:14322`.
3.  **Test Scenarios**: (Completed)
    *   **Setup/Login**: Handle the "First User" setup flow if DB is empty, or standard Login.
    *   **Add Expense**: Fill out the form and submit. Verify toast/update.
    *   **View Expense**: Check the Expense List table for the added entry.
    *   **Edit Expense**: Modify the entry and verify changes.
4.  **CI Integration**: Update `.github/workflows/ci.yml` to include an E2E test step. (Completed)

## Security Considerations
*   Ensure E2E tests do not run against production data (enforce `DATA_DIR` separation).
*   Do not commit secrets in test config (use env vars).

## References
*   `docs/architecture/README.md`
*   `AGENTS.md`

## Actual Effort
*   Verified the implementation of E2E tests.
*   Ran tests locally to confirm they pass.
*   Debugged environmental flakiness in local testing.
