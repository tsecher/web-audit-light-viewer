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

type TreeItem = { name: string; children: TreeItem[]; files: any[] }

// Construit la hiérarchie à partir du répertoire de chaque fichier (a/b/c -> a > b > c)
const tree = computed(() => {
  const root: TreeItem = { name: '', children: [], files: [] }
  for (const f of list.value?.files ?? []) {
    let node = root
    if (f.dir !== '(racine)') {
      for (const seg of f.dir.split('/')) {
        let child = node.children.find((n) => n.name === seg)
        if (!child) {
          child = { name: seg, children: [], files: [] }
          node.children.push(child)
        }
        node = child
      }
    }
    node.files.push(f)
  }
  return root
})
</script>

<template>
  <div class="shell">
    <header class="top">
      <h1>Analyses CSV</h1>
      <span v-if="list?.root" class="mute">{{ list.root }}</span>
    </header>

    <nav class="side" aria-label="Fichiers CSV">
      <p v-if="!list?.files.length" class="mute">Aucun fichier CSV trouvé.</p>
      <TreeNode v-else :node="tree" :selected="selected" @select="selected = $event" />
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
