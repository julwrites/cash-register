---
id: FEATURES-20251215-013844-ATZ
status: completed
title: Add Sorting to Expense Table
priority: medium
created: 2025-12-15 01:38:44
category: features
dependencies: []
type: task
---

# Add Sorting to Expense Table

## Objective
Allow users to sort the expense list by Date, Amount, Category, or Description.

## Context
The current expense table supports pagination and filtering but lacks sorting. Users cannot easily see the largest expenses or group by category visually.

## Requirements
1.  **Backend**:
    - Update `fetchExpensesPaginated` to accept `sortBy` and `sortOrder` parameters.
    - Implement dynamic `ORDER BY` clause in the SQL query.
2.  **Frontend**:
    - Make table headers clickable to toggle sort order.
    - Pass sort parameters to the API.
    - Show sort indicators (arrows) in headers.

## Acceptance Criteria
- Clicking a header sorts the table by that column.
- Clicking again toggles Ascending/Descending.
- Sorting works in conjunction with Filtering and Pagination.

## Implementation Notes
- Implemented dual-path sorting in backend:
  - Optimized path for default sort (Date DESC).
  - "Fetch-All-Sort-Slice" path for other sort options to handle cross-year sorting correctly.
- Updated `ExpenseTable` to support `UTable` sorting.
- Enabled sorting only in "All" view mode to preserve "Recent" view semantics.
