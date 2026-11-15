<script setup lang="ts">
const view = ref<'data' | 'config'>('data')
const { data: cfg } = await useFetch('/api/config')
const csvDir = ref(cfg.value?.csvDir ?? '')
const { data: list, error: listError, refresh } = await useFetch('/api/files')
const selected = ref<string | null>(null)
const saving = ref(false)
const live = useLive()
let es: EventSource | null = null
onMounted(() => {
  es = new EventSource('/api/events')
  es.onmessage = (m) => {
    live.value = { n: live.value.n + 1, paths: JSON.parse(m.data).paths }
    refresh()
  }
})
onBeforeUnmount(() => es?.close())
const dup = (files: any[], name: string) => files.filter((x) => x.name === name).length > 1
if (!csvDir.value || listError.value) view.value = 'config'

const groups = computed(() => {
  const g: Record<string, any[]> = {}
  for (const f of list.value?.files ?? []) (g[f.dir] ||= []).push(f)
  return Object.entries(g)
})
const size = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko')

async function save() {
  saving.value = true
  await $fetch('/api/config', { method: 'POST', body: { csvDir: csvDir.value } })
  selected.value = null
  await refresh()
  saving.value = false
  if (!listError.value) view.value = 'data'
}
</script>

<template>
  <div class="shell">
    <header class="top">
      <h1>Analyses CSV</h1>
      <button class="tab" :aria-pressed="view === 'data'" @click="view = 'data'">Fichiers</button>
      <button class="tab" :aria-pressed="view === 'config'" @click="view = 'config'">Configuration</button>
    </header>

    <nav class="side" aria-label="Fichiers CSV">
      <p v-if="!groups.length" class="mute">Aucun fichier CSV trouvé.</p>
      <template v-for="[dir, files] in groups" :key="dir">
        <h2>{{ dir }}</h2>
        <button
          v-for="f in files" :key="f.path" class="file"
          :aria-current="selected === f.path" :title="f.path"
          @click="selected = f.path; view = 'data'"
        >
          <span>{{ f.name }}<small v-if="f.sub && dup(files, f.name)"> ({{ f.sub }})</small></span><small>{{ size(f.size) }}</small>
        </button>
      </template>
    </nav>

    <main class="main">
      <div v-if="view === 'config'" class="panel">
        <h2>Répertoire des CSV</h2>
        <label for="dir">Chemin relatif au dossier de l'app</label>
        <input id="dir" v-model="csvDir" placeholder="../whatever/analyses" @keyup.enter="save" />
        <p class="mute">Les sous-répertoires sont parcourus automatiquement.</p>
        <p v-if="listError" class="err">{{ listError.statusMessage }}</p>
        <p v-else-if="list?.root" class="mute">Dossier lu : {{ list.root }}</p>
        <button class="tab primary" :disabled="saving" @click="save">Enregistrer</button>
      </div>
      <CsvTable v-else-if="selected" :key="selected" :path="selected" />
      <p v-else class="mute">Choisis un fichier dans la liste.</p>
    </main>
  </div>
</template>
