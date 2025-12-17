---
id: PRESENTATION-20251217-023449-LKZ
status: pending
title: Mobile Card View for Expenses
priority: medium
created: 2025-12-17 02:34:49
category: presentation
dependencies: []
type: task
---

# Mobile Card View for Expenses

## Context
The `UTable` component works well on desktop but forces horizontal scrolling on mobile, hiding the "Actions" column. This makes editing/deleting difficult and reading data cumbersome.

## Requirements
1.  **Responsive Layout**:
    *   **Desktop (> MD)**: Keep existing Table view.
    *   **Mobile (< MD)**: Render a list of **Cards**.
2.  **Card Design**:
    *   Display: Date, Category, Description, Amount.
    *   Layout:
        *   Top: Date (Left), Amount (Right).
        *   Middle: Description (Bold).
        *   Bottom: Category (Chip/Badge) + Action Buttons (Edit/Delete).
3.  **Visuals**:
    *   Color-code Amount: Green for Credit (Income), Red for Debit (Expense).
4.  **Performance**:
    *   Ensure rendering 50+ cards is performant.

## Proposed Implementation
1.  **Component**: Refactor `ExpenseTable.vue`.
2.  **Logic**:
    *   Use a `div` wrapper.
    *   Use `v-if` or CSS `display` to toggle between `<UTable>` and `<div class="mobile-cards">`.
    *   Iterate over `entries` to render cards.

## Verification
*   Open Expense List on mobile width.
*   Verify no horizontal scroll.
*   Verify all data is visible.
*   Verify Edit/Delete buttons work.
