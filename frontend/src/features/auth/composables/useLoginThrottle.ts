import { onUnmounted, ref } from 'vue'

export function useLoginThrottle(cooldownSeconds: number = 60) {
  const isThrottled = ref(false)
  const remainingTime = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const startThrottle = () => {
    isThrottled.value = true
    remainingTime.value = cooldownSeconds

    if (timer) clearInterval(timer)

    timer = setInterval(() => {
      remainingTime.value -= 1
      if (remainingTime.value <= 0) {
        if (timer) clearInterval(timer)
        isThrottled.value = false
      }
    }, 1000)
  }

  const resetThrottle = () => {
    if (timer) clearInterval(timer)
    isThrottled.value = false
    remainingTime.value = 0
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    isThrottled,
    remainingTime,
    startThrottle,
    resetThrottle,
  }
}
