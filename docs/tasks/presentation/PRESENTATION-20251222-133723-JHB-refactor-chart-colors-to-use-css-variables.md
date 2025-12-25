---
id: PRESENTATION-20251222-133723-JHB
status: completed
title: Refactor Chart Colors to use CSS Variables
priority: medium
created: 2025-12-22 13:37:23
category: presentation
dependencies:
type: task
---

# Refactor Chart Colors to use CSS Variables

## Task Information
- **Dependencies**: None

## Task Details
The current implementation of Chart.js components (`IncomeExpenseChart.vue`, `ExpensesByCategoryChart.vue`) uses hardcoded hex values in the JavaScript logic to handle Dark Mode switching. This creates a maintenance gap where changing the theme in `main.css` does not update the charts.

The goal is to refactor this logic to use a centralized source of truth for colors, preferably derived from the CSS variables.

### Scope
1.  **Analyze Current Usage**: Identify all hardcoded colors in chart components.
2.  **Develop Solution**:
    *   Create a composable (e.g., `useThemeColors`) or utility that extracts color values from the computed styles of the document or provides a reactive object mapped to the CSS variables.
    *   Ensure the solution is reactive to `useColorMode()` changes.
3.  **Refactor Components**: Update `IncomeExpenseChart.vue` and `ExpensesByCategoryChart.vue` to use this new utility instead of hardcoded hex strings.
4.  **Centralize Palette**: Refactor the hardcoded category color palette in `Dashboard.vue` (and other places if any) to use a shared constant or CSS variables.

### Acceptance Criteria
- [ ] Chart colors (grid lines, text, tooltips) match the `main.css` theme variables automatically.
- [ ] Changing a color in `main.css` reflects in the charts (after reload or reactivity update).
- [ ] No hardcoded hex values in Chart components for theme-dependent colors.
- [ ] Category colors are consistent across the app.

## Implementation Status
### Completed Work
- [ ] Created task

### Blockers
None
