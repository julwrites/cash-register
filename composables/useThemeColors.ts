import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export const useThemeColors = () => {
  const colorMode = useColorMode()

  // Default values to prevent errors before hydration
  const colors = ref({
    text: '#374151',
    grid: '#e5e7eb',
    background: '#ffffff',
    primary: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
  })

  // Reactive palette
  const palette = ref([
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6',
    '#0EA5E9', '#22C55E', '#EAB308', '#818CF8', '#D946EF', '#A855F7',
  ])

  const updateColors = () => {
    if (typeof window === 'undefined') return

    const style = getComputedStyle(document.documentElement)

    // Helper to get variable or fallback
    const getVar = (name: string, fallback: string) => {
      const val = style.getPropertyValue(name).trim()
      return val || fallback
    }

    colors.value = {
      text: getVar('--color-chart-text', '#374151'),
      grid: getVar('--color-chart-grid', '#e5e7eb'),
      background: getVar('--color-bg-card', '#ffffff'),
      primary: getVar('--color-primary', '#3b82f6'),
      success: getVar('--color-success', '#10b981'),
      danger: getVar('--color-danger', '#ef4444'),
      warning: '#f59e0b',
    }

    palette.value = [
      getVar('--color-chart-1', '#3B82F6'),
      getVar('--color-chart-2', '#EF4444'),
      getVar('--color-chart-3', '#10B981'),
      getVar('--color-chart-4', '#F59E0B'),
      getVar('--color-chart-5', '#6366F1'),
      getVar('--color-chart-6', '#EC4899'),
      getVar('--color-chart-7', '#8B5CF6'),
      getVar('--color-chart-8', '#0EA5E9'),
      getVar('--color-chart-9', '#22C55E'),
      getVar('--color-chart-10', '#EAB308'),
      getVar('--color-chart-11', '#818CF8'),
      getVar('--color-chart-12', '#D946EF'),
      getVar('--color-chart-13', '#A855F7'),
    ]
  }

  let observer: MutationObserver | null = null

  onMounted(() => {
    updateColors()

    // Observe for class changes on html element to detect dark mode toggle
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateColors()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  // Watch for color mode changes as well
  watch(colorMode, () => {
    // Small delay to ensure DOM has updated
    setTimeout(updateColors, 50)
  }, { flush: 'post' })

  return {
    colors,
    palette,
    isDark: computed(() => colorMode.value === 'dark')
  }
}
