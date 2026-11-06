<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
/** Ecran gol pentru rutele încă neimplementate: arată codul ecranului din design și task-ul din PLAN. */
defineProps<{ title: string; screen?: string; task?: string; icon?: string }>()
const { t } = useI18n()
</script>

<template>
  <div class="py-2">
    <h1 class="text-[28px] font-semibold tracking-[-0.025em] leading-tight m-0 mb-2">{{ title }}</h1>
    <div class="bg-white rounded-[16px] p-5 flex items-start gap-3 border border-dashed border-line">
      <AppIcon :name="icon ?? 'construction'" :size="26" class="text-muted" />
      <div class="text-[14px] text-muted leading-relaxed">
        {{ t('common.comingSoon') }}
        <div v-if="screen || task" class="mt-1 text-ink font-semibold">
          <span v-if="screen">Design: {{ screen }}</span><span v-if="screen && task"> · </span><span v-if="task">Task: {{ task }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
