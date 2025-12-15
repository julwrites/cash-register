---
id: INFRASTRUCTURE-20251215-144424-MHH
status: completed
title: Fix Auth Redirects to Respect Base URL Environment Variable
priority: medium
created: 2025-12-15 14:44:24
category: infrastructure
dependencies:
type: bug
---

# Fix Auth Redirects to Respect Base URL Environment Variable

Ensure redirects use AUTH_ORIGIN or NEXTAUTH_URL and respect the requested URL.
