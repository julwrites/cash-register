---
date: 2025-12-12
title: "Database Architecture"
tags: ["architecture", "database"]
created: 2025-12-12 13:27:28
---

The application uses SQLite (better-sqlite3) for data storage. Expense data is stored in separate, year-specific database files (expenses-{year}.sqlite). Shared data is stored in categories.sqlite, users.sqlite, descriptions.sqlite, and settings.sqlite.
