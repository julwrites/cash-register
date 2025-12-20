<template>
  <ClientOnly>
    <UButton
      :icon="isDark ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid'"
      color="gray"
      variant="ghost"
      aria-label="Theme"
      @click="isDark = !isDark"
    />
    <template #fallback>
      <div class="fallback-placeholder" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set (val) {
    colorMode.preference = val ? 'dark' : 'light'
  }
})
</script>

<style scoped>
.fallback-placeholder {
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
}
</style>
