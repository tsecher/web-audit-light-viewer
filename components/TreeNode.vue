<script setup lang="ts">
// Composant récursif : un <ul> par niveau de répertoire
defineProps<{ node: { name: string; children: any[]; files: any[] }; selected: string | null }>()
defineEmits<{ select: [path: string] }>()

const isErr = (name?: string) => /^errors?$/i.test(name ?? '')
const size = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko')
const dup = (files: any[], name: string) => files.filter((x) => x.name === name).length > 1
</script>

<template>
  <ul class="tree">
    <li v-for="c in node.children" :key="c.name">
      <span class="dir" :class="{ 'is-error': isErr(c.name) }">{{ c.name }}</span>
      <TreeNode :node="c" :selected="selected" @select="$emit('select', $event)" />
    </li>
    <li v-for="f in node.files" :key="f.path">
      <button
        class="file" :class="{ 'is-error': isErr(f.sub) }"
        :aria-current="selected === f.path" :title="f.path"
        @click="$emit('select', f.path)"
      >
        <span>{{ f.name }}<small v-if="f.sub && dup(node.files, f.name)"> ({{ f.sub }})</small></span>
        <small>{{ size(f.size) }}</small>
      </button>
    </li>
  </ul>
</template>
