---
id: FEATURES-20251213-021844-NXA
status: completed
title: Add User Approval to Admin Dashboard
priority: medium
created: 2025-12-13 02:18:44
category: features
dependencies: []
type: story
---

# Add User Approval to Admin Dashboard

## Objective
Enable Admin users to approve pending user registrations directly from the Admin Dashboard UI.

## Context
*   The backend already has an endpoint `server/api/users/admin/approveUser.ts`.
*   The Admin UI (`pages/admin.vue`) currently only allows Promoting, Demoting, or Removing users.
*   Pending users (self-registered) cannot access the system until approved.

## Requirements
1.  **UI Update**: specific action button (e.g., "Approve") in the `actions` dropdown or a standalone button for users with `status: Pending`.
2.  **API Integration**: Connect the button to the existing `approveUser` endpoint.
3.  **Feedback**: Show a success message (Toast) upon approval and update the list to reflect the new status.

## Acceptance Criteria
*   [x] Admin sees an "Approve" option for Pending users.
*   [x] Clicking "Approve" changes the user's status to Active/Approved in the UI and Database.

## Implementation Details
*   Updated `pages/admin.vue` to include an "Approve" action for pending users.
*   Implemented `approveUser` method in `pages/admin.vue` which calls `/api/users/admin/approveUser`.
*   Fixed a bug in `server/api/users/admin/approveUser.ts` where it was passing `true` (boolean) to SQLite which requires `1` (integer).
*   Fixed a bug in `server/api/users/admin/createUser.ts` where it was passing `false` (boolean) to SQLite.
*   Added `tests/backend/approve-user.test.ts` to verify database logic for user approval.
*   Updated `tests/setup.ts` to use unique temporary directories for each test execution to avoid race conditions during parallel testing.
