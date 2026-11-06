---
name: fe-feature
description: Cum se adaugă un ecran sau o funcționalitate în AradEx-Frontend/ (Vue 3): tipuri din API.md, client API, store/composable, view mobil, view web, rută, navigație, stări de încărcare/gol/eroare, stil Clean Ink. Folosește-l pentru orice ecran nou (Sx, Ex, Wx) sau feature de UI.
---

# Feature nou în `AradEx-Frontend/`

Citește `AradEx-Frontend/CLAUDE.md`, rutele din `docs/API.md` §Rute FE și captura ecranului din `design/screens/` (S = prototip original, E/W = extensii).

## Ordinea
1. **Tipuri** în `src/shared/types/<modul>.ts` (fișierul modulului tău; `api.ts` doar re-exportă, nu-l edita) — copiază DTO-urile din `docs/API.md` pentru endpoint-urile pe care le folosești (nu inventa câmpuri).
2. **Client API** în `src/shared/api/<modul>.ts`: o funcție per endpoint, tipată, prin `client.get/post/...`:
   ```ts
   export const eventsApi = {
     list: (q: EventQuery) => client.get<Page<EventSummary>>('/events', { query: q }),
     get: (id: number) => client.get<EventDto>(`/events/${id}`),
     save: (id: number) => client.post<void>(`/events/${id}/save`),
   }
   ```
3. **Stare**: date de ecran → composable local (`useEvents(filters)`) cu `data/loading/error/reload`; stare globală (user, toast, coș de bilete) → store Pinia în `shared/stores`.
4. **View mobil** `src/mobile/views/<Nume>View.vue` (lățime 390, tab bar jos, top bar cu back unde e cazul). Compune din `shared/components`. Fără CSS custom dacă Tailwind + tokens ajung.
5. **View web** `src/web/views/<Nume>View.vue` — același composable, altă așezare (sidebar + conținut, tabele pentru panouri, hartă + listă side-by-side). Dacă 80% din markup e identic, extrage o componentă în `shared/components` și folosește-o în ambele.
6. **Rută**: toate rutele și navigația există deja (T02, P1) și arată spre `src/mobile/views/<Nume>View.vue` / `src/web/views/<Nume>View.vue`. Tu doar înlocuiești conținutul view-ului tău. Dacă îți trebuie o rută nouă, o ceri lui P1.
7. **i18n**: toate textele în `src/shared/i18n/ro/<modul>.json` (cheia `<modul>.ecran.element`) și aceleași chei în `en/<modul>.json` (traducerea EN o faci tu pentru modulul tău).
8. Rulează `npm run dev`, verifică în Chrome device toolbar 390×844 și la 1280px; `npm run build` și `npm run test`.

## Stări obligatorii pe orice listă/detaliu
```vue
<Skeleton v-if="loading" :rows="3" />
<EmptyState v-else-if="!items.length" icon="event" :title="t('events.empty')" :action="t('events.search')" @action="router.push('/m/search')" />
<template v-else> … </template>
```
Erorile API → `ui.toast(err.detail)` + buton „Reîncearcă”. Niciodată ecran alb.

## Componente comune (există sau le creezi aici, nu în view)
`AppButton` (primary negru / secondary alb cu bordură / ghost; `size`, `loading`, `icon`), `AppChip` (selectabil), `AppInput`, `AppCard`, `AppSheet` (bottom sheet mobil = dialog pe web), `AppToast`, `EventCard` (poză, dată, titlu, loc + distanță, preț/gratuit, badge 🔥 când `isHot`, bookmark), `OfferCard`, `ActionCard` (dată mare în stânga, +puncte, avatare „X, Y și încă N merg”), `PlaceCard`, `MapView`, `QrCode`, `QrScanner`, `AudioGuideBar`, `EmptyState`, `Skeleton`.

## Stil (Clean Ink) — cheat sheet
- Fundal `bg-[var(--bg)]`, text `text-[var(--ink)]`, secundar `text-[var(--muted)]`, bordură `border-[var(--line)]`.
- Card: `bg-white rounded-2xl p-4`. Buton primar: `bg-[var(--ink)] text-white rounded-[14px] h-12 font-semibold`. Chip: `rounded-full border px-3 h-9`, selectat = negru cu text alb.
- Titluri: `text-[28px] font-semibold tracking-[-0.02em]` (mobil), `text-[32px]` (web). Corp 15–16px, secundar 13px.
- Badge-uri: Popular `bg-[var(--yellow)]`, puncte `bg-[var(--green)] text-white`, ofertă `bg-[#FFE8E2] text-[var(--accent)]`.
- Icon: `<span class="msym">event</span>` (Material Symbols Outlined).
- Mobil: zonă de conținut cu `pb-24` ca tab bar-ul să nu acopere butonul de jos; butonul principal al ecranului e fix jos (`fixed bottom-20 inset-x-4`).

## Capcane
- Leaflet are nevoie de `import 'leaflet/dist/leaflet.css'` și de `invalidateSize()` după ce containerul devine vizibil (tab-uri, sheet-uri).
- Camera (`html5-qrcode`) merge doar pe HTTPS sau `localhost`; pe telefon real folosiți URL-ul Netlify sau `npm run dev -- --host` + certificate, altfel testați cu input manual de cod.
- `speechSynthesis` pornește doar dintr-un handler de tap; pe iOS vocile se încarcă asincron (`onvoiceschanged`).
- Datele vin ca ISO cu offset — formatează cu `useFormat`, nu cu `toLocaleString` direct.
- Nu scrie `/api/v1` în cod: vine din `VITE_API_URL`.
