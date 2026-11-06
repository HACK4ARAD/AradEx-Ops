<script setup lang="ts">
import { useRoute } from 'vue-router'
import PlaceholderScreen from '@/shared/components/PlaceholderScreen.vue'
const route = useRoute()
</script>

<template>
  <PlaceholderScreen :title="String(route.meta.title ?? route.name ?? '')" :screen="route.meta.screen as string" :task="route.meta.task as string" />
</template>
