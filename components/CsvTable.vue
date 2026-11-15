<script setup lang="ts">
const props = defineProps<{ path: string }>()
const PER_PAGE = 100

const { data, pending, error, refresh } = useFetch('/api/csv', { query: { path: props.path }, lazy: true })
const live = useLive()
watch(() => live.value.n, () => { if (live.value.paths.includes(props.path)) refresh() })

const q = ref('')
const sortKey = ref<string | null>(null)
const asc = ref(true)
const page = ref(0)

const filtered = computed(() => {
  let rows = data.value?.rows ?? []
  const s = q.value.trim().toLowerCase()
  if (s) rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(s)))
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in visible" :key="i">
              <td v-for="c in data.columns" :key="c">{{ r[c] }}</td>
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
  </section>
</template>
