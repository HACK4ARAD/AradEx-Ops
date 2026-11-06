<script setup lang="ts">
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'sm'
  icon?: string
  loading?: boolean
  disabled?: boolean
  block?: boolean
  type?: 'button' | 'submit'
}>(), { variant: 'primary', size: 'md', type: 'button' })

const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[14px] transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none'
const variants = {
  primary: 'bg-ink text-white',
  secondary: 'bg-white text-ink border-[1.5px] border-ink',
  ghost: 'bg-transparent text-ink border border-line',
}
const sizes = { md: 'h-12 px-5 text-[16px]', sm: 'h-10 px-4 text-[14px] rounded-[12px]' }
</script>

<template>
  <button :type="type" :class="[base, variants[variant], sizes[size], block && 'w-full']" :disabled="disabled || loading">
    <AppIcon v-if="loading" name="progress_activity" :size="20" class="animate-spin" />
    <AppIcon v-else-if="icon" :name="icon" :size="20" />
    <slot />
  </button>
</template>
