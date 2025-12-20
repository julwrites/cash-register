<template>
  <div class="app-wrapper">
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<style>
:root {
  /* Tailwind Blue-600 */
  --color-primary-600: #2563eb;
  /* Tailwind Blue-100 */
  --color-primary-100: #dbeafe;
  /* Tailwind Gray-50 */
  --color-gray-50: #f9fafb;
  /* Tailwind Gray-900 */
  --color-gray-900: #111827;
}

.dark {
  /* Dark mode overrides if needed, though usually handled via classes on html */
  --color-bg-default: var(--color-gray-900);
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>

<style scoped>
.app-wrapper {
  width: 100%;
  min-height: 100vh;
}
</style>
