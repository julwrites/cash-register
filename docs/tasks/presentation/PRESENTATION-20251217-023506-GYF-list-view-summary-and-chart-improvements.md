---
id: PRESENTATION-20251217-023506-GYF
status: verified
title: List View Summary and Chart Improvements
priority: medium
created: 2025-12-17 02:35:06
category: presentation
dependencies: []
type: task
---

# List View Summary and Chart Improvements

## Context
The Expense List currently shows raw data but lacks immediate context. The user wants a "Mini Dashboard" here to see the totals for the current filter. Additionally, the existing charts need a review for polish.

## Requirements
1.  **List View Summary**:
    *   Add a summary section above the table/cards in `ExpenseList.vue`.
    *   Show: **Total Income**, **Total Expense**, **Net Balance**.
    *   **Reactivity**: These numbers must update instantly when filters (Date, Category) change.
2.  **Chart Polish**:
    *   Review `IncomeExpenseChart` and `ExpensesByCategoryChart`.
    *   Improve Tooltips (format currency).
    *   Ensure Colors are consistent and accessible (Dark mode support?).
    *   Verify responsiveness on mobile.

## Proposed Implementation
1.  **Summary**:
    *   Use the existing `expenseSummary` ref from `useExpenses`. It already fetches aggregated data based on filters!
    *   Create a `SummaryCards.vue` component to display the 3 metrics.
2.  **Charts**:
    *   Check `chart.js` options configuration.
    *   Add currency formatting to callbacks.

## Verification
*   Filter list to "Last Month".
*   Verify "Total Expense" matches the sum of the rows.
*   Hover over charts and verify tooltips show formatted currency (e.g., "$1,234.56").

## Implementation Details
- Created `components/SummaryCards.vue` for reusable summary display.
- Integrated `SummaryCards` into `pages/expense-list.vue` (visible in "All" mode).
- Updated `IncomeExpenseChart.vue` and `ExpensesByCategoryChart.vue` with currency formatting and responsive width.
- Added Charts to `components/Dashboard.vue` to expose them to the user.
