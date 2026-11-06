# Echipa — 4 oameni, 4 culoare (lanes)

| Culoar | Om | Ce face |
|---|---|---|
| **P1** | **Zoltan** | Platformă, auth, livrare + găzduiește Lead Tehnic și QA & Demo |
| **P2** | **Lukas** | Experiența vizitatorului: locuri, evenimente, bilete |
| **P3** | **Octav** | Hărți & AI: hartă, chat, planificator, pitch |
| **P4** | **Damian** | Firme & comunitate: firme, oferte, puncte (bucla de demo) |

Fiecare om are **un agent Paperclip** pereche, care rulează **pe laptopul lui, cu abonamentul lui Claude** (configurare: `tools/paperclip/README.md`). Paperclip-urile nu comunică între ele: **GitHub (PR-uri) și `docs/status/Px.md` sunt sursa comună de adevăr.** Pe laptopul lui Zoltan mai rulează **Lead Tehnic** (urmărește PR-urile tuturor, ține `docs/STATUS.md`) și **QA & Demo** (review + merge la fiecare PR, rulează fluxul din `DEMO.md`).
**T00 (repo pe GitHub + invitații) e primul: până atunci ceilalți nu pot începe.**

## Task-uri și ore

| | P1 · Zoltan | P2 · Lukas | P3 · Octav | P4 · Damian |
|---|---|---|---|---|
| Task-uri | T00, T01, T02, T03, T04, T14, T16a | T05, T06, T07, T15 | T08, T12, T13, T16b | T09, T10, T11 |
| Ore (est.) | 1 + 1,5 + 2 + 5 + 2 + 3 + 2 = **16,5** | 3 + 5,5 + 5 + 2,5 = **16** | 4 + 4 + 6 + 2 = **16** | 5 + 4 + 6 = **15** |
| Stretch | — | recenzii la evenimente (T07 partea 2) | T17 Google rating, T19 Transport (tramvai) | T18 Rol Voluntar + mesaje |
| Migrări rezervate | V2 (există); extra V20–V29 | V3, V4 (există), V5; extra V30–V39 | V9; extra V40–V49 | V6, V7, V8, V10; extra V50–V59 |
| Pași din DEMO.md | 9 (admin), deploy | 1, 3 | 2, 4 | 5, 6, 7, 8 |

Review uman în perechi: **Zoltan ↔ Lukas**, **Octav ↔ Damian** (verificare pe telefon real și pe web ≥ 1280 px). QA & Demo face review-ul tehnic și merge-ul.

## Cine ce atinge (ca să nu ne călcăm pe fișiere)
Regula: **editezi doar fișierele culoarului tău.** Dacă îți trebuie o schimbare la altcineva, o ceri în task-ul/PR-ul lui. T02 (P1) creează dinainte toate fișierele de mai jos ca placeholdere, deci nimeni nu mai editează router-ul, navigația sau fișierele `index.ts` comune.

| | P1 · Zoltan | P2 · Lukas | P3 · Octav | P4 · Damian |
|---|---|---|---|---|
| **BE** (`api/.../aradexperience/api/`) | `common/**` (inclusiv `SecurityConfig`, `Role`), `auth`, `users`, `admin`, `health`, `application.yml`, `pom.xml` | `places`, `events`, `tickets` | `ai`, `itineraries` | `business`, `offers`, `community`, `points` |
| **Views mobil** (`app/src/mobile/views/`) | `LoginView`, `ProfileView`, `HomeView` (doar cochilia cu tab-uri), `PlaceholderView` | `HomeEventsTab`, `SearchView`, `EventDetailView`, `EventTicketsView`, `CheckoutView`, `ConfirmView`, `TicketsView`, `TicketView`, `SavedView`, `PlaceView` | `MapPageView`, `ChatView`, `PlanView`, `ItineraryView`, `ItineraryMapView` | `HomeOffersTab`, `HomeCommunityTab`, `OffersView`, `OfferDetailView`, `CommunityView`, `ActionDetailView`, `LeaderboardView`, `BusinessView`, `PanelView` |
| **Views web** (`app/src/web/views/`) | `LoginView`, `AdminView`, `PlaceholderView` | `LandingView`, `EventsView`, `EventDetailView`, `PlacesView`, `PlaceView`, `AccountView` | `MapPageView`, `PlanView`, `ChatView` | `OffersView`, `CommunityView`, `BusinessPublicView`, `BusinessPanelView`, `CityPanelView` |
| **Componente comune** (`app/src/shared/components/`) | `App*`, `EmptyState`, `Skeleton`, `PlaceholderScreen`, `ApiStatus`, `QrCode` | `EventCard`, `PlaceCard`, `AudioGuideBar` | `MapView` | `OfferCard`, `ActionCard`, `QrScanner` |
| **Composables / stores** | `useFormat`, `useGeo`, `stores/auth`, `stores/ui` | `useTts` | `useRoute` | — |
| **API + tipuri FE** (`shared/api/`, `shared/types/`) | `client`, `auth`, `admin`, `health` | `places`, `events`, `tickets` | `ai`, `itineraries` | `business`, `offers`, `community` |
| **i18n** (`shared/i18n/ro/` și `en/`) | `common`, `auth`, `admin` | `places`, `events`, `tickets` | `map`, `chat`, `plan` | `business`, `offers`, `community` |
| **Fișiere comune** | `router/index.ts`, layout-uri, navigație, `types/api.ts` (doar re-export), `docs/STATUS.md` (Lead) | — | — | — |
| **Docs** | `docs/status/P1.md`, `DEPLOY.md` | `docs/status/P2.md` | `docs/status/P3.md`, slide-uri | `docs/status/P4.md` |

