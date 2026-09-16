<!-- pages/extraction.vue - Clean no metadata editor -->
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
          <NuxtLink to="/home" class="h-10 px-5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-mono flex items-center hover:border-zinc-600 transition">
            ← CONTROL CENTER
          </NuxtLink>
          <NuxtLink to="/staging" class="h-10 px-5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-mono flex items-center">
            STAGING ({{ pendingRawCount }}) →
          </NuxtLink>
          <NuxtLink to="/library" class="h-10 px-5 rounded-full bg-white text-black text-sm font-mono font-bold flex items-center">
            LIBRARY ({{ completedSongsCount }})
          </NuxtLink>
        </div>
      </div>

      <div v-if="statusMsg" :class="['mb-6 rounded-xl border px-4 py-3 font-mono text-sm', isError? 'bg-red-950/40 border-red-900 text-red-300' : 'bg-zinc-900 border-zinc-800 text-zinc-300']">
        {{ statusMsg }}
      </div>

      <!-- INGEST GRID -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="rounded- bg-zinc-900 border border-zinc-800 p-6">
          <div class="text- font-mono tracking-widest text-zinc-500 uppercase mb-3">Source // Remote</div>
          <h3 class="text-lg font-bold mb-4">YouTube Stream Ingest</h3>
          <label class="text- font-mono text-zinc-400 uppercase">Playlist / Video ID</label>
          <input v-model="targetPlaylistId" placeholder="URL atau Playlist ID..." class="w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600" />
          <button @click="fetchYouTubeToPreview" :disabled="isProcessing" class="w-full mt-4 bg-white text-black font-bold font-mono text-sm py-3.5 rounded-xl hover:bg-zinc-200 disabled:opacity-30 transition">
            {{ isProcessing? 'PROCESSING...' : 'FETCH TO PREVIEW QUEUE' }}
          </button>
        </div>

        <div class="rounded- bg-zinc-900 border border-zinc-800 p-6">
          <div class="text- font-mono tracking-widest text-zinc-500 uppercase mb-3">Source // Local Directory & Files</div>
          <h3 class="text-lg font-bold mb-4">Local Sync Ingest</h3>
          <div class="flex bg-zinc-950 p-1 rounded-full border border-zinc-800 w-fit mb-4">
            <button @click="uploadMode='folder'" :class="['px-4 py-1.5 rounded-full text-xs font-mono font-bold', uploadMode==='folder'? 'bg-white text-black' : 'text-zinc-500']">Folder Scan</button>
            <button @click="uploadMode='file'" :class="['px-4 py-1.5 rounded-full text-xs font-mono font-bold', uploadMode==='file'? 'bg-white text-black' : 'text-zinc-500']">Multi Files</button>
          </div>
          <input v-if="uploadMode==='folder'" type="file" webkitdirectory directory multiple @change="handleLocalSyncSelection" :disabled="isProcessing"
            class="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white bg-zinc-950 border border-zinc-800 rounded-xl p-1" />
          <input v-else type="file" multiple accept=".mp3,.wav,.m4a,.flac,.ogg,.aac" @change="handleLocalSyncSelection" :disabled="isProcessing"
            class="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white bg-zinc-950 border border-zinc-800 rounded-xl p-1" />
          <small class="text- text-zinc-500 font-mono mt-3 block">Pindai folder atau pilih file audio langsung. Format: mp3, wav, m4a, flac, ogg, aac</small>
        </div>
      </div>

      <!-- PREVIEW QUEUE -->
      <div v-if="extractedList.length > 0" class="rounded- bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div class="flex flex-wrap justify-between items-center gap-4 px-6 py-4 border-b border-zinc-800">
          <span class="font-mono text-xs tracking-widest">PARSED QUEUE PREVIEW ({{ extractedList.length.toLocaleString() }})</span>
          <div class="flex gap-3 items-center">
            <span class="text- font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">{{ readyToCommitCount.toLocaleString() }} READY TO COMMIT</span>
            <button @click="clearPreview" class="text- font-mono border border-zinc-700 px-3 py-1 rounded-full hover:text-white transition">CLEAR QUEUE</button>
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
              <tr v-for="(item, i) in extractedList" :key="i" class="hover:bg-zinc-800/40 transition">
                <td class="px-6 py-3"><input type="checkbox" v-model="item.IsSelected" class="accent-white w-4 h-4" /></td>
                <td class="px-4 py-3"><span class="text- font-mono font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">NEW</span></td>
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
useHead({ title: 'Extraction Engine - Hypen Music Vault' })

