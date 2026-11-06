<script setup lang="ts">
/** Icon Material Symbols Outlined: <AppIcon name="event" /> */
defineProps<{ name: string; size?: number; fill?: boolean }>()
</script>

<template>
  <span class="msym" :class="{ fill }" :style="size ? { fontSize: size + 'px' } : undefined" aria-hidden="true">{{ name }}</span>
</template>
