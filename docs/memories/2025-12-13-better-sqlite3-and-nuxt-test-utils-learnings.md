---
date: 2025-12-13
title: "Better-SQLite3 and Nuxt Test Utils Learnings"
tags: ["backend", "database", "testing", "nuxt-auth"]
created: 2025-12-13 08:16:37
---

1. `better-sqlite3` is synchronous. Avoid wrapping calls in Promises. Use cached connection instances (Singleton pattern) to avoid overhead.\n2. `better-sqlite3` returns `RunResult` object for insert/update operations. The ID of the inserted row is `lastInsertRowid`, not `lastID` (which is used by `sqlite3` driver).\n3. When testing Nuxt applications using `@nuxt/test-utils` with `environment: 'nuxt'` and `nuxt-auth` module, you must define `AUTH_ORIGIN` in `vitest.config.ts` (e.g., `env: { AUTH_ORIGIN: 'http://localhost:3000' }`) to avoid 'AUTH_NO_ORIGIN' errors during test startup.
