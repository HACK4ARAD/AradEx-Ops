<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppChip, AppIcon, EmptyState } from '@/shared/components'
import ApiStatus from '@/shared/components/ApiStatus.vue'
import { useFormat } from '@/shared/composables/useFormat'
import { useAuthStore } from '@/shared/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const f = useFormat()
const period = ref<'today' | 'weekend' | 'week'>('today')
const tab = ref<'events' | 'offers' | 'community'>('events')
</script>

<template>
  <div class="text-[13px] text-muted">{{ f.longDate(new Date().toISOString()) }}</div>
  <div class="flex items-center justify-between mb-3">
    <h1 class="text-[28px] font-semibold tracking-[-0.025em] leading-tight m-0">{{ t('home.title') }}</h1>
    <router-link :to="auth.isLoggedIn ? '/m/profile' : '/m/login'"
      class="w-10 h-10 rounded-full bg-ink text-white font-bold flex items-center justify-center no-underline">
      {{ auth.user?.displayName.charAt(0) ?? '?' }}
    </router-link>
  </div>

  <button class="w-full h-[46px] bg-white border border-line rounded-[14px] flex items-center gap-2 px-3 text-muted text-[14px]" @click="router.push('/m/search')">
    <AppIcon name="search" :size="20" /> {{ t('common.search') }}
    <span class="ml-auto w-9 h-9 rounded-[10px] border border-line flex items-center justify-center text-ink"><AppIcon name="tune" :size="20" /></span>
  </button>

  <div class="flex gap-2 my-3">
    <button v-for="x in ([['events','🎭',t('nav.events')],['offers','🏷️',t('nav.offers')],['community','🌳',t('nav.community')]] as const)" :key="x[0]"
      class="flex-1 rounded-[14px] p-2.5 text-left text-[13px] font-semibold" :class="tab === x[0] ? 'bg-ink text-white' : 'bg-white'" @click="tab = x[0]">
      <div>{{ x[1] }}</div><div>{{ x[2] }}</div>
    </button>
  </div>

  <button class="w-full bg-ink text-white rounded-[16px] p-4 flex items-center gap-3 text-left" @click="router.push('/m/plan')">
    <AppIcon name="auto_awesome" :size="28" class="text-yellow" />
    <span class="flex-1"><b class="block text-[15px]">{{ t('home.planCta') }}</b><small class="text-white/75 text-[12px]">{{ t('home.planCtaSub') }}</small></span>
    <AppIcon name="chevron_right" />
  </button>

  <div class="flex gap-2 flex-wrap my-3">
    <AppChip :active="period === 'today'" @click="period = 'today'">{{ t('home.today') }}</AppChip>
    <AppChip :active="period === 'weekend'" @click="period = 'weekend'">{{ t('home.weekend') }}</AppChip>
    <AppChip :active="period === 'week'" @click="period = 'week'">{{ t('home.week') }}</AppChip>
  </div>

  <!-- T06: aici vine lista de EventCard din GET /events; T10: OfferCard; T11: tab-ul Comunitate -->
  <EmptyState icon="event" :title="t('common.empty')" text="Lista de evenimente vine în T06 (docs/PLAN.md)." />

  <div class="flex justify-center mt-2"><ApiStatus /></div>
</template>
