<script setup lang="ts">
const props = defineProps<{ path: string }>()
const PER_PAGE = 100
const HISTORY_LABEL = 'Task Duration without dev tools (cumulated)'

const { data, pending, error, refresh } = useFetch<any>('/api/csv', { query: { path: props.path }, lazy: true })
const live = useLive()
watch(() => live.value.n, () => {
  const dir = props.path.slice(0, props.path.lastIndexOf('/') + 1)
  if (live.value.paths.some((p) => p.startsWith(dir))) refresh()
})

const q = ref('')
const sortKey = ref<string | null>(null)
const asc = ref(true)
const page = ref(0)
const modal = ref<{ type: 'report' | 'history' | 'details'; url: string; file?: string } | null>(null)

const urlOf = (r: any) => (data.value?.urlCol ? String(r[data.value.urlCol] ?? '').trim() : '')
const pointsOf = (r: any) => data.value?.history?.points[urlOf(r)] as { t: string; v: number }[] | undefined
const rowsOf = (r: any) => data.value?.details?.byUrl[urlOf(r)] as Record<string, string>[] | undefined

const filtered = computed(() => {
  let rows: any[] = data.value?.rows ?? []
  const cols: string[] = data.value?.columns ?? []
  const s = q.value.trim().toLowerCase()
  if (s) rows = rows.filter((r) => cols.some((c) => String(r[c] ?? '').toLowerCase().includes(s)))
  const k = sortKey.value
  if (k) {
    const d = asc.value ? 1 : -1
    rows = [...rows].sort((a, b) => d * String(a[k] ?? '').localeCompare(String(b[k] ?? ''), undefined, { numeric: true }))
  }
  return rows
})
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const visible = computed(() => filtered.value.slice(page.value * PER_PAGE, (page.value + 1) * PER_PAGE))

watch(q, () => (page.value = 0))
watch(pages, (p) => { if (page.value >= p) page.value = p - 1 })
function sortBy(col: string) {
  if (sortKey.value === col) asc.value = !asc.value
  else { sortKey.value = col; asc.value = true }
  page.value = 0
}
</script>

<template>
  <section>
    <h2 class="path">{{ path }}</h2>
    <p v-if="!data && pending" class="mute">Chargement…</p>
    <p v-else-if="error" class="err">{{ error.statusMessage || 'Lecture impossible' }}</p>
    <template v-else-if="data">
      <div class="bar">
        <input v-model="q" type="search" placeholder="Filtrer les lignes" aria-label="Filtrer les lignes" />
        <span class="mute">{{ filtered.length }} / {{ data.total }} lignes, {{ data.columns.length }} colonnes</span>
      </div>
      <p v-if="data.truncated" class="err">Seules les 20 000 premières lignes sont chargées.</p>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th v-for="c in data.columns" :key="c" :aria-sort="sortKey === c ? (asc ? 'ascending' : 'descending') : 'none'">
                <button @click="sortBy(c)">{{ c }}<span v-if="sortKey === c">{{ asc ? ' ↑' : ' ↓' }}</span></button>
              </th>
              <th v-if="data.hasReports"><span class="th-plain">Rapport</span></th>
              <th v-if="data.history"><span class="th-plain">Historique</span></th>
              <th v-if="data.details"><span class="th-plain">Détails</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in visible" :key="i">
              <td v-for="c in data.columns" :key="c"><CellValue :value="r[c]" :label="c" /></td>
              <td v-if="data.hasReports">
                <button v-if="r.__report" class="tab sm" @click="modal = { type: 'report', url: urlOf(r), file: r.__report }">Détail</button>
              </td>
              <td v-if="data.history">
                <button v-if="pointsOf(r)?.length" class="tab sm" @click="modal = { type: 'history', url: urlOf(r) }">Détail</button>
              </td>
              <td v-if="data.details">
                <button v-if="rowsOf(r)?.length" class="tab sm" @click="modal = { type: 'details', url: urlOf(r) }">Détail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bar" v-if="pages > 1">
        <button class="tab" :disabled="page === 0" @click="page--">Précédent</button>
        <span class="mute">Page {{ page + 1 }} sur {{ pages }}</span>
        <button class="tab" :disabled="page >= pages - 1" @click="page++">Suivant</button>
      </div>
    </template>

    <AppModal v-if="modal" :title="modal.url" @close="modal = null">
      <iframe
        v-if="modal.type === 'report'"
        :src="`/api/report?path=${encodeURIComponent(path)}&file=${encodeURIComponent(modal.file!)}`"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        title="Rapport"
      />
      <SimpleTable
        v-else-if="modal.type === 'details' && data?.details?.byUrl[modal.url]"
        :columns="data.details.columns"
        :rows="data.details.byUrl[modal.url]"
      />
      <HistoryChart v-else-if="modal.type === 'history' && data?.history?.points[modal.url]" :points="data.history.points[modal.url]" :label="HISTORY_LABEL" />
    </AppModal>
  </section>
</template>