interface Candidate {
  FileName: string
  Title: string
  Artist: string
  IsSelected: boolean
  IsDuplicateInDb: boolean
}

const statusMsg = ref('')
const isError = ref(false)
const isProcessing = ref(false)
const uploadMode = ref<'folder'|'file'>('folder')
const targetPlaylistId = ref('URL')
const extractedList = ref<Candidate[]>([])
const pendingRawCount = ref(128)
const completedSongsCount = ref(2450)

const readyToCommitCount = computed(() => extractedList.value.filter(i => i.IsSelected &&!i.IsDuplicateInDb).length)
const isAllSelected = computed(() => extractedList.value.length > 0 && extractedList.value.every(i => i.IsSelected))

const parseFromFilename = (name: string) => {
  const clean = name.replace(/\.[^/.]+$/, '')
  const parts = clean.split(' - ')
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() }
  return { artist: '', title: clean }
}

const updateStatus = (msg: string, err = false) => { statusMsg.value = msg; isError.value = err }

const fetchYouTubeToPreview = async () => {
  if (!targetPlaylistId.value.trim()) { updateStatus('Playlist ID kosong', true); return }
  isProcessing.value = true
  updateStatus('Mengambil metadata playlist dari YouTube...')
  await new Promise(r => setTimeout(r, 800))
  const mock = Array.from({length: 5}).map((_, i) => ({
    FileName: `yt_${targetPlaylistId.value.slice(0,8)}_${i}`,
    Title: `YouTube Track ${i+1}`,
    Artist: `Channel ${i+1}`,
    IsSelected: true,
    IsDuplicateInDb: false
  }))
  extractedList.value.push(...mock)
  updateStatus(`Berhasil mengekstrak ${mock.length} lagu ke preview.`)
  isProcessing.value = false
}

const handleLocalSyncSelection = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files? Array.from(input.files).slice(0, 5000) : []
  const valid = ['.mp3','.wav','.m4a','.flac','.ogg','.aac']
  const audioFiles = files.filter(f => valid.includes('.' + f.name.split('.').pop()!.toLowerCase()))
  if (!audioFiles.length) { updateStatus('Tidak ada file audio valid', true); return }

  const newItems = audioFiles.map(f => {
    const { artist, title } = parseFromFilename(f.name)
    return { FileName: f.name, Title: title, Artist: artist, IsSelected: true, IsDuplicateInDb: false }
  })
  extractedList.value.push(...newItems)
  updateStatus(`Berhasil mengekstrak ${newItems.length} file audio.`)
  input.value = ''
}

const toggleSelectAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  extractedList.value.forEach(i => i.IsSelected = checked)
}
const clearPreview = () => { extractedList.value = []; updateStatus('Antrean preview dibersihkan.') }
const saveSelectedToRaw = async () => {
  if (readyToCommitCount.value === 0) return
  isProcessing.value = true
  updateStatus(`Memasukkan ${readyToCommitCount.value} lagu ke Staging...`)
  await new Promise(r => setTimeout(r, 800))
  pendingRawCount.value += readyToCommitCount.value
  extractedList.value = extractedList.value.filter(i =>!i.IsSelected)
  updateStatus(`Berhasil! ${pendingRawCount.value} lagu di Staging Buffer.`)
  isProcessing.value = false
}
</script>
