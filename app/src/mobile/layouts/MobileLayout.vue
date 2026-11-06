<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@/shared/components'
import { useAuthStore } from '@/shared/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

/** Tab bar: Evenimente · Chat · [Hartă] · Bilete/Panou · Salvate. Firma și Primăria au „Panou” în loc de „Bilete”. */
const tabs = computed(() => {
  const panel = auth.hasRole('BUSINESS', 'CITY_HALL')
  return [
    { to: '/m', icon: 'calendar_month', label: t('nav.events'), match: (p: string) => p === '/m' || p.startsWith('/m/events') || p.startsWith('/m/offers') || p.startsWith('/m/community') },
    { to: '/m/chat', icon: 'chat_bubble', label: t('nav.chat'), match: (p: string) => p.startsWith('/m/chat') },
    { to: '/m/map', icon: 'map', label: t('nav.map'), center: true, match: (p: string) => p.startsWith('/m/map') },
    panel
      ? { to: '/m/panel', icon: 'dashboard', label: t('nav.panel'), match: (p: string) => p.startsWith('/m/panel') }
      : { to: '/m/tickets', icon: 'confirmation_number', label: t('nav.tickets'), match: (p: string) => p.startsWith('/m/tickets') },
    { to: '/m/saved', icon: 'bookmark', label: t('nav.saved'), match: (p: string) => p.startsWith('/m/saved') },
  ]
})
const hideTabs = computed(() => route.meta.hideTabs === true)
</script>

<template>
  <div class="min-h-dvh bg-bg flex flex-col mx-auto w-full max-w-[480px]">
    <main class="flex-1 px-5 pt-[max(12px,env(safe-area-inset-top))]" :class="hideTabs ? 'pb-6' : 'pb-28'">
      <router-view />
    </main>

    <nav v-if="!hideTabs" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-3.5 pb-[max(10px,env(safe-area-inset-bottom))] pointer-events-none">
      <div class="pointer-events-auto h-[78px] bg-white rounded-[22px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-around px-1.5">
        <router-link v-for="tab in tabs" :key="tab.to" :to="tab.to"
          class="flex flex-col items-center gap-0.5 w-[62px] text-[11px] no-underline"
          :class="[tab.center ? 'relative -top-4' : '', tab.match(route.path) ? 'text-ink font-semibold' : 'text-muted']">
          <span v-if="tab.center" class="w-[54px] h-[54px] rounded-full bg-ink text-white flex items-center justify-center shadow-[0_0_0_5px_#F7F7F2]">
            <AppIcon :name="tab.icon" :size="24" />
          </span>
          <template v-else>
            <AppIcon :name="tab.icon" :size="22" />
            <span>{{ tab.label }}</span>
          </template>
        </router-link>
      </div>
    </nav>
  </div>
</template>
