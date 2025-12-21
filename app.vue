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
/* Global styles are now imported from ~/assets/css/main.css */
</style>

<style scoped>
.app-wrapper {
  width: 100%;
  min-height: 100vh;
}
</style>
