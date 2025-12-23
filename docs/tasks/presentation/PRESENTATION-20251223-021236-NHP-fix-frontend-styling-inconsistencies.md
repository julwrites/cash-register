---
id: PRESENTATION-20251223-021236-NHP
status: completed
title: Fix Frontend Styling Inconsistencies
priority: medium
created: 2025-12-23 02:12:36
category: presentation
dependencies:
type: task
---

# Fix Frontend Styling Inconsistencies

## Description
Review frontend code and styling for consistency and completeness. Fix identified gaps including invalid CSS and hardcoded pixel values.

## Changes
- **EditExpenseModal.vue**:
    - Fixed invalid `font-weight: semibold` to `font-weight: 600`.
    - Changed `font-size: 18px` to `1.125rem` for consistency.
    - Updated `max-width` from `90vw` to `32rem` to prevent excessive width on desktop.
- **IncomeExpenseChart.vue**:
    - Updated height from `300px` to `18.75rem`.
- **ExpensesByCategoryChart.vue**:
    - Updated height from `300px` to `18.75rem`.
- **SummaryCards.vue**:
    - Updated `min-height` from `32px` to `2rem`.

## Verification
- Verified visually using Playwright script.
- Confirmed correct computed styles for chart height and modal styling.
