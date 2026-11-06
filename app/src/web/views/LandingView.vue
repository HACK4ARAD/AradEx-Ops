<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppChip, AppIcon, EmptyState } from '@/shared/components'
import ApiStatus from '@/shared/components/ApiStatus.vue'
import { useFormat } from '@/shared/composables/useFormat'

const { t } = useI18n()
const router = useRouter()
const f = useFormat()
</script>

<template>
  <div class="flex gap-7">
    <div class="flex-[1.4] min-w-0">
      <div class="text-[13px] text-muted">{{ f.longDate(new Date().toISOString()) }}</div>
      <h1 class="text-[40px] font-semibold tracking-[-0.025em] leading-tight m-0 mb-4">{{ t('home.title') }}</h1>
      <button class="w-full max-w-[560px] h-[52px] bg-white border border-line rounded-[14px] flex items-center gap-2 px-3 text-muted text-[15px]" @click="router.push('/w/events')">
        <AppIcon name="search" :size="20" /> {{ t('common.search') }}
      </button>
      <div class="flex gap-2 flex-wrap my-4">
        <AppChip active>{{ t('home.today') }}</AppChip><AppChip>{{ t('home.weekend') }}</AppChip><AppChip>{{ t('home.week') }}</AppChip><AppChip>🔥 {{ t('home.popular') }}</AppChip>
      </div>
      <!-- T06: grid de EventCard (3 coloane) din GET /events -->
      <EmptyState icon="event" :title="t('common.empty')" text="Grid-ul de evenimente vine în T06." />
      <div class="mt-2"><ApiStatus /></div>
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-4">
      <button class="bg-ink text-white rounded-[16px] p-4 flex items-center gap-3 text-left" @click="router.push('/w/plan')">
        <AppIcon name="auto_awesome" :size="28" class="text-yellow" />
        <span class="flex-1"><b class="block text-[15px]">{{ t('home.planCta') }}</b><small class="text-white/75 text-[12px]">{{ t('home.planCtaSub') }}</small></span>
      </button>
      <!-- T08: MapView cu pin-uri -->
      <div class="h-[420px] rounded-[16px] bg-[#E9E9E2] flex items-center justify-center text-muted text-[14px]">Hartă (T08)</div>
    </div>
  </div>
</template>
