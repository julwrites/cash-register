---
date: 2025-12-14
title: "Authentication Failure due to Password Hash Truncation"
tags: []
created: 2025-12-14 14:14:57
---

Authentication failures were caused by truncated password hashes in the `users` database. The `users` table schema previously defined the `password` column as `VARCHAR(50)`, while `bcrypt` hashes are 60 characters long. Although SQLite does not natively enforce `VARCHAR` length limits, the truncated data suggests an external constraint (e.g., seeding tool, strict ORM, or migration script) enforced the 50-character limit. The issue was resolved by changing the column type to `TEXT` and implementing a runtime check in `users-db.ts` to detect and rehash truncated admin passwords (length < 60).
