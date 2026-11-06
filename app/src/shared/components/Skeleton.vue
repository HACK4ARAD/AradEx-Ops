<script setup lang="ts">
withDefaults(defineProps<{ rows?: number; height?: number }>(), { rows: 3, height: 72 })
</script>

<template>
  <div class="flex flex-col gap-3" aria-busy="true">
    <div v-for="i in rows" :key="i" class="rounded-[16px] bg-white animate-pulse" :style="{ height: height + 'px' }" />
  </div>
</template>
