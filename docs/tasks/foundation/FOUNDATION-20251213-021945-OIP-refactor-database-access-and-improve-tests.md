---
id: FOUNDATION-20251213-021945-OIP
status: review_requested
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
2.  **Remove Dead Code**: [x] Delete `server/api/expenses/descriptions.ts`.
3.  **Increase Test Coverage**:
    *   [x] Add unit tests for the refactored database logic.
    *   [x] Add integration tests for critical API endpoints (Expenses, Categories).

## Acceptance Criteria
*   Database code is idiomatic (synchronous where appropriate) and consistent.
*   Dead code is removed.
*   Test coverage is increased (target: >50% for backend logic).

## Implementation Details
* Refactored `expenses-db.ts`, `categories-db.ts`, `users-db.ts`, `settings-db.ts`, `descriptions-db.ts` to be synchronous and use cached connections.
* Updated all API handlers to use synchronous DB calls and `lastInsertRowid` instead of `lastID`.
* Deleted `server/api/expenses/descriptions.ts`.
* Added tests: `tests/backend/expenses-db.test.ts`, `tests/backend/expenses-api.test.ts`, `tests/backend/categories-api.test.ts`.
* Updated existing tests `tests/backend/users-db.test.ts` and `tests/backend/approve-user.test.ts` to match new API.
