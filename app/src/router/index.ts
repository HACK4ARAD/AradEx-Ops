import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Role } from '@/shared/types/api'
import { useAuthStore } from '@/shared/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    roles?: Role[]      // rute protejate: cine are voie (ADMIN are voie peste tot)
    screen?: string     // codul ecranului din design (S3, E1, W2…)
    task?: string       // task-ul din docs/PLAN.md
    hideTabs?: boolean  // mobil: ascunde tab bar-ul (login, checkout, scanner)
  }
}

const UI_KEY = 'ax.ui'
const MobilePlaceholder = () => import('@/mobile/views/PlaceholderView.vue')
const WebPlaceholder = () => import('@/web/views/PlaceholderView.vue')

/** Rutele mobile — vezi docs/API.md §Rute FE. Cele cu PlaceholderView se înlocuiesc în task-ul respectiv. */
const mobile: RouteRecordRaw = {
  path: '/m',
  component: () => import('@/mobile/layouts/MobileLayout.vue'),
  children: [
    { path: '', name: 'm-home', component: () => import('@/mobile/views/HomeView.vue'), meta: { title: 'Acasă', screen: 'S1/E6', task: 'T06' } },
    { path: 'login', name: 'm-login', component: () => import('@/mobile/views/LoginView.vue'), meta: { title: 'Conectare', screen: 'S12', task: 'T03', hideTabs: true } },
    { path: 'search', name: 'm-search', component: MobilePlaceholder, meta: { title: 'Caută', screen: 'S2', task: 'T06' } },
    { path: 'events/:id', name: 'm-event', component: MobilePlaceholder, meta: { title: 'Eveniment', screen: 'S3', task: 'T06' } },
    { path: 'events/:id/tickets', name: 'm-event-tickets', component: MobilePlaceholder, meta: { title: 'Alege biletele', screen: 'S4', task: 'T07', roles: ['VISITOR', 'LOCAL', 'BUSINESS', 'CITY_HALL'] } },
    { path: 'checkout', name: 'm-checkout', component: MobilePlaceholder, meta: { title: 'Plată', screen: 'S5', task: 'T07', hideTabs: true, roles: ['VISITOR', 'LOCAL', 'BUSINESS', 'CITY_HALL'] } },
    { path: 'confirm/:code', name: 'm-confirm', component: MobilePlaceholder, meta: { title: 'Rezervarea e confirmată', screen: 'S6', task: 'T07', hideTabs: true } },
    { path: 'map', name: 'm-map', component: MobilePlaceholder, meta: { title: 'Hartă', screen: 'S7', task: 'T08' } },
    { path: 'chat', name: 'm-chat', component: MobilePlaceholder, meta: { title: 'Chat', screen: 'S8', task: 'T12' } },
    { path: 'tickets', name: 'm-tickets', component: MobilePlaceholder, meta: { title: 'Biletele mele', screen: 'S9', task: 'T07', roles: ['VISITOR', 'LOCAL'] } },
    { path: 'tickets/:code', name: 'm-ticket', component: MobilePlaceholder, meta: { title: 'Bilet', screen: 'S10', task: 'T07', roles: ['VISITOR', 'LOCAL'] } },
    { path: 'saved', name: 'm-saved', component: MobilePlaceholder, meta: { title: 'Salvate', screen: 'S1', task: 'T06' } },
    { path: 'profile', name: 'm-profile', component: MobilePlaceholder, meta: { title: 'Profil', screen: 'S11', task: 'T03' } },
    { path: 'offers', name: 'm-offers', component: MobilePlaceholder, meta: { title: 'Oferte', screen: 'S1b', task: 'T10' } },
    { path: 'offers/:id', name: 'm-offer', component: MobilePlaceholder, meta: { title: 'Ofertă', screen: 'S1c', task: 'T10' } },
    { path: 'community', name: 'm-community', component: MobilePlaceholder, meta: { title: 'Comunitate', screen: 'S1d', task: 'T11' } },
    { path: 'community/actions/:id', name: 'm-action', component: MobilePlaceholder, meta: { title: 'Acțiune comunitară', screen: 'S1e', task: 'T11' } },
    { path: 'community/leaderboard', name: 'm-leaderboard', component: MobilePlaceholder, meta: { title: 'Clasament', screen: 'S1f', task: 'T11' } },
    { path: 'places/:id', name: 'm-place', component: MobilePlaceholder, meta: { title: 'Ghid virtual', screen: 'E3', task: 'T05' } },
    { path: 'plan', name: 'm-plan', component: MobilePlaceholder, meta: { title: 'Planifică-ți vizita', screen: 'E1', task: 'T13' } },
    { path: 'itinerary/:id', name: 'm-itinerary', component: MobilePlaceholder, meta: { title: 'Programul tău', screen: 'E2', task: 'T13' } },
    { path: 'itinerary/:id/map', name: 'm-itinerary-map', component: MobilePlaceholder, meta: { title: 'Traseul tău', screen: 'E4', task: 'T13', hideTabs: true } },
    { path: 'businesses/:id', name: 'm-business', component: MobilePlaceholder, meta: { title: 'Firmă', task: 'T09' } },
    { path: 'panel', name: 'm-panel', component: MobilePlaceholder, meta: { title: 'Panou', screen: 'E5/E7', task: 'T09/T11', roles: ['BUSINESS', 'CITY_HALL'] } },
  ],
}

