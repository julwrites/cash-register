---
id: PRESENTATION-20251223-083101-RRN
status: pending
title: Fix Frontend Styling and Logic Gaps
priority: medium
created: 2025-12-23 08:31:01
category: presentation
dependencies:
type: task
---

# Fix Frontend Styling and Logic Gaps

## Description
A review of the frontend code revealed several inconsistencies in styling and gaps in logic/responsiveness. This task aims to address them to ensure a consistent and robust user experience.

## Subtasks

### 1. Standardize Typography
- **Goal**: Ensure consistent font sizes and weights for page and section titles across the application.
- **Files**:
  - `components/settings/AdminSettings.vue`
  - `components/settings/CategorySettings.vue`
  - `pages/expense-list.vue`
  - `components/Dashboard.vue`
  - `components/EditExpenseModal.vue`
  - `pages/login.vue`
  - `components/auth/SetupAdminAccount.vue`
- **Action**: Use `.page-title` and `.section-title` CSS classes (or consistent values matching `assets/css/main.css`) for all headers.

### 2. Fix `ExpenseForm` Reactivity
- **Goal**: Ensure the `ExpenseForm` component correctly updates when the `expense` prop changes (e.g., when switching between expenses in the Edit Modal).
- **Files**: `components/ExpenseForm.vue`
- **Action**: Add a `watch` on `props.expense` to update `expenseData`.

### 3. Fix `useCategories` Sorting Logic
- **Goal**: Fix the sorting logic in `useCategories.ts` which currently returns boolean values instead of numbers (-1, 0, 1).
- **Files**: `composables/useCategories.ts`
- **Action**: Change `a.id > b.id` to `a.id - b.id` and `a.name > b.name` to `a.name.localeCompare(b.name)`.

### 4. Implement Responsive Tables for Settings
- **Goal**: Ensure Admin and Category settings tables are usable on mobile devices.
- **Files**:
  - `components/settings/AdminSettings.vue`
  - `components/settings/CategorySettings.vue`
- **Action**: Implement a "Card View" for mobile screens (similar to `ExpenseTable.vue`) using standard CSS media queries.

## Acceptance Criteria
- All page titles have the same font size and weight.
- Editing different expenses in the Dashboard correctly populates the form each time.
- Categories are correctly sorted by ID and Name.
- Admin and Category settings pages display a list of cards on mobile devices instead of a horizontally scrolling table.
- All changes maintain the "Plain CSS" requirement (no Tailwind utilities for layout).
