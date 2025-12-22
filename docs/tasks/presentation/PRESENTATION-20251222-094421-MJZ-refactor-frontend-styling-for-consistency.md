---
id: PRESENTATION-20251222-094421-MJZ
status: review_requested
title: Refactor Frontend Styling for Consistency
priority: medium
created: 2025-12-22 09:44:21
category: presentation
dependencies:
type: task
---

# Refactor Frontend Styling for Consistency

## Goal
Standardize frontend styling by replacing hardcoded hex colors with global CSS variables defined in `assets/css/main.css`. This ensures consistent theming and proper dark mode support across the application.

## Changes
1.  **Define Missing Variables**:
    *   Added `--color-border-card` to `assets/css/main.css` to support card borders in tables.

2.  **Refactor Page Styles**:
    *   `pages/admin.vue`: Replaced hardcoded status colors (green, red) and spinner colors with `--color-success`, `--color-danger`, and `--color-primary`.
    *   `pages/user-settings.vue`: Replaced hardcoded border colors with `--color-border`.
    *   `pages/settings.vue`: Replaced hardcoded colors for headers, text, and backgrounds with semantic tokens (`--color-text-body`, `--color-bg-subtle`, etc.).
    *   `pages/manage-categories.vue`: Replaced hardcoded border colors with `--color-border`.

3.  **Clean Up**:
    *   Removed redundant `:global(.dark)` blocks that are no longer needed since CSS variables handle mode switching automatically.

## Verification
*   Manual code inspection verified that all hardcoded colors map to their appropriate semantic variables.
*   `npm run lint` passed (warnings unrelated to changes).
*   `npm run test` passed.
