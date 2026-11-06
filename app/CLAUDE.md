# app/ — Vue 3 (vezi și CLAUDE.md din rădăcină)

## Stack aprobat
Vue 3.4+ (Composition API, `<script setup lang="ts">`) · Vite · TypeScript strict · Pinia · Vue Router 4 · Tailwind CSS ·
vue-i18n · @vueuse/core · Leaflet · qrcode (generare) · html5-qrcode (scanare) · vite-plugin-pwa · vitest + @vue/test-utils · eslint + prettier.
Fără UI kit-uri (Vuetify etc.) — componentele de bază sunt ale noastre, în stilul prototipului.

## Structură
```
src/
  shared/
    api/          client.ts (fetch wrapper, Bearer, ApiError din ProblemDetail), auth.ts, places.ts, events.ts, tickets.ts, business.ts, offers.ts, community.ts, ai.ts, admin.ts
    types/api.ts  tipurile din docs/API.md (sursa de adevăr pentru FE)
    stores/       auth.ts (token + user + rol), ui.ts (toast, sheet, loading)
    components/   AppButton, AppChip, AppInput, AppCard, AppSheet (bottom sheet), AppToast, EventCard, OfferCard, ActionCard, PlaceCard, MapView, QrCode, QrScanner, AudioGuideBar, EmptyState, Skeleton
    composables/  useGeo, useRouteOsrm, useTts, useFormat (date/bani/distanță în ro), useAuthGuard
    i18n/         ro.json, en.json
    styles/       tokens.css (variabile CSS), base.css
  mobile/  layouts/MobileLayout.vue  views/ (Home, Search, EventDetail, Tickets…, Plan, Itinerary, ItineraryMap, Place, Community, Leaderboard, Offers, OfferDetail, Chat, Profile, Login, Panel)
  web/     layouts/WebLayout.vue     views/ (Landing, Events, EventDetail, Place, Plan, Map, Offers, Community, Login, business/*, city/*, admin/*)
  router/  index.ts (rute /m/* și /w/* cu meta.roles; `/` → redirect după lățime; `?ui=m|w` forțează și se ține minte în localStorage)
```

## Convenții
- O view = o rută. Logica de date în composables/store-uri, nu în view. View-urile mobile și web folosesc **aceleași** funcții din `shared/api` și aceleași componente; diferă doar layout-ul.
- Stil: Tailwind cu tokens din `tokens.css` (`--bg #F7F7F2`, `--ink #111111`, `--muted #5C5C5C`, `--line #D6D6D0`, `--accent #FF5A36`, `--green #1F3A1A`, `--yellow #FFC43D`). Mobil: lățime de conținut max 430px, tab bar jos cu 5 intrări, butonul central rotund „Hartă”. Web: sidebar 260px + conținut max 1200px.
- Icon-uri: Material Symbols Outlined (clasa `.msym`). Fără pachete de icon-uri.
- Texte: `t('events.title')`; cheile în `ro.json` grupate pe ecran. Diacritice corecte.
- Formatare: `useFormat().date(startAt)` → „Sâm., 7 nov. · 11:00”; `.money(40)` → „40 lei”; `.km(0.4)` → „0,4 km”.
- Stări: fiecare listă are loading (skeleton), empty (EmptyState cu text + acțiune) și error (toast + retry).
- Hartă: `MapView` e singura componentă care importă Leaflet. Nu crea alte hărți.
- QR: `QrCode` primește `value` (codul text). `QrScanner` emite `scanned(code)` și se oprește singur după prima citire.
- TTS: `useTts()` cu `speechSynthesis`; pornește doar la tap (iOS). Textele lungi se împart pe propoziții.
- Autentificare: tokenul în `localStorage` (`ax.token`), `authStore.user` din `/me` la pornire; 401 → logout + redirect la login cu `?next=`.
- Fără `any`. Tipurile vin din `shared/types/api.ts`; dacă BE schimbă un DTO, se schimbă aici în același PR.

## Teste
- vitest pe composables cu logică (`useFormat`, calculul de total bilete, filtrarea itinerarului) și pe componente cheie (`EventCard`, `QrCode` randează SVG).
- Nu testăm layout-uri. Verificarea ecranelor e manuală, din checklist-ul task-ului, pe mobil (Chrome device toolbar + telefon real) și desktop.

## Nu
- Nu apela direct `fetch` în view-uri — doar prin `shared/api`.
- Nu pune chei API în FE. Nu folosi Google Maps.
- Nu duplica un ecran în `web/` copiind codul din `mobile/` — extrage componenta în `shared/`.
