---
id: FEATURES-20251213-021844-NXA
status: review_requested
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
*   Admin sees an "Approve" option for Pending users.
*   Clicking "Approve" changes the user's status to Active/Approved in the UI and Database.

## Progress
- [x] UI Update: Added "Approve" action to Pending users in Admin Dashboard.
- [x] API Integration: Connected to `server/api/users/admin/approveUser.ts`.
- [x] Feedback: Added Toast notifications for success/error.
- [x] Bug Fix: Fixed `removeUser` reactivity and variable casing issues.

## Implementation Details
- Modified `pages/admin.vue` to use `computed` for table rows to fix reactivity.
- Added `approveUser` function and updated `actions` logic to show appropriate actions based on user status.
- Integrated `useToast` for user feedback.
- Added unit tests in `tests/pages/admin.test.ts`.
