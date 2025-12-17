---
id: FEATURES-20251217-023351-BUN
status: pending
title: Auto-fill Category from Description
priority: medium
created: 2025-12-17 02:33:51
category: features
dependencies: []
type: task
---

# Auto-fill Category from Description

## Context
Currently, when adding an expense, the user must select a Category manually, even if they have entered a Description that they have used many times before (e.g., "Lunch", "Uber"). To speed up data entry, the system should predict the category based on the description.

## Requirements
1.  **Reverse-Mapping**: When the user selects or types a Description in the expense form:
    *   Check if this Description has been used previously.
    *   If found, retrieve the *Category* associated with the most recent usage of this Description.
    *   Automatically set the Category field to this value.
2.  **User Override**: The user must be able to change the Category manually if the auto-fill is incorrect for this specific instance.
3.  **Performance**: The lookup should be instantaneous.

## Proposed Implementation
1.  **Backend**:
    *   Update `/api/descriptions` (or create a new endpoint) to return not just unique descriptions, but also their most recent category.
    *   Alternatively, create a specific endpoint `/api/descriptions/predict?text=...` if the dataset is large. Given the current scale, sending a map of `{ description: defaultCategory }` might be efficient enough.
2.  **Frontend**:
    *   In `ExpenseForm.vue`, watch the `description` model.
    *   On change, lookup the category and update the `category` model if it's currently empty or the user hasn't manually locked it (or just always update it, as it's a "suggestion"). *Decision: Always update, as user can change it back.*

## Verification
*   Add an expense with Description "Test" and Category "Food".
*   Open the form again.
*   Type/Select "Test" in Description.
*   Verify Category automatically switches to "Food".
