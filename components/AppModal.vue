<script setup lang="ts">
defineProps<{ title: string; fit?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const el = ref<HTMLDialogElement>()
onMounted(() => el.value?.showModal())
</script>

<template>
  <dialog ref="el" class="modal" :class="{ fit }" @close="emit('close')" @click.self="el?.close()">
    <header>
      <h3>{{ title }}</h3>
      <button class="tab" @click="el?.close()">Fermer</button>
    </header>
    <div class="body"><slot /></div>
  </dialog>
</template>
