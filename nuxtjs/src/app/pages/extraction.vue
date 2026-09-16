<template>
  <div class="min-h-screen bg-[#0a0a0a] text-zinc-100">
    <div class="max-w- mx-auto p-6 md:p-8">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div>
          <div class="text- tracking-[0.3em] text-zinc-500 font-mono uppercase mb-2">System Pipeline</div>
          <h1 class="text-4xl font-black tracking-tight">Extraction Engine</h1>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/staging" class="h-10 px-5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-mono flex items-center hover:border-zinc-600 transition">
            STAGING BUFFER ({{ pendingRawCount }}) →
          </NuxtLink>
          <NuxtLink to="/library" class="h-10 px-5 rounded-full bg-white text-black text-sm font-mono font-bold flex items-center hover:bg-zinc-200 transition">
            ← LIBRARY ({{ completedSongsCount }})
          </NuxtLink>
        </div>
      </div>

      <!-- STATUS -->
      <div v-if="statusMsg" :class="['mb-6 rounded-xl border px-4 py-3 font-mono text-sm', isError? 'bg-red-950/40 border-red-900 text-red-300' : 'bg-zinc-900 border-zinc-800 text-zinc-300']">
        {{ statusMsg }}
      </div>

      <!-- INGEST GRID -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- YOUTUBE -->
        <div class="rounded- bg-zinc-900 border border-zinc-800 p-6">
          <div class="text- font-mono tracking-widest text-zinc-500 uppercase mb-3">Source // Remote</div>
          <h3 class="text-lg font-bold mb-4">YouTube Stream Ingest</h3>
          <label class="text- font-mono text-zinc-400 uppercase">Playlist / Video ID</label>
          <input v-model="targetPlaylistId" placeholder="URL atau Playlist ID..." class="w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 outline-none" />
          <button @click="fetchYouTubeToPreview" :disabled="isProcessing" class="w-full mt-4 bg-white text-black font-bold font-mono text-sm py-3.5 rounded-xl hover:bg-zinc-200 disabled:opacity-30 transition">
            {{ isProcessing? 'PROCESSING...' : 'FETCH TO PREVIEW QUEUE' }}
          </button>
        </div>

        <!-- LOCAL -->
        <div class="rounded- bg-zinc-900 border border-zinc-800 p-6">
          <div class="text- font-mono tracking-widest text-zinc-500 uppercase mb-3">Source // Local Directory & Files</div>
          <h3 class="text-lg font-bold mb-4">Local Sync Ingest</h3>

          <label class="text- font-mono text-zinc-400 uppercase">Scan Mode</label>
          <div class="flex bg-zinc-950 p-1 rounded-full border border-zinc-800 w-fit mt-2 mb-4">
            <button @click="setUploadMode('folder')" :class="['px-4 py-1.5 rounded-full text-xs font-mono font-bold', uploadMode==='folder'? 'bg-white text-black' : 'text-zinc-500']">Folder Scan</button>
            <button @click="setUploadMode('file')" :class="['px-4 py-1.5 rounded-full text-xs font-mono font-bold', uploadMode==='file'? 'bg-white text-black' : 'text-zinc-500']">Multi Files</button>
          </div>

          <label class="text- font-mono text-zinc-400 uppercase">Select {{ uploadMode==='folder'? 'Directory' : 'Audio Files' }}</label>
          <input v-if="uploadMode==='folder'" type="file" webkitdirectory directory multiple @change="handleLocalSyncSelection" :disabled="isProcessing"
            class="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white bg-zinc-950 border border-zinc-800 rounded-xl p-1" />
          <input v-else type="file" multiple accept=".mp3,.wav,.m4a,.flac,.ogg,.aac" @change="handleLocalSyncSelection" :disabled="isProcessing"
            class="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white bg-zinc-950 border border-zinc-800 rounded-xl p-1" />

          <small class="text- text-zinc-500 font-mono mt-3 block">Pindai folder/direktori atau pilih berkas audio lokal secara langsung.</small>
        </div>
      </div>

      <!-- PREVIEW QUEUE -->
      <div v-if="extractedList.length > 0" class="rounded- bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div class="flex flex-wrap justify-between items-center gap-4 px-6 py-4 border-b border-zinc-800">
          <span class="font-mono text-xs tracking-widest">PARSED QUEUE PREVIEW ({{ extractedList.length.toLocaleString() }})</span>
          <div class="flex items-center gap-3">
            <span class="text- font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">{{ readyToCommitCount.toLocaleString() }} READY TO COMMIT</span>
            <span v-if="duplicateCount>0" class="text- font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">{{ duplicateCount.toLocaleString() }} IN DB</span>
            <button @click="clearPreview" class="text- font-mono border border-zinc-700 px-3 py-1 rounded-full hover:text-white">CLEAR QUEUE</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-zinc-950 text- font-mono uppercase text-zinc-500">
              <tr>
                <th class="px-6 py-3 w-12"><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="accent-white w-4 h-4" /></th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Source / ID</th>
                <th class="px-4 py-3">Artist</th>
                <th class="px-4 py-3">Title</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60">
              <tr v-for="(item, i) in extractedList" :key="i" :class="item.IsDuplicateInDb? 'bg-red-950/10 opacity-60' : 'hover:bg-zinc-800/40'">
                <td class="px-6 py-3"><input type="checkbox" v-model="item.IsSelected" :disabled="item.IsDuplicateInDb" class="accent-white w-4 h-4" /></td>
                <td class="px-4 py-3">
                  <span v-if="item.IsDuplicateInDb" :title="item.DuplicateReason" class="text- font-mono font-bold px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">EXISTS IN DB</span>
                  <span v-else class="text- font-mono font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">NEW</span>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-zinc-400 truncate max-w-">{{ item.FileName }}</td>
                <td class="px-4 py-3 text-zinc-300">{{ item.Artist || '—' }}</td>
                <td class="px-4 py-3 text-white font-medium">{{ item.Title || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button @click="saveSelectedToRaw" :disabled="isProcessing || readyToCommitCount===0" class="bg-white text-black font-mono font-black text-sm px-8 py-3.5 rounded-full hover:bg-zinc-200 disabled:opacity-30 transition">
            {{ isProcessing? 'SAVING...' : `COMMIT ${readyToCommitCount.toLocaleString()} NEW SONGS TO STAGING` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseBlob } from 'music-metadata-browser'

interface MetadataCandidate {
  FileName: string
  Title: string
  Artist: string
  Album?: string
  ReleaseYear?: number
  AlbumCoverUrl?: string
  Country?: string
  DurationSeconds?: number
  MusicBrainzId?: string
  IsSelected: boolean
  IsDuplicateInDb: boolean
  DuplicateReason?: string
}

const statusMsg = ref('')
const isError = ref(false)
const isProcessing = ref(false)
const uploadMode = ref<'folder' | 'file'>('folder')
const targetPlaylistId = ref('URL')
const extractedList = ref<MetadataCandidate[]>([])

const pendingRawCount = ref(0)
const completedSongsCount = ref(0)

const readyToCommitCount = computed(() => extractedList.value.filter(i => i.IsSelected &&!i.IsDuplicateInDb).length)
const duplicateCount = computed(() => extractedList.value.filter(i => i.IsDuplicateInDb).length)
const isAllSelected = computed(() => {
  const selectable = extractedList.value.filter(i =>!i.IsDuplicateInDb)
  return selectable.length > 0 && selectable.every(i => i.IsSelected)
})

const setUploadMode = (mode: 'folder' | 'file') => uploadMode.value = mode

const updateStatus = (msg: string, error = false) => {
  statusMsg.value = msg
  isError.value = error
}

const refreshMetrics = async () => {
  try {
    // GANTI DENGAN API ASLI KAMU
    // const data = await $fetch('/api/metrics')
    // pendingRawCount.value = data.rawCount
    // completedSongsCount.value = data.completedCount

    // MOCK untuk sekarang:
    const data = await $fetch<{rawCount: number, completedCount: number}>('/api/metrics').catch(() => ({rawCount: 128, completedCount: 2450}))
    pendingRawCount.value = data.rawCount
    completedSongsCount.value = data.completedCount
  } catch (e) {
    console.log('refreshMetrics error', e)
  }
}

onMounted(refreshMetrics)

// --- CARD 1: YOUTUBE ---
const fetchYouTubeToPreview = async () => {
  try {
    isProcessing.value = true
    updateStatus('Mengambil metadata playlist dari YouTube...')

    // GANTI DENGAN SERVICE ASLI: IYouTubeSyncService.FetchPlaylistItemsAsync
    const youtubeItems = await $fetch<{videoId: string, title: string, channelTitle: string}[]>('/api/youtube/playlist', {
      method: 'POST',
      body: { playlistId: targetPlaylistId.value }
    }).catch(async () => {
      // MOCK jika API belum ada
      await new Promise(r => setTimeout(r, 800))
      return Array.from({length: 5}).map((_, i) => ({
        videoId: `yt_${targetPlaylistId.value.slice(0,5)}_${i}`,
        title: `YouTube Track ${i+1} - Sample Title`,
        channelTitle: `Channel ${i+1}`
      }))
    })

    if (!youtubeItems.length) {
      updateStatus('Tidak ada video/lagu yang ditemukan dari input YouTube tersebut.', true)
      return
    }

    const newItems: MetadataCandidate[] = youtubeItems.map(item => ({
      FileName: item.videoId,
      Title: item.title,
      Artist: item.channelTitle,
      IsSelected: true,
      IsDuplicateInDb: false
    }))

    extractedList.value.push(...newItems)
    updateStatus(`Berhasil mengekstrak ${newItems.length.toLocaleString()} lagu dari YouTube ke preview.`)
  } catch (e: any) {
    updateStatus(`Gagal mengekstrak dari YouTube: ${e.message}`, true)
  } finally {
    isProcessing.value = false
  }
}

// --- CARD 2: LOCAL SYNC ---
const handleLocalSyncSelection = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files? Array.from(input.files).slice(0, 5000) : []
  if (!files.length) return

  const validExtensions = ['.mp3','.wav','.m4a','.flac','.ogg','.aac']
  const audioFiles = files.filter(f => validExtensions.includes('.' + f.name.split('.').pop()?.toLowerCase() || ''))

  if (!audioFiles.length) {
    updateStatus(uploadMode.value === 'folder'? 'Tidak ditemukan file audio di dalam folder tersebut.' : 'File yang dipilih bukan format audio yang didukung.', true)
    return
  }

  try {
    isProcessing.value = true
    const newItems: MetadataCandidate[] = []

    for (let idx = 0; idx < audioFiles.length; idx++) {
      const file = audioFiles[idx]
      updateStatus(`[${(idx+1).toLocaleString()}/${audioFiles.length.toLocaleString()}] Parsing Local Sync: '${file.name}'...`)

      try {
        // Port dari MetadataService.ExtractMetadata
        let artist = ''
        let title = file.name.replace(/\.[^/.]+$/, '')

        try {
          const metadata = await parseBlob(file)
          artist = metadata.common.artist || artist
          title = metadata.common.title || title
        } catch {
          // fallback parse "Artist - Title"
          const parts = title.split(' - ')
          if (parts.length >= 2) {
            artist = parts[0].trim()
            title = parts.slice(1).join(' - ').trim()
          }
        }

        newItems.push({
          FileName: file.name,
          Title: title,
          Artist: artist,
          IsSelected: true,
          IsDuplicateInDb: false
        })
      } catch (err) {
        console.log(`Gagal ekstraksi ${file.name}`, err)
      }
    }

    extractedList.value.push(...newItems)
    updateStatus(`Berhasil mengekstrak ${newItems.length.toLocaleString()} file audio melalui Local Sync.`)
  } catch (e: any) {
    updateStatus(`Gagal mengekstrak Local Sync: ${e.message}`, true)
  } finally {
    isProcessing.value = false
    input.value = '' // reset biar bisa pilih lagi
  }
}

// --- COMMIT ---
const saveSelectedToRaw = async () => {
  const selected = extractedList.value.filter(i => i.IsSelected)
  if (!selected.length) return

  try {
    isProcessing.value = true
    updateStatus(`Memasukkan ${selected.length.toLocaleString()} lagu ke tabel raw_songs (Staging)...`)

    await $fetch('/api/raw-songs/bulk', {
      method: 'POST',
      body: selected.map(item => ({
        YoutubeVideoId: item.FileName,
        Title: item.Title,
        Artist: item.Artist,
        Album: item.Album,
        ReleaseYear: item.ReleaseYear,
        AlbumCoverUrl: item.AlbumCoverUrl,
        Country: item.Country,
        DurationSeconds: item.DurationSeconds,
        MusicBrainzId: item.MusicBrainzId
      }))
    }).catch(() => new Promise(r => setTimeout(r, 1000))) // mock

    updateStatus(`Berhasil! ${selected.length.toLocaleString()} lagu masuk ke Staging Buffer.`)
    extractedList.value = extractedList.value.filter(i =>!i.IsSelected)
    await refreshMetrics()
  } catch (e: any) {
    updateStatus(`Gagal Simpan ke Staging: ${e.message}`, true)
  } finally {
    isProcessing.value = false
  }
}

const toggleSelectAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  extractedList.value.forEach(i => { if (!i.IsDuplicateInDb) i.IsSelected = checked })
}

const clearPreview = () => {
  extractedList.value = []
  updateStatus('Antrean preview dibersihkan.')
}
</script>
