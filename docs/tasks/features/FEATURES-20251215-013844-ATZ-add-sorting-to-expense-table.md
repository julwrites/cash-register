---
id: FEATURES-20251215-013844-ATZ
status: pending
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
