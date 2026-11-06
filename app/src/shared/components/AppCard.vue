<script setup lang="ts">
defineProps<{ padded?: boolean }>()
</script>

<template>
  <div class="bg-white rounded-[16px]" :class="padded !== false && 'p-4'">
    <slot />
  </div>
</template>
