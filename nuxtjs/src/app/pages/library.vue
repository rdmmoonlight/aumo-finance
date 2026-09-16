<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8 md:px-10">
    <Head>
      <Title>Extraction Engine - Hypen Music Vault</Title>
    </Head>

    <div class="max-w- mx-auto">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div class="text- tracking-[0.3em] text-zinc-500 font-mono uppercase mb-2">System Pipeline</div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tight">Extraction Engine</h1>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/staging" class="inline-flex items-center px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-mono transition">
            STAGING BUFFER ({{ pendingRawCount }}) <Icon name="tabler:arrow-right" class="w-4 h-4 ml-2" />
          </NuxtLink>
          <NuxtLink to="/library" class="inline-flex items-center px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-sm font-mono font-bold transition">
            <Icon name="tabler:arrow-left" class="w-4 h-4 mr-2" /> LIBRARY ({{ completedSongsCount }})
          </NuxtLink>
        </div>
      </div>

      <!-- STATUS ALERT -->
      <div v-if="statusMsg" :class="['mb-6 rounded-xl border px-4 py-3 font-mono text-sm flex items-center gap-3', isError? 'bg-red-950/40 border-red-900 text-red-300' : 'bg-emerald-950/30 border-emerald-900 text-emerald-300']">
        <Icon :name="isError? 'tabler:alert-triangle' : 'tabler:info-circle'" class="w-5 h-5 shrink-0" />
        <p>{{ statusMsg }}</p>
      </div>

      <!-- INGEST GRID -->
      <div class="grid md:grid-cols-2 gap-6 mb-10">
        <!-- CARD 1: YOUTUBE -->
        <div class="rounded- bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
          <div class="text- font-mono tracking-widest text-zinc-500 uppercase mb-3">Source // Remote</div>
          <h3 class="text-xl font-bold mb-5">YouTube Stream Ingest</h3>

          <div class="flex flex-col gap-2 mb-4">
            <label class="text- font-mono text-zinc-400 uppercase">Playlist / Video ID</label>
            <input v-model="targetPlaylistId" type="text" placeholder="URL atau Playlist ID..."
              class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition" />
          </div>
          <button @click="fetchYouTubeToPreview" :disabled="isProcessing"
            class="mt-auto w-full bg-white text-black font-bold font-mono text-sm py-3.5 rounded-xl hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition flex justify-center items-center gap-2">
            <Icon v-if="isProcessing" name="tabler:loader-2" class="animate-spin w-4 h-4" />
            {{ isProcessing? 'PROCESSING...' : 'FETCH TO PREVIEW QUEUE' }}
          </button>
        </div>

        <!-- CARD 2: LOCAL -->
        <div class="rounded- bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
          <div class="text- font-mono tracking-widest text-zinc-500 uppercase mb-3">Source // Local Directory & Files</div>
          <h3 class="text-xl font-bold mb-5">Local Sync Ingest</h3>

          <div class="mb-4">
            <label class="text- font-mono text-zinc-400 uppercase mb-2 block">Scan Mode</label>
            <div class="flex bg-zinc-950 p-1 rounded-full border border-zinc-800 w-fit">
              <button @click="setUploadMode('folder')" :class="['px-4 py-1.5 rounded-full text-xs font-mono font-bold transition', uploadMode === 'folder'? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300']">Folder Scan</button>
              <button @click="setUploadMode('file')" :class="['px-4 py-1.5 rounded-full text-xs font-mono font-bold transition', uploadMode === 'file'? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300']">Multi Files</button>
            </div>
          </div>

          <div class="flex flex-col gap-2 mb-2">
            <label class="text- font-mono text-zinc-400 uppercase">Select {{ uploadMode === 'folder'? 'Directory' : 'Audio Files' }}</label>
            <!-- Folder Mode -->
            <input v-if="uploadMode === 'folder'" ref="folderInputRef" type="file" webkitdirectory directory multiple
              @change="handleLocalSyncSelection" :disabled="isProcessing"
              class="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 file:cursor-pointer cursor-pointer bg-zinc-950 border border-zinc-800 rounded-xl p-1" />
            <!-- File Mode -->
            <input v-else ref="fileInputRef" type="file" multiple accept=".mp3,.wav,.m4a,.flac,.ogg,.aac"
              @change="handleLocalSyncSelection" :disabled="isProcessing"
              class="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 file:cursor-pointer cursor-pointer bg-zinc-950 border border-zinc-800 rounded-xl p-1" />
          </div>
          <small class="text- text-zinc-500 font-mono mt-2">Pindai folder/direktori atau pilih berkas audio lokal secara langsung.</small>
        </div>
      </div>

      <!-- PREVIEW QUEUE -->
      <div v-if="extractedList.length > 0" class="rounded- bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <span class="font-mono text-xs tracking-widest text-zinc-300">PARSED QUEUE PREVIEW ({{ extractedList.length.toLocaleString() }})</span>
          <div class="flex items-center gap-3">
            <span class="text- font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">{{ readyToCommitCount.toLocaleString() }} READY TO COMMIT</span>
            <span v-if="duplicateCount > 0" class="text- font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">{{ duplicateCount.toLocaleString() }} IN DB</span>
            <button @click="clearPreview" :disabled="isProcessing" class="text- font-mono text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1 rounded-full transition">CLEAR QUEUE</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-zinc-950 text- font-mono uppercase text-zinc-500">
              <tr>
                <th class="px-6 py-3 w-12"><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="accent-white w-4 h-4 rounded bg-zinc-800 border-zinc-700" /></th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Source / ID</th>
                <th class="px-4 py-3">Artist</th>
                <th class="px-4 py-3">Title</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60">
              <tr v-for="(item, idx) in extractedList" :key="idx" :class="[item.isDuplicateInDb? 'bg-red-950/10 opacity-60' : 'hover:bg-zinc-800/50', 'transition']">
                <td class="px-6 py-3"><input type="checkbox" v-model="item.isSelected" :disabled="item.isDuplicateInDb" class="accent-white w-4 h-4 rounded bg-zinc-800 border-zinc-700 disabled:opacity-20" /></td>
                <td class="px-4 py-3">
                  <span v-if="item.isDuplicateInDb" :title="item.duplicateReason" class="inline-flex text- font-mono font-bold px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">EXISTS IN DB</span>
                  <span v-else class="inline-flex text- font-mono font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">NEW</span>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-zinc-400 truncate max-w-">{{ item.fileName }}</td>
                <td class="px-4 py-3 text-zinc-300">{{ item.artist || '—' }}</td>
                <td class="px-4 py-3 text-zinc-100 font-medium">{{ item.title || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button @click="saveSelectedToRaw" :disabled="isProcessing || readyToCommitCount === 0"
            class="bg-white text-black font-mono font-black text-sm px-8 py-3.5 rounded-full hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-2">
            <Icon v-if="isProcessing" name="tabler:loader-2" class="animate-spin w-4 h-4" />
            COMMIT {{ readyToCommitCount.toLocaleString() }} NEW SONGS TO STAGING
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ExtractedItem {
  fileName: string
  artist: string
  title: string
  isSelected: boolean
  isDuplicateInDb: boolean
  duplicateReason?: string
  sourceId?: string
}

const pendingRawCount = ref(128)
const completedSongsCount = ref(2450)
const statusMsg = ref('')
const isError = ref(false)
const isProcessing = ref(false)

const targetPlaylistId = ref('')
const uploadMode = ref<'folder' | 'file'>('folder')

const extractedList = ref<ExtractedItem[]>([])

const readyToCommitCount = computed(() => extractedList.value.filter(i => i.isSelected &&!i.isDuplicateInDb).length)
const duplicateCount = computed(() => extractedList.value.filter(i => i.isDuplicateInDb).length)
const isAllSelected = computed(() => {
  const selectable = extractedList.value.filter(i =>!i.isDuplicateInDb)
  return selectable.length > 0 && selectable.every(i => i.isSelected)
})

const setUploadMode = (mode: 'folder' | 'file') => {
  uploadMode.value = mode
}

const parseMetadataFromFilename = (name: string) => {
  const clean = name.replace(/\.[^/.]+$/, "")
  // Format: "Artist - Title" atau "Artist - Title (Official)"
  const parts = clean.split(' - ')
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() }
  }
  return { artist: '', title: clean }
}