/** Rutele web. Panourile cer rol. */
const web: RouteRecordRaw = {
  path: '/w',
  component: () => import('@/web/layouts/WebLayout.vue'),
  children: [
    { path: '', name: 'w-landing', component: () => import('@/web/views/LandingView.vue'), meta: { title: 'Acasă', screen: 'W1', task: 'T06' } },
    { path: 'login', name: 'w-login', component: () => import('@/web/views/LoginView.vue'), meta: { title: 'Conectare', screen: 'S12', task: 'T03' } },
    { path: 'events', name: 'w-events', component: WebPlaceholder, meta: { title: 'Evenimente', screen: 'W1', task: 'T06' } },
    { path: 'events/:id', name: 'w-event', component: WebPlaceholder, meta: { title: 'Eveniment', screen: 'S3', task: 'T06' } },
    { path: 'places', name: 'w-places', component: WebPlaceholder, meta: { title: 'Obiective', task: 'T05' } },
    { path: 'places/:id', name: 'w-place', component: WebPlaceholder, meta: { title: 'Ghid virtual', screen: 'E3', task: 'T05' } },
    { path: 'map', name: 'w-map', component: WebPlaceholder, meta: { title: 'Hartă', screen: 'S7', task: 'T08' } },
    { path: 'plan', name: 'w-plan', component: WebPlaceholder, meta: { title: 'Planifică-ți vizita', screen: 'E1/E2', task: 'T13' } },
    { path: 'offers', name: 'w-offers', component: WebPlaceholder, meta: { title: 'Oferte', task: 'T10' } },
    { path: 'community', name: 'w-community', component: WebPlaceholder, meta: { title: 'Comunitate', task: 'T11' } },
    { path: 'chat', name: 'w-chat', component: WebPlaceholder, meta: { title: 'Chat', screen: 'W13', task: 'T12' } },
    { path: 'account/:section?', name: 'w-account', component: WebPlaceholder, meta: { title: 'Contul meu', screen: 'W14', task: 'T07', roles: ['VISITOR', 'LOCAL', 'BUSINESS', 'CITY_HALL'] } },
    { path: 'businesses/:id', name: 'w-business-public', component: WebPlaceholder, meta: { title: 'Firmă', screen: 'W15', task: 'T09' } },
    { path: 'business/:section?', name: 'w-business', component: WebPlaceholder, meta: { title: 'Panou firmă', screen: 'W4', task: 'T09', roles: ['BUSINESS'] } },
    { path: 'city/:section?', name: 'w-city', component: WebPlaceholder, meta: { title: 'Panou Primărie', screen: 'W2', task: 'T11', roles: ['CITY_HALL'] } },
    { path: 'admin/:section?', name: 'w-admin', component: WebPlaceholder, meta: { title: 'Administrare', screen: 'W3', task: 'T14', roles: ['ADMIN'] } },
  ],
}

/** `/` → /m pe ecrane înguste, /w pe desktop; `?ui=m|w` forțează și se ține minte. */
function preferredUi(query: Record<string, unknown>): 'm' | 'w' {
  const forced = query.ui
  if (forced === 'm' || forced === 'w') {
    try { localStorage.setItem(UI_KEY, forced) } catch { /* ignore */ }
    return forced
  }
  try {
    const saved = localStorage.getItem(UI_KEY)
    if (saved === 'm' || saved === 'w') return saved
  } catch { /* ignore */ }
  return window.innerWidth < 768 ? 'm' : 'w'
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: (to) => ({ path: '/' + preferredUi(to.query as Record<string, unknown>), query: {} }) },
    mobile,
    web,
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()
  const roles = to.meta.roles
  if (roles && roles.length) {
    const base = to.path.startsWith('/w') ? '/w' : '/m'
    if (!auth.isLoggedIn) return { path: `${base}/login`, query: { next: to.fullPath } }
    if (!auth.hasRole(...roles)) return { path: base }
  }
  if (to.meta.title) document.title = `${to.meta.title} · AradExperience`
  return true
})
