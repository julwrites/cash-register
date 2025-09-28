<script setup>
console.log('App.vue setup');
</script>

<template>
  <UContainer>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UContainer>
</template>