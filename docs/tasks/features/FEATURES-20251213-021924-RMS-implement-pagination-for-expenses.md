---
id: FEATURES-20251213-021924-RMS
status: pending
title: Implement Pagination for Expenses
priority: medium
created: 2025-12-13 02:19:24
category: features
dependencies: []
type: feature
---

# Implement Pagination for Expenses

## Objective
Implement pagination for the Expense List to improve performance and scalability.

## Context
*   Currently, `server/api/expenses/index.ts` fetches *all* expenses from all years.
*   This will cause performance issues as the dataset grows.

## Requirements
1.  **Backend Update**: Update `/api/expenses` to accept `page` and `limit` (or `offset` and `limit`) query parameters.
    *   Logic might need to handle pagination across multiple yearly database files (or simpler: filter by year range or just load latest first). *Decision needed on cross-year pagination strategy.*
    *   Suggestion: Only load current year by default, or paginate within years.
2.  **Frontend Update**: Update `pages/expense-list.vue` (or `ExpenseList` component) to fetch data in chunks.
    *   Add "Load More" or Page Number controls.

## Acceptance Criteria
*   The API does not return the full dataset unless requested.
*   The UI allows users to view older expenses via pagination controls.
