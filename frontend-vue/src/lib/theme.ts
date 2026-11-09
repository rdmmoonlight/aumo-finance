import { useColorMode } from '@vueuse/core'

export const colorMode = useColorMode({
    storageKey: 'theme',
    attribute: 'class',
    modes: {
        light: 'light',
        dark: 'dark',
    },
    initialValue: 'auto',
})

export type ThemeMode = 'auto' | 'light' | 'dark'

export function setTheme(mode: ThemeMode) {
    colorMode.value = mode
}