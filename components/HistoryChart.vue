<script setup lang="ts">
const props = defineProps<{ points: { t: string; v: number }[]; label: string }>()
const W = 900, H = 380, M = { l: 80, r: 24, t: 16, b: 48 }
const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

const dated = computed(() => props.points.every((p) => !Number.isNaN(Date.parse(p.t))))
const pts = computed(() => {
  const a = props.points.map((p, i) => ({
    v: p.v,
    x: dated.value ? Date.parse(p.t) : i,
    label: dated.value ? new Date(p.t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : p.t
  }))
  return dated.value ? a.sort((m, n) => m.x - n.x) : a
})
const xMin = computed(() => pts.value[0].x)
const xMax = computed(() => pts.value[pts.value.length - 1].x)
const yMin = computed(() => Math.min(0, ...pts.value.map((p) => p.v)))
const yMax = computed(() => Math.max(...pts.value.map((p) => p.v)))
const px = (x: number) => M.l + (xMax.value === xMin.value ? 0.5 : (x - xMin.value) / (xMax.value - xMin.value)) * (W - M.l - M.r)
const py = (v: number) => H - M.b - ((v - yMin.value) / (yMax.value - yMin.value || 1)) * (H - M.t - M.b)
const line = computed(() => pts.value.map((p) => `${px(p.x)},${py(p.v)}`).join(' '))
const yTicks = computed(() => Array.from({ length: 5 }, (_, i) => yMin.value + ((yMax.value - yMin.value) * i) / 4))
const xTicks = computed(() => {
  const n = pts.value.length, k = Math.min(6, n)
  return Array.from({ length: k }, (_, i) => pts.value[Math.round((i * (n - 1)) / Math.max(1, k - 1))])
})
</script>

<template>
  <div class="chart">
    <p class="mute">{{ label }} · {{ points.length }} mesures</p>
    <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="label">
      <g v-for="t in yTicks" :key="t">
        <line :x1="M.l" :x2="W - M.r" :y1="py(t)" :y2="py(t)" class="grid" />
        <text :x="M.l - 8" :y="py(t) + 4" text-anchor="end">{{ fmt(t) }}</text>
      </g>
      <text v-for="(t, i) in xTicks" :key="i" :x="px(t.x)" :y="H - M.b + 20" text-anchor="middle">{{ t.label }}</text>
      <polyline :points="line" class="series" />
      <circle v-for="(p, i) in pts" :key="i" :cx="px(p.x)" :cy="py(p.v)" r="4" class="dot">
        <title>{{ p.label }} : {{ fmt(p.v) }}</title>
      </circle>
    </svg>
  </div>
</template>
