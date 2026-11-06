<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import AppButton from './AppButton.vue'
defineProps<{ icon?: string; title: string; text?: string; action?: string }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center text-center py-10 px-6 gap-3">
    <span class="w-14 h-14 rounded-full bg-white border border-line flex items-center justify-center">
      <AppIcon :name="icon ?? 'inbox'" :size="26" class="text-muted" />
    </span>
    <div class="font-semibold text-[17px]">{{ title }}</div>
    <p v-if="text" class="text-muted text-[14px] leading-relaxed m-0">{{ text }}</p>
    <AppButton v-if="action" variant="secondary" size="sm" class="mt-2" @click="$emit('action')">{{ action }}</AppButton>
  </div>
</template>
