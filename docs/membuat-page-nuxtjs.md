Membuat halaman baru CRUD di Nuxt 3 dengan skema yang sudah kita pakai ini sebenarnya sangat cepat karena pola strukturnya sudah terbentuk.

Secara garis besar, ada **3 langkah utama**:

---

### Langkah 1: Buat File-File Endpoint API

Buat file handler backend di folder `server/api/v1/[nama-fitur]/`.

Misalnya kamu mau buat halaman **Suppliers** (`server/api/v1/suppliers/`):

1. **`index.get.ts`** (Fetch List)
```typescript
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event) // Samakan dengan rujukan periods/COA
  return await prisma.suppliers.findMany({
    where: { UserId: userId }
  })
})

```


2. **`index.post.ts`** (Create)
```typescript
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const body = await readBody(event)
  return await prisma.suppliers.create({
    data: { ...body, UserId: userId }
  })
})

```


3. **`[id]/index.put.ts`** (Update)
```typescript
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  return await prisma.suppliers.update({
    where: { Id: id },
    data: body
  })
})

```


4. **`[id]/index.delete.ts`** (Delete)
```typescript
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  return await prisma.suppliers.delete({
    where: { Id: id }
  })
})

```



---

### Langkah 2: Buat Halaman Frontend (`pages/`)

Buat file halaman baru di folder `pages/`, contoh: `pages/suppliers.vue`.

**Template Dasarnya:**

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'default' // Otomatis memakai topbar global
})

// 1. State Data
const items = ref([])
const isLoading = ref(false)

// 2. Fetch Function
const fetchItems = async () => {
  isLoading.value = true
  try {
    const res: any = await $fetch('/api/v1/suppliers')
    items.value = Array.isArray(res) ? res : res?.items || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchItems)
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto p-4">
    <!-- UI Header, Table & Modal Modals -->
  </div>
</template>

```

---

### Langkah 3: Daftarkan ke Menu Navigasi (Sidebar)

Agar halaman baru bisa diakses dari menu samping, tambahkan *route link*-nya ke file komponen **`components/AppSidebar.vue`** (atau file konfigurasi navigasi kamu).

Contoh penambahan di daftar `links`:

```typescript
{
  label: 'Suppliers',
  icon: 'i-lucide-truck',
  to: '/suppliers'
}

```

---

### Ringkasan Alur Kerja Singkat:

1. **Prisma:** Pastikan `model` sudah ada di `schema.prisma` (lalu jalankan `npx prisma generate` jika ada perubahan).
2. **Server:** Buat folder API `server/api/v1/[fitur]/` (`index.get`, `index.post`, `[id]/index.put`, `[id]/index.delete`).
3. **Pages:** Buat file `pages/[fitur].vue` (copy-paste struktur dasar dari `coa.vue` / `periods.vue`).
4. **Sidebar:** Tambahkan menu di `AppSidebar.vue`.
