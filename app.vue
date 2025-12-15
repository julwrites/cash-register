<template>
  <UContainer class="app-container">
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </UContainer>
</template>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
