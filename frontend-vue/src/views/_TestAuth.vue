<template>
    <div class="p-6 space-y-4">
        <h1 class="text-xl font-bold">Test Auth (sementara)</h1>
        <div class="flex gap-2">
            <button class="border px-3 py-1" @click="doLogin">Login</button>
            <button class="border px-3 py-1" @click="doProfile">Get Profile</button>
            <button class="border px-3 py-1" @click="doPeriods">Get Periods</button>
            <button class="border px-3 py-1" @click="doSimulate401">Hapus Cookie + Panggil Periods</button>
        </div>
        <pre class="bg-muted p-4 text-xs whitespace-pre-wrap">{{ result }}</pre>
        <p class="text-xs text-muted-foreground">Cookie saat ini: {{ cookie }}</p>
    </div>
</template>

<script setup lang="ts">
import { api } from '@/lib/api'
import { ref } from 'vue'

const result = ref('Belum ada request')
const cookie = ref(document.cookie)

const doLogin = async () => {
    try {
        // Sesuaikan payload dengan backend lokal kamu
        const res = await api.post('/auth/login', {
            email: 'admin@aumo.local',
            password: 'password',
        })
        result.value = JSON.stringify(res, null, 2)
        cookie.value = document.cookie
    } catch (e: any) {
        result.value = `LOGIN GAGAL: ${e.status} ${JSON.stringify(e.data)}`
    }
}

const doProfile = async () => {
    try {
        result.value = JSON.stringify(await api.get('/auth/me'), null, 2)
    } catch (e: any) {
        result.value = `PROFILE GAGAL: ${e.status}`
    }
}

const doPeriods = async () => {
    try {
        result.value = JSON.stringify(await api.get('/periods'), null, 2)
    } catch (e: any) {
        result.value = `PERIODS GAGAL: ${e.status}`
    }
}

const doSimulate401 = async () => {
    // Hapus cookie sesi, lalu panggil API yang butuh auth
    // Harusnya redirect SEKALI ke /auth/login?redirectTo=/ _test-auth
    document.cookie = 'AumoFinance.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    await doPeriods()
}
</script>