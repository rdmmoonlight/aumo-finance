import { onMounted, onUnmounted, ref } from 'vue'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = ref<boolean>(false)

  let mql: MediaQueryList | null = null

  const onChange = (e: MediaQueryListEvent) => {
    isMobile.value = e.matches
  }

  onMounted(() => {
    mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    isMobile.value = mql.matches
    mql.addEventListener('change', onChange)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', onChange)
  })

  return isMobile
}