const fetchYouTubeToPreview = async () => {
  if (!targetPlaylistId.value.trim()) {
    statusMsg.value = "Playlist / Video ID tidak boleh kosong."
    isError.value = true
    return
  }
  isProcessing.value = true
  isError.value = false
  statusMsg.value = "Fetching YouTube metadata..."
  try {
    // TODO: Ganti dengan API call asli: await $fetch('/api/youtube/extract', { body: { id: targetPlaylistId.value } })
    await new Promise(r => setTimeout(r, 1200))
    const mock = Array.from({ length: 6 }).map((_, i) => {
      const artist = `Artist ${i+1}`
      const title = `YT Song Title from ${targetPlaylistId.value.slice(0,8)} #${i+1}`
      return {
        fileName: `youtube:${targetPlaylistId.value.slice(0,11)}:${i}`,
        artist,
        title,
        isSelected: true,
        isDuplicateInDb: Math.random() < 0.15,
        duplicateReason: "Title hash already exists"
      } as ExtractedItem
    })
    extractedList.value = [...mock,...extractedList.value]
    statusMsg.value = `Berhasil parse ${mock.length} items dari YouTube.`
  } catch (e:any) {
    isError.value = true
    statusMsg.value = e.message || "Gagal fetch YouTube."
  } finally {
    isProcessing.value = false
  }
}

