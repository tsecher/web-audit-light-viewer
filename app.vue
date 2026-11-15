<script setup lang="ts">
const { data: list, error: listError, refresh } = await useFetch('/api/files')
const selected = ref<string | null>(null)
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

const groups = computed(() => {
  const g: Record<string, any[]> = {}
  for (const f of list.value?.files ?? []) (g[f.dir] ||= []).push(f)
  return Object.entries(g)
})
const size = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko')
const dup = (files: any[], name: string) => files.filter((x) => x.name === name).length > 1
</script>

<template>
  <div class="shell">
    <header class="top">
      <h1>Analyses CSV</h1>
      <span v-if="list?.root" class="mute">{{ list.root }}</span>
    </header>

    <nav class="side" aria-label="Fichiers CSV">
      <p v-if="!groups.length" class="mute">Aucun fichier CSV trouvé.</p>
      <template v-for="[dir, files] in groups" :key="dir">
        <h2>{{ dir }}</h2>
        <button
          v-for="f in files" :key="f.path" class="file"
          :aria-current="selected === f.path" :title="f.path"
          @click="selected = f.path"
        >
          <span>{{ f.name }}<small v-if="f.sub && dup(files, f.name)"> ({{ f.sub }})</small></span>
          <small>{{ size(f.size) }}</small>
        </button>
      </template>
    </nav>

    <main class="main">
      <div v-if="listError || !list?.root" class="panel">
        <h2>Répertoire des CSV non configuré</h2>
        <p v-if="listError" class="err">{{ listError.statusMessage }}</p>
        <p>Renseigne <code>CSV_DIR</code> dans le fichier <code>.env</code>, puis redémarre l'app.</p>
      </div>
      <CsvTable v-else-if="selected" :key="selected" :path="selected" />
      <p v-else class="mute">Choisis un fichier dans la liste.</p>
    </main>
  </div>
</template>
