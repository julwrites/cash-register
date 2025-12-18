---
id: PRESENTATION-20251217-170600-VRS
status: review_requested
title: Header and Layout Redesign
priority: medium
created: 2025-12-17 17:06:00
category: presentation
dependencies:
type: task
---

# Header and Layout Redesign

## Description
The current layout uses custom scoped CSS and hardcoded colors which contradicts the usage of Nuxt UI (Tailwind CSS). This task aims to modernize the application layout by refactoring the global header and main page structure to use Tailwind utility classes and Nuxt UI configuration.

## Plan
1.  **Unify Color System**: Create `app.config.ts` to set the Nuxt UI primary color to 'blue', matching the legacy `#007bff`.
2.  **Refactor Header**: Rewrite `layouts/default.vue` to use Tailwind classes (`flex`, `sticky`, `bg-primary-600`) and remove custom CSS.
3.  **Refactor Page Layout**: Rewrite `pages/index.vue` to use `UContainer` and utility classes.
4.  **Responsive Design**: Ensure the header adapts gracefully to mobile screens using standard Tailwind breakpoints.

## Implementation Details
- **Theme**: Blue primary, Cool gray.
- **Header**: Sticky top, primary background, white text.
- **Navigation**: `UTabs` integrated into the header.
