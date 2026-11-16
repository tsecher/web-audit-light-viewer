<script setup lang="ts">
defineProps<{ columns: string[]; rows: Record<string, string>[] }>()
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
          <td v-for="c in columns" :key="c"><CellValue :value="r[c]" :label="c" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
