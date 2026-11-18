<script setup lang="ts">
const props = defineProps<{ columns: string[]; rows: Record<string, string>[] }>()
const averages = computed(() => columnAverages(props.columns, props.rows))
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
      <tfoot>
        <tr>
          <td v-for="c in columns" :key="c">
            <template v-if="averages[c]"><span class="avg-l">moy.</span> {{ averages[c] }}</template>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
