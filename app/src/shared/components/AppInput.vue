<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{ label?: string; type?: string; placeholder?: string; icon?: string; error?: string; autocomplete?: string }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <label class="block">
    <span v-if="label" class="block text-[14px] font-semibold mb-2">{{ label }}</span>
    <span class="flex items-center gap-2 h-12 px-3.5 bg-white border rounded-[14px]" :class="error ? 'border-accent' : 'border-line'">
      <AppIcon v-if="icon" :name="icon" :size="20" class="text-muted" />
      <input v-model="model" :type="type ?? 'text'" :placeholder="placeholder" :autocomplete="autocomplete"
        class="flex-1 min-w-0 bg-transparent outline-none text-[16px] placeholder:text-muted" />
    </span>
    <span v-if="error" class="block text-[13px] text-accent mt-1">{{ error }}</span>
  </label>
</template>
