# Authentication System

## Overview

The application uses `@sidebase/nuxt-auth` (wrapping NextAuth.js) for authentication. It supports a credentials-based login flow backed by a SQLite database.

## Components

### Configuration
*   **Module**: `@sidebase/nuxt-auth`
*   **Provider**: `Credentials`
*   **Config File**: `nuxt.config.ts`
*   **Auth Handler**: `server/api/auth/[...].ts`

### User Database
Users are stored in `data/users.sqlite`.
*   **Schema**: `id`, `username`, `password` (hashed), `is_admin`, `is_approved`.
*   **Passwords**: Hashed using `bcrypt`.

### Login Flow
1.  User enters credentials on `/login`.
2.  Frontend uses `signIn()` from `useAuth()`.
3.  `server/api/auth/[...].ts` validates credentials against the database.
4.  On success, a session is created (JWT).

### First Run Setup
When the application is started for the first time (no users in DB):
1.  Frontend checks `/api/users/auth/checkFirstUser`.
2.  If `isFirstUser` is true, the `SetupAdminAccount` modal is shown.
3.  User enters a username and password.
4.  Request is sent to `/api/users/auth/setupAdmin`.
5.  Server verifies no users exist, hashes the password, and creates the first admin user.

### Admin Features
*   **Create User**: Admins can create new users. The initial password is empty.
*   **Set Password**: Users with an empty password (newly created) are prompted to set a password upon first login attempt.
*   **Approve User**: New users (if self-registration were enabled) or manually created users must have `is_approved = 1` to log in.

## Security Considerations
*   **Password Storage**: Passwords are never stored in plain text.
*   **Session Management**: handled by NextAuth (JWT).
*   **Race Conditions**: The initial admin setup uses a transaction to prevent race conditions where multiple admins could be created simultaneously.
