<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppIcon, AppButton } from '@/shared/components'
import { useAuthStore } from '@/shared/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const topNav = computed(() => [
  { to: '/w/events', label: t('nav.events') },
  { to: '/w/map', label: t('nav.map') },
  { to: '/w/offers', label: t('nav.offers') },
  { to: '/w/community', label: t('nav.community') },
  { to: '/w/places', label: t('nav.places') },
])

/** Sidebar-ul apare doar în panouri (/w/business, /w/city, /w/admin); paginile publice au doar bara de sus. */
const sidebar = computed(() => {
  const p = route.path
  if (p.startsWith('/w/business')) return [
    { to: '/w/business', icon: 'dashboard', label: 'Panou' }, { to: '/w/business/offers', icon: 'sell', label: 'Oferte' },
    { to: '/w/business/events', icon: 'event', label: 'Evenimente' }, { to: '/w/business/announcements', icon: 'campaign', label: 'Anunțuri' },
    { to: '/w/business/codes', icon: 'qr_code_scanner', label: 'Validează coduri' }, { to: '/w/business/profile', icon: 'settings', label: 'Profilul firmei' },
  ]
  if (p.startsWith('/w/city')) return [
    { to: '/w/city', icon: 'dashboard', label: 'Panou' }, { to: '/w/city/actions', icon: 'volunteer_activism', label: 'Acțiuni comunitare' },
    { to: '/w/city/validate', icon: 'qr_code_scanner', label: 'Validare participanți' }, { to: '/w/city/leaderboard', icon: 'leaderboard', label: 'Clasament' },
    { to: '/w/city/events', icon: 'event', label: 'Evenimente publice' },
  ]
  if (p.startsWith('/w/admin')) return [
    { to: '/w/admin', icon: 'dashboard', label: 'Dashboard' }, { to: '/w/admin/businesses', icon: 'storefront', label: 'Firme' },
    { to: '/w/admin/events', icon: 'event', label: 'Evenimente' }, { to: '/w/admin/offers', icon: 'sell', label: 'Oferte' },
    { to: '/w/admin/actions', icon: 'volunteer_activism', label: 'Acțiuni' }, { to: '/w/admin/places', icon: 'attractions', label: 'Obiective & ghiduri' },
    { to: '/w/admin/users', icon: 'group', label: 'Utilizatori' },
  ]
  return null
})

const panelLink = computed(() => {
  switch (auth.role) {
    case 'BUSINESS': return { to: '/w/business', label: t('nav.business') }
    case 'CITY_HALL': return { to: '/w/city', label: t('nav.city') }
    case 'ADMIN': return { to: '/w/admin', label: t('nav.admin') }
    default: return null
  }
})

function logout() { auth.logout(); router.push('/w') }
</script>

<template>
  <div class="min-h-dvh bg-bg flex flex-col">
    <header class="h-16 bg-white border-b border-line flex items-center px-7 gap-7 sticky top-0 z-20">
      <router-link to="/w" class="font-bold text-[16px] flex items-center gap-2 no-underline text-ink">
        <span class="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> {{ t('app.name') }}
      </router-link>
      <nav class="hidden md:flex gap-6 text-[14px] font-medium">
        <router-link v-for="n in topNav" :key="n.to" :to="n.to" class="no-underline"
          :class="route.path.startsWith(n.to) ? 'text-ink font-semibold' : 'text-muted hover:text-ink'">{{ n.label }}</router-link>
      </nav>
      <div class="ml-auto flex items-center gap-2.5">
        <router-link v-if="panelLink" :to="panelLink.to" class="text-[14px] font-semibold no-underline text-ink">{{ panelLink.label }}</router-link>
        <AppButton v-if="!auth.isLoggedIn" variant="ghost" size="sm" @click="router.push('/w/login')">{{ t('nav.login') }}</AppButton>
        <template v-else>
          <span class="w-8 h-8 rounded-full bg-ink text-white text-[12px] font-bold flex items-center justify-center">{{ auth.user?.displayName.charAt(0) }}</span>
          <span class="text-[14px] font-semibold hidden md:inline">{{ auth.user?.displayName }}</span>
          <AppButton variant="ghost" size="sm" icon="logout" @click="logout">{{ t('nav.logout') }}</AppButton>
        </template>
        <AppButton size="sm" icon="auto_awesome" @click="router.push('/w/plan')">{{ t('nav.plan') }}</AppButton>
      </div>
    </header>

    <div class="flex flex-1 min-h-0">
      <aside v-if="sidebar" class="w-[250px] shrink-0 bg-white border-r border-line p-3.5 flex flex-col gap-1">
        <router-link v-for="s in sidebar" :key="s.to" :to="s.to"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[14px] font-medium no-underline"
          :class="route.path === s.to ? 'bg-bg text-ink font-semibold' : 'text-muted hover:text-ink'">
          <AppIcon :name="s.icon" :size="20" /> {{ s.label }}
        </router-link>
      </aside>
      <main class="flex-1 min-w-0 px-8 py-7 max-w-[1280px] mx-auto w-full">
        <router-view />
      </main>
    </div>
  </div>
</template>
