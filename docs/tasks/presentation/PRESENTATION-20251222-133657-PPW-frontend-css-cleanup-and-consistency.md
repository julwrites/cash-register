---
id: PRESENTATION-20251222-133657-PPW
status: completed
title: Frontend CSS Cleanup and Consistency
priority: medium
created: 2025-12-22 13:36:57
category: presentation
dependencies:
type: task
---

# Frontend CSS Cleanup and Consistency

## Task Information
- **Dependencies**: None

## Task Details
Review and clean up frontend CSS to ensure consistency and adherence to the design system.

### Scope
1.  **Remove Empty Dark Mode Blocks**: Scan components for empty `:global(.dark)` blocks (e.g., `/* Handled by vars */`) and remove them if they serve no functional purpose, or standardize them.
2.  **Audit Redundant Scoped Styles**: Identify and remove scoped styles that duplicate global utility classes (e.g., `.page-title` in `pages/expense-list.vue` vs `main.css`).
3.  **Fix Hardcoded Units**: In `pages/settings.vue`, replace hardcoded pixel values (padding, font-size) with `rem` units to match the rest of the application.
4.  **Verify Global Class Usage**: Ensure components use `var(--color-...)` variables consistently and don't introduce ad-hoc styles where global classes or variables exist.

### Acceptance Criteria
- [ ] No empty `:global(.dark)` blocks in Vue components.
- [ ] `.page-title` class is consistent across pages and uses the global definition where possible.
- [ ] `pages/settings.vue` uses `rem` units.
- [ ] CSS variables are used for all color definitions.

## Implementation Status
### Completed Work
- [ ] Created task

### Blockers
None
