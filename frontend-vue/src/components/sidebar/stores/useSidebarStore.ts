import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export const useSidebarStore = defineStore('sidebar', () => {
    const open = ref<boolean>(true)
    const openMobile = ref<boolean>(false)
    const isMobile = ref<boolean>(false)

    const state = computed<'expanded' | 'collapsed'>(() => (open.value ? 'expanded' : 'collapsed'))
    const isCollapsed = computed(() => state.value === 'collapsed')

    function initFromCookie() {
        const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        if (cookie) {
            open.value = cookie.split('=')[1] !== 'false'
        }
    }

    function setOpen(value: boolean) {
        open.value = value
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }

    function toggleSidebar() {
        if (isMobile.value) {
            openMobile.value = !openMobile.value
        } else {
            setOpen(!open.value)
        }
    }

    function checkIsMobile() {
        isMobile.value = window.innerWidth < 768
    }

    return {
        open,
        openMobile,
        isMobile,
        state,
        isCollapsed,
        initFromCookie,
        setOpen,
        toggleSidebar,
        checkIsMobile,
    }
})