---
id: SECURITY-20251213-021824-YED
status: pending
title: Migrate Authentication to NextAuth
priority: high
created: 2025-12-13 02:18:24
category: security
dependencies: []
type: task
---

# Migrate Authentication to NextAuth

## Objective
Replace the current manual JWT authentication implementation with `@sidebase/nuxt-auth` (NextAuth.js) to improve security, maintainability, and align with project documentation.

## Context
*   Current implementation uses manual JWT signing and verification in `server/api/users/auth`.
*   Passwords are currently stored in plain text.
*   Documentation states the project uses `@sidebase/nuxt-auth`.

## Requirements
1.  **Configure NextAuth**: Enable and configure `@sidebase/nuxt-auth` in `nuxt.config.ts`.
2.  **Credentials Provider**: Implement a NextAuth Credentials Provider that verifies users against the SQLite database.
3.  **Password Hashing**: Implement secure password hashing (e.g., using `bcrypt` or `argon2`) when creating users and verifying logins.
    *   Migration: Create a script or strategy to hash existing plaintext passwords (or force reset).
4.  **Remove Legacy Auth**: Remove `server/api/users/auth/login.ts`, `checkAdmin.ts`, and other manual auth endpoints if replaced by NextAuth.
5.  **Update Frontend**: Update `pages/login.vue` and protected routes to use the `useAuth()` composable from `@sidebase/nuxt-auth`.

## Acceptance Criteria
*   Users can log in using the NextAuth flow.
*   Passwords are hashed in the database.
*   `server/api/users/auth` manual JWT logic is removed.
*   Admin protection works on API and Frontend routes.
