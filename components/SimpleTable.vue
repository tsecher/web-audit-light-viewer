<script setup lang="ts">
defineProps<{ columns: string[]; rows: Record<string, string>[] }>()
const isUrl = (v: unknown) => typeof v === 'string' && /^https?:\/\/\S+$/i.test(v.trim())
</script>

<template>
  <div class="inner">
    <p class="mute">{{ rows.length }} lignes</p>
    <table>
      <thead>
        <tr><th v-for="c in columns" :key="c"><span class="th-plain">{{ c }}</span></th></tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <td v-for="c in columns" :key="c">
            <a v-if="isUrl(r[c])" :href="r[c].trim()" target="_blank" rel="noopener noreferrer">{{ r[c] }}</a>
            <template v-else>{{ r[c] }}</template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
