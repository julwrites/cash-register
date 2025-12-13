---
id: REVIEW-20251213-021759-ZSN
status: completed
title: Codebase Gap Analysis
priority: medium
created: 2025-12-13 02:17:59
category: review
dependencies: []
type: task
---

# Codebase Gap Analysis

An in-depth review of the codebase was conducted to identify technical, security, and user experience gaps.

## Findings

### 1. Security (Critical)
*   **Plaintext Passwords**: User passwords are stored in plain text in the `users` database table.
*   **Username Enumeration**: The login API reveals whether a username exists before asking for a password, allowing attackers to enumerate valid users.
*   **Recommendation**: Migrate to a secure authentication system (NextAuth) and hash passwords.

### 2. Architecture
*   **Documentation vs. Implementation**: `docs/architecture/README.md` states that `@sidebase/nuxt-auth` is used, but the actual code implements a custom, manual JWT authentication system.
*   **Recommendation**: Refactor authentication to match the documentation (NextAuth), simplifying maintenance and improving security.

### 3. User Experience (Admin)
*   **Missing Approval UI**: The backend has an endpoint `approveUser`, but the Admin Dashboard (`pages/admin.vue`) lacks a UI control to trigger it. Admin users cannot approve pending registrations via the UI.
*   **Recommendation**: Add an "Approve" button to the Admin Dashboard.

### 4. User Experience (General)
*   **Blocking Alerts**: The application uses the browser's native `alert()` function for error handling and notifications, which blocks the UI and provides a poor experience.
*   **Recommendation**: Replace `alert()` with non-blocking Toast notifications (using Nuxt UI).

### 5. Performance
*   **Full Data Load**: The `fetchExpenses` API loads *all* expenses from *all* yearly databases into memory on every request. This will not scale as data grows.
*   **Recommendation**: Implement pagination for the expense list.

### 6. Code Quality & Infrastructure
*   **Database Patterns**: Synchronous `better-sqlite3` calls are unnecessarily wrapped in Promises. Database connection management is inconsistent (Singleton vs. New Connection per request).
*   **Test Coverage**: Test coverage is low.
*   **Dead Code**: `server/api/expenses/descriptions.ts` is unused and duplicates logic found in `server/api/descriptions/index.ts`.
*   **Recommendation**: Refactor database access patterns, remove dead code, and increase test coverage.

## Outcomes
The following tasks have been created to address these gaps:
*   [Security] Migrate Authentication to NextAuth
*   [Features] Add User Approval to Admin Dashboard
*   [Presentation] Replace Blocking Alerts with Toasts
*   [Features] Implement Pagination for Expenses
*   [Foundation] Refactor Database Access and Improve Tests
