---
id: FEATURES-20251215-013843-THI
status: completed
title: Refactor Expense Charts to use Server-Side Aggregation
priority: high
created: 2025-12-15 01:38:43
category: features
dependencies: []
type: task
---

# Refactor Expense Charts to use Server-Side Aggregation

## Objective
Improve performance and scalability by moving chart data aggregation to the server.

## Context
Currently, the frontend fetches *all* expense records (via `fetchExpenses`) to calculate totals for charts. This is inefficient and will not scale as the number of records grows.

## Requirements
1.  **Backend**:
    - Create or update API endpoints to return aggregated data:
        - Income vs Expenses (Total Income, Total Expenses).
        - Expenses by Category (Category Name, Total Amount).
    - Ensure aggregation respects filters (Date Range).
2.  **Frontend**:
    - Update `ExpenseList.vue` and chart components to consume the new aggregated API.
    - Remove the `fetchExpenses` (fetch all) call.

## Acceptance Criteria
- [x] Charts display correct data based on selected filters.
- [x] Network requests return small aggregated payloads instead of full datasets.
- [x] Performance is improved (verifiable via network tab size/time).

## Implementation Details
- Added `getExpenseSummary` to `server/utils/expense-service.ts` to perform server-side aggregation (Income/Expense totals, Category breakdown).
- Created API endpoint `server/api/expenses/summary.ts`.
- Updated `composables/useExpenses.ts` to fetch summary data instead of full expense list.
- Updated `pages/expense-list.vue` to use aggregated data for charts.
- Added unit tests `tests/backend/expenses-summary.test.ts`.
