---
id: PRESENTATION-20251221-014054-RPS
status: verified
title: Fix Dark Mode and Layout Margins
priority: medium
created: 2025-12-21 01:40:54
category: presentation
dependencies:
type: task
---

# Fix Dark Mode and Layout Margins

## Description
The application had numerous hardcoded hex color values in the CSS, which made dark mode inconsistent and difficult to maintain. This task standardizes the color palette using CSS variables defined in `app.vue` and refactors key components to use these variables. (Layout margins were also reviewed and found to be consistent with the design system, requiring no changes.)

## Plan
1.  **Define CSS Variables**: Add comprehensive color palette (Gray, Primary, Red, Green) to `app.vue`.
2.  **Refactor Components**: Replace hardcoded hex values with `var(--color-name)` in:
    - `pages/index.vue`
    - `pages/expense-form.vue`
    - `pages/expense-list.vue`
    - `pages/admin.vue`
    - `components/ExpenseTable.vue`
    - `components/SummaryCards.vue`
    - `components/MobileNavBar.vue`
    - `components/Dashboard.vue`
    - `components/RecurringExpenses.vue`
3.  **Verify**: Ensure tests pass and application builds.

## Implementation Details
- Added Tailwind-compatible color palette to `:root` in `app.vue`.
- Updated `.dark` overrides to use appropriate variables.
- Removed hardcoded hex values from component styles.
