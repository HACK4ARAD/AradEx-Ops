# app/ — schelet de pornire (T02), construit și verificat

```
cd app
npm install
npm run dev          # http://localhost:5173  → /m (mobil) sau /w (web); forțează cu ?ui=m sau ?ui=w
npm run build        # vue-tsc + vite build + PWA (service worker, manifest)
npm run test         # vitest (useFormat.test.ts)
cp .env.example .env # VITE_API_URL, VITE_DEMO=true (arată butoanele „Conturi demo” pe login)
```

Ce conține:
- Vite 8 + Vue 3.5 + TypeScript strict, Pinia, Vue Router 4, Tailwind CSS 4 (tokens Clean Ink în `src/shared/styles/base.css`, clase `bg-bg text-ink text-muted border-line bg-accent bg-green bg-yellow bg-peach`), vue-i18n (RO/EN), PWA (`vite-plugin-pwa`, manifest + icon-uri), fonturi locale (Inter, Material Symbols în `public/fonts`).
- `src/shared/types/api.ts` — toate DTO-urile din `docs/API.md`. `src/shared/api/client.ts` — fetch wrapper (Bearer, ProblemDetail → `ApiError`, 401 → logout). `auth.ts`, `health.ts`.
- `src/shared/stores/auth.ts` (login/register/me/logout, `hasRole`), `ui.ts` (toast-uri).
- `src/shared/components/` — AppIcon, AppButton, AppChip, AppCard, AppInput, EmptyState, Skeleton, AppToast, ApiStatus, PlaceholderScreen.
- `src/shared/composables/useFormat.ts` — date/bani/km/minute/puncte în română (+ test).
- `src/mobile/` — `MobileLayout` (tab bar cu Hartă în centru; Firma/Primăria văd „Panou” în loc de „Bilete”), `HomeView` (S1/E6 fără listă), `LoginView` (S12 cu conturi demo).
- `src/web/` — `WebLayout` (bară sus + sidebar pe `/w/business`, `/w/city`, `/w/admin`), `LandingView` (W1), `LoginView`.
- `src/router/index.ts` — toate rutele din `docs/API.md` §Rute FE; cele neimplementate afișează `PlaceholderView` cu codul ecranului și task-ul; guard pe `meta.roles`; `/` redirecționează după lățime.

Următorul pas: T03 (login real pe API) apoi T05/T06 cu skill-ul `fe-feature` — înlocuiești `PlaceholderView` rută cu rută.
