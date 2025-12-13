---
id: PRESENTATION-20251213-021904-TQK
status: completed
title: Replace Blocking Alerts with Toasts
priority: medium
created: 2025-12-13 02:19:04
category: presentation
dependencies: []
type: task
---

# Replace Blocking Alerts with Toasts

## Objective
Improve user experience by replacing native browser `alert()` calls with non-blocking Toast notifications.

## Context
*   The application currently uses `window.alert()` for success and error messages (e.g., in `pages/expense-form.vue`, `pages/login.vue`).
*   Nuxt UI (`@nuxt/ui`) provides a Toast component that should be used instead.

## Requirements
1.  **Identify Usages**: Find all instances of `alert()` in the codebase.
2.  **Implement Toasts**: Replace them with `useToast()` from Nuxt UI.
    *   Success messages -> Green toast.
    *   Error messages -> Red toast.

## Acceptance Criteria
*   No `alert()` calls remain in the application code.
*   Success/Error feedback is displayed using non-blocking UI notifications.
