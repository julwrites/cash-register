---
id: FOUNDATION-20251213-021945-OIP
status: verified
title: Refactor Database Access and Improve Tests
priority: medium
created: 2025-12-13 02:19:45
category: foundation
dependencies: []
type: task
---

# Refactor Database Access and Improve Tests

## Objective
Clean up technical debt related to database access patterns and improve test coverage.

## Context
*   `server/api/expenses/expenses-db.ts` and others wrap synchronous `better-sqlite3` calls in Promises unnecessarily.
*   Database connection management is inconsistent (Singleton vs. New Connection).
*   Test coverage is low.
*   `server/api/expenses/descriptions.ts` is unused dead code.

## Requirements
1.  **Refactor DB Logic**:
    *   [x] Remove unnecessary `Promise` wrappers around `better-sqlite3` calls.
    *   [x] Standardize on a Singleton pattern (or cached connection pool) for database connections to avoid re-opening files on every request.
2.  **Remove Dead Code**:
    *   [x] Delete `server/api/expenses/descriptions.ts`.
3.  **Increase Test Coverage**:
    *   [x] Add unit tests for the refactored database logic.
    *   [x] Add integration tests for critical API endpoints (Expenses, Categories).

## Implementation Details
*   Refactored `expenses-db.ts` to return synchronous `better-sqlite3` `Database` instances, cached by year.
*   Refactored `descriptions-db.ts` to be synchronous and handle migrations idiomatically using transactions.
*   Refactored `categories-db.ts` to be synchronous and use singleton pattern.
*   Updated all consumers in `server/api/expenses` and `server/api/categories` to use the new synchronous API.
*   Added comprehensive unit/integration tests in `tests/backend/` for `expenses-db`, `descriptions-db`, and `categories-db`.
*   Removed unused `server/api/expenses/descriptions.ts`.

## Verification
*   Ran `npm run test` -> All tests passed (existing + new).
*   Ran `npm run lint` -> Passed.

## Acceptance Criteria
*   Database code is idiomatic (synchronous where appropriate) and consistent.
*   Dead code is removed.
*   Test coverage is increased (target: >50% for backend logic).
