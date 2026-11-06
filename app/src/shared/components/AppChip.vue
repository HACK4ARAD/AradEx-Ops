<script setup lang="ts">
import AppIcon from './AppIcon.vue'
defineProps<{ active?: boolean; icon?: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button type="button" @click="$emit('click')"
    class="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-full border text-[14px] font-medium transition select-none"
    :class="active ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-line'">
    <AppIcon v-if="icon" :name="icon" :size="18" />
    <slot />
  </button>
</template>
