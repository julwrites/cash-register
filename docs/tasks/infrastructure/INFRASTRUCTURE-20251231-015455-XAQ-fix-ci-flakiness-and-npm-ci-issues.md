---
id: INFRASTRUCTURE-20251231-015455-XAQ
status: in_progress
title: Fix CI flakiness and npm ci issues
priority: high
created: 2025-12-31 01:54:55
category: infrastructure
dependencies:
type: task
---

# Fix CI flakiness and npm ci issues

## Context
CI is experiencing frequent failures in E2E tests and `npm ci` steps. This is disrupting the development workflow.

## Goals
1.  Resolve `npm ci` consistency issues, likely caused by `package-lock.json` drift (mixed package managers).
2.  Identify and fix flaky E2E tests in `tests/e2e/`.

## Plan
1.  Regenerate `package-lock.json` using `npm install` to ensure it matches `package.json` exactly.
2.  Analyze and debug E2E tests (Playwright) to fix timeouts or race conditions.
