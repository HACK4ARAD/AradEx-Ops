<script setup lang="ts">
import { useUiStore } from '@/shared/stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 flex flex-col gap-2 w-[min(92vw,420px)] pointer-events-none">
    <div v-for="t in ui.toasts" :key="t.id" role="status"
      class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[14px] text-white shadow-lg text-[15px]"
      :class="t.kind === 'error' ? 'bg-[#B3261E]' : t.kind === 'success' ? 'bg-green' : 'bg-ink'">
      <span class="flex-1">{{ t.message }}</span>
      <button v-if="t.action" class="font-bold underline" @click="t.action.onClick(); ui.dismiss(t.id)">{{ t.action.label }}</button>
    </div>
  </div>
</template>
