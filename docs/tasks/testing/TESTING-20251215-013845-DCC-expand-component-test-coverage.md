---
id: TESTING-20251215-013845-DCC
status: pending
title: Expand Component Test Coverage
priority: medium
created: 2025-12-15 01:38:45
category: testing
dependencies: []
type: task
---

# Expand Component Test Coverage

## Objective
Increase confidence in UI stability by adding unit tests for key components.

## Context
Currently, `tests/components/` only contains `app.test.ts`. Complex components like `ExpenseForm.vue` and `ExpenseTable.vue` are untested.

## Requirements
1.  **Test Creation**:
    - Add tests for `ExpenseForm.vue` (validation, emission of events).
    - Add tests for `ExpenseTable.vue` (rendering rows, emitting actions).
    - Add tests for `ExpenseFilters.vue` (updating filters).
2.  **Tooling**:
    - Use `@nuxt/test-utils` and `vitest`.

## Acceptance Criteria
- Key components have associated test files.
- Tests pass.
- Tests verify core functionality (rendering, interaction).