const handleLocalSyncSelection = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  isProcessing.value = true
  isError.value = false
  statusMsg.value = `Scanning ${files.length} files...`

  await new Promise(r => setTimeout(r, 400)) // simulasi async hash check

  const existingDbMock = new Set(['duplicate song', 'test - exists']) // mock check

  const newItems: ExtractedItem[] = Array.from(files).map(f => {
    const { artist, title } = parseMetadataFromFilename(f.name)
    const isDup = existingDbMock.has(f.name.toLowerCase()) || existingDbMock.has(title.toLowerCase())
    return {
      fileName: f.name,
      artist,
      title,
      isSelected:!isDup,
      isDuplicateInDb: isDup,
      duplicateReason: isDup? "Filename hash match" : undefined,
      sourceId: (f as any).webkitRelativePath || f.name
    }
  })

  extractedList.value = [...newItems,...extractedList.value]
  statusMsg.value = `${newItems.length} file terdeteksi. ${newItems.filter(i=>!i.isDuplicateInDb).length} baru.`
  isProcessing.value = false
  // reset input biar bisa pilih file yang sama lagi
  input.value = ''
}

const toggleSelectAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  extractedList.value.forEach(i => {
    if (!i.isDuplicateInDb) i.isSelected = checked
  })
}

const clearPreview = () => {
  extractedList.value = []
  statusMsg.value = ''
}

const saveSelectedToRaw = async () => {
  const toCommit = extractedList.value.filter(i => i.isSelected &&!i.isDuplicateInDb)
  if (toCommit.length === 0) return
  isProcessing.value = true
  statusMsg.value = `Committing ${toCommit.length} songs to staging buffer...`
  try {
    // TODO: await $fetch('/api/staging/commit', { method: 'POST', body: toCommit })
    await new Promise(r => setTimeout(r, 1500))
    pendingRawCount.value += toCommit.length
    extractedList.value = extractedList.value.filter(i =>!i.isSelected || i.isDuplicateInDb)
    statusMsg.value = `Sukses! ${toCommit.length} lagu masuk ke Staging.`
    isError.value = false
  } catch (e:any) {
    isError.value = true
    statusMsg.value = "Gagal commit ke staging."
  } finally {
    isProcessing.value = false
  }
}
</script>
