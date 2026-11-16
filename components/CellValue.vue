<script setup lang="ts">
const props = defineProps<{ value: unknown; label?: string }>()
const MAX = 60 // nombre de caractères affichés avant de couper
const open = ref(false)

const text = computed(() => String(props.value ?? ''))
const url = computed(() => (/^https?:\/\/\S+$/i.test(text.value.trim()) ? text.value.trim() : ''))
const long = computed(() => text.value.length > MAX)
const shown = computed(() => (long.value ? text.value.slice(0, MAX) : text.value))
</script>

<template>
  <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer">{{ shown }}</a>
  <template v-else>{{ shown }}</template>
  <button v-if="long" type="button" class="more" title="Afficher le texte complet" aria-label="Afficher le texte complet" @click="open = true">…</button>
  <Teleport v-if="open" to="body">
    <AppModal :title="label || 'Contenu'" fit @close="open = false">
      <div class="full">
        <p v-if="url"><a :href="url" target="_blank" rel="noopener noreferrer">Ouvrir le lien</a></p>
        <pre>{{ text }}</pre>
      </div>
    </AppModal>
  </Teleport>
</template>