`docs/API.md`: fiecare modifică doar secțiunea modulului lui.

### Punctele de contact între culoare (stabilite dinainte)
- **Evenimente create de firme (T09, P4):** P4 apelează `EventService.createForOrganizer/updateForOrganizer/deleteForOrganizer`, pe care le scrie P2 în T06. P4 nu atinge pachetul `events`.
- **Home S1:** P1 face cochilia cu 3 tab-uri; P2 completează `HomeEventsTab`, P4 completează `HomeOffersTab` și `HomeCommunityTab`.
- **`EventCard` compact** pentru chat (T12, P3): P2 îl expune în T06 cu prop-ul `compact`.
- **Coloana `google_place_id`** (pentru T17, P3): P2 o adaugă pe `places` în V5, P4 pe `businesses` în V6. P3 doar o citește.
- **Rolul `VOLUNTEER`** (T18, stretch): P4 o cere lui P1 (enum `Role` + `SecurityConfig`).
- **Admin (T14, P1):** schimbă doar `status` prin repository-urile existente ale celorlalți, după ce T09–T11 sunt în `main`.
- **Indicații** din ecranele lui P2/P4: link spre ruta hărții (`/m/map?to=lat,lng`, `/w/map?to=`) a lui P3. Singura excepție: mini-harta de pe landing (`LandingView`, al lui P2) importă `MapView` după T08.
- **`SecurityConfig` și selectorul de limbă:** le face P1 în T03 pentru toate endpoint-urile din `docs/API.md` și pentru Profil/`WebLayout`; ceilalți nu le ating.
- **Chat pe web:** doar pagina `/w/chat` (P3), fără panou în layout-ul lui P1.
- **Import da, editare nu:** poți importa și apela codul altui culoar (servicii, repository-uri, componente, `shared/api/<modul>`), dar nu-l modifici.

## Calendar
| Când | P1 · Zoltan | P2 · Lukas | P3 · Octav | P4 · Damian |
|---|---|---|---|---|
| **Vineri 6 nov, seara** | T00 (repo GitHub, invită echipa), T01, T02 (structura anti-conflict) → T03 | T05 (poze + ecrane), pregătește T06 | T12 BE (`OpenAiClient`, `fallback.json`) + `MapView` pentru T08 | seed-uri V6/V7/V8 (firme, oferte, acțiuni) + schelet T09 |
| **Sâmbătă 7 nov, dimineața** | T04 deploy v0 | T06 final | T08 | T09 |
| **Sâmbătă, după-amiaza** | T14 BE + FE | T07 | T12 final | T10 |
| **Sâmbătă, seara/noaptea** | integrare, `main` verde, fluxul de demo | T15 (limbă, PWA) | T13 | T11 (bucla de puncte) |
| **Duminică 8 nov, până la 10:00** | T16a deploy final + seed prod | stabilizare, telefon A în demo | T16b slide-uri + video de rezervă | stabilizare, telefon B în demo |

10:00 îngheț de cod · 12:00 prezentări · la 02:00 noaptea se opresc feature-urile noi (doar stabilizare).

## Linia de demo (obligatoriu)
T00–T13 + T16. T14, T15 și tot ce e „stretch” doar dacă linia de demo e verde.
