---
id: PRESENTATION-20251217-023416-COM
status: pending
title: Mobile Bottom Navigation
priority: medium
created: 2025-12-17 02:34:16
category: presentation
dependencies: []
type: task
---

# Mobile Bottom Navigation

## Context
Top-level tabs are difficult to reach on mobile devices. A standard "Bottom Navigation Bar" is the preferred pattern for mobile apps, improving ergonomics for one-handed use.

## Requirements
1.  **Mobile Only**: On screens smaller than 768px (MD breakpoint), hide the top tabs and show a fixed bottom navigation bar.
2.  **Navigation Items**:
    *   Add Record (Primary action, perhaps emphasized?)
    *   Expense List
    *   Dashboard
    *   Settings
3.  **Logout**: Move the Logout button out of the main header (or keep it as a small icon) to avoid clutter. Ideally, place it inside the Settings page or top-right profile menu.
4.  **Layout**: Ensure the main content has enough bottom padding so the last item isn't covered by the fixed nav bar.
5.  **Safe Area**: Respect iOS safe areas (iPhone X+ home indicator).

## Proposed Implementation
1.  **Component**: Create `MobileNavBar.vue`.
2.  **Layout**: In `index.vue` (or `default.vue` layout):
    *   Use `visible md:invisible` for the bottom bar.
    *   Use `invisible md:visible` for the top tabs.
3.  **Styling**: Use `fixed bottom-0 w-full z-50`.

## Verification
*   Resize browser to mobile width.
*   Verify Top Tabs disappear and Bottom Bar appears.
*   Verify navigation works between tabs.
*   Verify no content is hidden behind the bar.
