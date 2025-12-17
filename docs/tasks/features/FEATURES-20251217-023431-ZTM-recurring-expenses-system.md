---
id: FEATURES-20251217-023431-ZTM
status: pending
title: Recurring Expenses System
priority: high
created: 2025-12-17 02:34:31
category: features
dependencies: []
type: feature
---

# Recurring Expenses System

## Context
Many expenses are regular (Rent, Subscriptions, Salary). Manually entering these every month is tedious. The user requested a system to handle "Scheduled Entry" for things like mobile bills or mortgages.

## Requirements
1.  **Data Model**:
    *   New table `recurring_expenses` to store templates: `amount`, `description`, `category`, `frequency` (Monthly, Weekly, Yearly), `next_due_date`, `active`.
2.  **Management UI**:
    *   A new tab or section in "Settings" (or a dedicated "Recurring" tab) to View, Add, Edit, and Delete recurring rules.
3.  **Generation Logic**:
    *   System needs to detect when a due date has passed.
    *   Create the actual expense record in the `expenses` table.
    *   Update the `next_due_date` in the recurring rule.
4.  **Trigger**:
    *   Since this is a personal app without a guaranteed always-on server, we should trigger the check **on user login** or **app launch**.
    *   Optionally: Show a "Review" modal: "The following recurring expenses were added: ..."

## Proposed Implementation
1.  **Database**:
    *   Create `recurring.sqlite` or add table to existing DB.
2.  **API**:
    *   `GET /api/recurring`: List rules.
    *   `POST /api/recurring`: Create rule.
    *   `POST /api/recurring/process`: Trigger the check-and-generate logic.
3.  **Frontend**:
    *   Call `process` endpoint on `app.vue` mount or Dashboard load.
    *   UI for managing rules.

## Verification
*   Create a recurring expense "Test Rent" due yesterday.
*   Refresh/Relogin.
*   Verify "Test Rent" appears in the Expense List.
*   Verify the rule's `next_due_date` has advanced.
