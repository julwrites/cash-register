import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import ColorModeButton from '~/components/ColorModeButton.vue'

const colorModeMock = {
  value: 'light',
  preference: 'light'
}

mockNuxtImport('useColorMode', () => {
  return () => colorModeMock
})

describe('ColorModeButton', () => {
  const globalOptions = {
      stubs: {
        ClientOnly: {
          template: '<div><slot /></div>'
        }
      }
    }

  it('renders correctly', async () => {
    const wrapper = mount(ColorModeButton, { global: globalOptions })
    expect(wrapper.exists()).toBe(true)
  })

  it('toggles color mode on click', async () => {
    const wrapper = mount(ColorModeButton, { global: globalOptions })

    // Reset mock
    colorModeMock.value = 'light'
    colorModeMock.preference = 'light'

    // Click button
    const ubutton = wrapper.findComponent({ name: 'UButton' })
    if (ubutton.exists()) {
        await ubutton.trigger('click')
    } else {
        await wrapper.find('button').trigger('click')
    }

    expect(colorModeMock.preference).toBe('dark')
  })

  it('displays correct icon based on mode', async () => {
    // Dark mode -> Sun icon (to switch to light)
    colorModeMock.value = 'dark'
    const wrapperDark = mount(ColorModeButton, { global: globalOptions })
    // Check for sun icon. The class format might vary (colon vs hyphen)
    expect(wrapperDark.html()).toContain('sun-20-solid')

    // Light mode -> Moon icon (to switch to dark)
    colorModeMock.value = 'light'
    const wrapperLight = mount(ColorModeButton, { global: globalOptions })
    expect(wrapperLight.html()).toContain('moon-20-solid')
  })
})
