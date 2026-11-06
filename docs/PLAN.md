# AradExperience — Plan de implementare (Hack4Arad 2026)

Toate funcționalitățile, împărțite în **task-uri de mărime medie** (câteva ecrane + entități + endpoint-uri),
ordonate după dependențe. Fiecare task se poate lua direct de un om + Claude Code și se verifică la final
cu skill-ul `task-workflow` (secțiunea „Verificare” de mai jos este checklist-ul).

Convenție: `T05` = task, `S3` = ecran din prototipul original (`design/AradExperience.html`),
`E2` / `W2` = ecran nou din `design/AradExperience-extensii.html` (mobil / web).
Contractul de API este în `docs/API.md`, modelul de date în `docs/DATA-MODEL.md`, povestea de demo în `docs/DEMO.md`.

## Graful de dependențe

```
T00 Repo & tooling
 ├─ T01 API skeleton ──┐
 └─ T02 APP skeleton ──┤
                       ├─ T03 Auth & roluri ──┬─ T05 Locuri & ghid virtual ─┐
                       └─ T04 Deploy v0       │                             ├─ T08 Hartă & indicații ─┐
                                              ├─ T06 Evenimente ───────────┤                         │
                                              │     └─ T07 Bilete           ├─ T12 Chat AI             │
                                              ├─ T09 Firme & panou          │     └─ T13 Planificator itinerar (T05, T08, T12)
                                              │     └─ T10 Oferte & coduri  │
                                              └─ T11 Comunitate & puncte (T03, T10 pentru plata cu puncte)
                                                    └─ T14 Admin (T09, T10, T11)
T15 i18n + PWA/Capacitor (după ce există ecranele) · T17 Google Places rating/recenzii (opțional, după T05 + T09)
T16 Deploy final, seed de producție, demo (toate)
```

Paralelizare naturală după T03: **T05 + T06** (conținut), apoi **T07 / T08 / T09** în paralel, apoi **T10 + T11 + T12** în paralel, apoi **T13 + T14**.
Linia de demo (obligatoriu să meargă duminică): T00–T13 + T16. T14 și T15 sunt „dacă mai e timp”, dar admin-ul e mic.

Reguli de dimensiune: un task = max ~4–6 ore pentru un om cu Claude. Dacă depășește, se taie în `T05a/T05b` în STATUS.md, nu se lungește.

---

## Faza 0 — Fundație

### T00 · Repo & tooling
**Scop:** monorepo cu tot ce trebuie ca oricine să poată rula proiectul în 5 minute.
**Depinde de:** —

- Structură: `api/` (Spring Boot), `app/` (Vue), `docs/`, `design/`, `.claude/skills/`, `CLAUDE.md`, `README.md`.
- `docker-compose.yml` cu `postgres:16` (db `aradexperience`, user/parolă `arad`/`arad`, port 5432, volum). Nu băgăm încă API/APP în compose — doar DB.
- `.env.example` la rădăcină (vezi mai jos) + `.gitignore` (`.env`, `node_modules`, `target`, `dist`, `.idea`, `.vscode`, `*.log`).
- Copiezi `docs/`, `.claude/`, `CLAUDE.md` din kit. `docs/STATUS.md` e „memoria” echipei — se actualizează la fiecare task.
- Opțional (15 min): GitHub Actions `ci.yml` care rulează `mvn -q test` în `api/` și `npm ci && npm run build && npm run test` în `app/` pe PR.

`.env.example`:
```
POSTGRES_URL=jdbc:postgresql://localhost:5432/aradexperience
POSTGRES_USER=arad
POSTGRES_PASSWORD=arad
JWT_SECRET=schimba-ma-cu-32-caractere-minim-random
JWT_EXPIRATION_HOURS=24
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173
VITE_API_URL=http://localhost:8080/api/v1
```

**Verificare:** `docker compose up -d` pornește DB; `git status` nu arată `.env`; README explică cele 3 comenzi (db, api, app).

### T01 · API skeleton (Spring Boot)
**Scop:** aplicație Spring care pornește pe Postgres, cu migrări, erori standard, OpenAPI, test de fum.
**Depinde de:** T00
**Stare:** schelet scris în `api/` (vezi `api/README.md`) — rămâne de compilat, rulat și corectat ce nu trece. Migrările **V1–V4 + seed-urile V2_1, V3_1, V4_1 sunt scrise și verificate pe Postgres 16** (T03, T05, T06 pornesc cu schema și datele gata).

- Java 21, Spring Boot 3.3+, Maven. Dependențe: web, data-jpa, validation, security, flyway, postgresql, springdoc-openapi-starter-webmvc-ui, jjwt (api/impl/jackson), lombok, actuator; test: spring-boot-starter-test, testcontainers (postgresql, junit-jupiter).
- Pachet de bază `ro.aradexperience.api`. Module = pachete pe funcționalitate (`auth`, `users`, `places`, `events`, `tickets`, `business`, `offers`, `community`, `points`, `ai`, `itineraries`, `admin`) + `common` (`config`, `security`, `error`, `util`).
- `application.yml` citește din env (`POSTGRES_URL` etc., cu valori implicite pentru local). Profiluri: `default` (local), `prod`.
- Flyway activ, `src/main/resources/db/migration/V1__baseline.sql` gol sau cu extensia `pgcrypto`. Convenție: `V{n}__{modul}.sql` pentru schemă, `V{n}_1__seed_{modul}.sql` pentru date de seed (fiecare task își adaugă migrarea proprie, nu modifică migrările vechi).
- `common/error/GlobalExceptionHandler` → răspunsuri RFC 7807 (`ProblemDetail`): 400 validare (cu lista `errors[]`), 401, 403, 404 (`NotFoundException`), 409 (`ConflictException`), 500.
- CORS din `CORS_ORIGINS`. `GET /api/v1/health` → `{status:"ok", time}`. Swagger UI pe `/swagger-ui.html`.
- `Dockerfile` multi-stage (maven build → eclipse-temurin:21-jre), `EXPOSE 8080`.
- Test: `ApiSmokeTest` (`@SpringBootTest` + Testcontainers Postgres) care verifică `/health`. Dacă Docker nu e disponibil pe mașină, testul se marchează `@EnabledIf` și se sare.

**Verificare:** `mvn spring-boot:run` pornește, Flyway aplică V1, `/health` răspunde, Swagger se deschide, `mvn test` verde.

### T02 · APP skeleton (Vue 3)
**Scop:** proiectul Vue cu cele două „aplicații” (mobil + web), design tokens Clean Ink, client API, PWA.
**Depinde de:** T00
**Stare:** schelet construit și verificat în `app/` (vezi `app/README.md`); rămân componentele MapView / QrCode / QrScanner / AppSheet, care vin în task-urile lor.

- `npm create vite@latest app -- --template vue-ts`; adaugi: vue-router, pinia, tailwindcss, vue-i18n, @vueuse/core, leaflet + @types/leaflet, qrcode, html5-qrcode, vite-plugin-pwa; dev: vitest, @vue/test-utils, eslint + prettier.
- Structură:
  ```
  app/src/
    shared/      api/ (client.ts, auth.ts, events.ts …)  types/api.ts (oglinda docs/API.md)
                 stores/ (auth, ui)  components/ (Button, Card, Chip, Input, Sheet, Toast, EventCard, OfferCard, MapView, QrCode, QrScanner)
                 composables/ (useGeo, useTts, useFormat)  i18n/ (ro.json, en.json)  styles/tokens.css
    mobile/      layouts/MobileLayout.vue (top bar + bottom tabs)  views/…
    web/         layouts/WebLayout.vue (sidebar + content)         views/…
    router/      index.ts (rute /m/* și /w/*; `/` redirecționează după lățime: <768px → /m, altfel /w; query `?ui=m|w` forțează)
  ```
- Tokens (din prototip): fundal `#F7F7F2`, ink `#111111`, text secundar `#5C5C5C`, border `#D6D6D0`, accent `#FF5A36`, verde puncte `#1F3A1A`/`#2E4A1F`, galben ofertă `#FFC43D`, card `#FFFFFF` radius 16, buton primar negru radius 14 h48, chip radius 999. Font Inter (Google Fonts), icon-uri Material Symbols Outlined.
- `shared/api/client.ts`: `fetch` wrapper cu `VITE_API_URL`, header `Authorization: Bearer`, parsare ProblemDetail → `ApiError`, 401 → logout + redirect login.
- Componente de bază + `MobileLayout` cu tab bar: Evenimente · Chat · Hartă (buton rotund central) · Bilete · Salvate (pentru firmă/primărie tab-ul Bilete devine Panou). `WebLayout`: sidebar stânga cu meniu în funcție de rol.
- PWA: `vite-plugin-pwa` cu manifest (nume, icon 512, `display: standalone`, culoare `#111111`), service worker implicit.
- Pagini placeholder pentru toate rutele din `docs/API.md` §Rute FE, ca să existe navigația de la început.

**Verificare:** `npm run dev` → `/` redirecționează corect pe telefon vs desktop; tab bar funcțional; `npm run build` fără erori; Lighthouse arată „installable”.

### T03 · Auth & roluri
**Scop:** conturi, login, JWT, roluri și conturile demo.
**Depinde de:** T01, T02

- BE (`V2__users_businesses.sql`): tabelele `users`, `businesses` (vezi DATA-MODEL). `auth`: `POST /auth/register`, `POST /auth/login`, `GET /me`, `PATCH /me`. Roluri: `VISITOR, LOCAL, BUSINESS, CITY_HALL, ADMIN`. Înregistrarea permite doar `VISITOR | LOCAL | BUSINESS` (BUSINESS creează și un rând în `businesses` cu `verified=false`). `CITY_HALL` și `ADMIN` doar din seed.
- Security: `JwtAuthFilter` (Bearer), `SecurityConfig` stateless, BCrypt, reguli: `/auth/**`, `/health`, `/swagger-ui/**`, `/v3/api-docs/**`, `GET /places/**`, `GET /events/**`, `GET /offers/**`, `GET /community/**`, `GET /businesses/**` publice; restul autentificat; `/business/**` → BUSINESS, `/city/**` → CITY_HALL|ADMIN, `/admin/**` → ADMIN. `@AuthenticationPrincipal` → `CurrentUser(id, role)`.
- Seed `V2_1__seed_users.sql`: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro` (+ business „Cafeneaua din Pasaj”, verified), `primaria@demo.ro`, `admin@demo.ro`, toate cu parola `demo1234` (hash BCrypt generat o dată și pus în SQL).
- FE: `stores/auth.ts` (token în localStorage, `user`, `login/register/logout/fetchMe`), guard-uri pe rute (`meta.roles`), ecran login/înregistrare mobil (S12 adaptat: email + parolă + alegere rol Vizitator/Localnic/Firmă) și web (`/w/login`). Buton „Conturi demo” care completează rapid fiecare cont (doar în dev/demo).
- Profil (S11): afișează contul, rolul, limba; „Deconectare”.

**Verificare:** register + login din ambele UI; `GET /me` cu token; acces refuzat (403) la `/city/**` cu cont de vizitator; teste: `AuthServiceTest` (register duplicat → 409, parolă greșită → 401), `JwtServiceTest` (emitere/validare/expirare).

### T04 · Deploy v0 („hello world” în producție)
**Scop:** să existe de sâmbătă un URL public pentru API și APP, ca deploy-ul final să fie doar un push.
**Depinde de:** T01, T02 (paralel cu T03)

- DB: Neon sau Render Postgres (free). API: Render Web Service din `api/Dockerfile`, env din `.env.example` (fără valori locale), `CORS_ORIGINS` = URL Netlify. APP: Netlify, build `npm run build`, publish `app/dist`, `app/public/_redirects` cu `/* /index.html 200`, `VITE_API_URL` = URL Render.
- Documentezi în `docs/DEPLOY.md`: unde e fiecare, cine are acces, cum se face redeploy.

**Verificare:** `https://<api>/api/v1/health` ok; APP publicată apelează `/health` și afișează „API online” pe un ecran de debug/profil.

---

## Faza 1 — Conținut și evenimente

### T05 · Locuri & ghid virtual
**Scop:** obiectivele turistice din Arad cu ghid scris + audio pe puncte de interes (ecranul E3), baza pentru hartă și itinerar.
**Depinde de:** T03 (pentru CRUD-ul de admin), T01/T02

- BE (`V3__places.sql`): `places`, `guide_points`. Endpoint-uri publice: `GET /places?type&q`, `GET /places/{id}` (include `guidePoints[]` ordonate). Admin: `POST/PUT/DELETE /admin/places`, `POST/PUT/DELETE /admin/places/{id}/guide-points`.
- **Gata:** `V3__places.sql` + `V3_1__seed_places.sql` (12 locuri reale, 33 puncte de ghid, coloana `exterior_only` pentru Cetate/Turnul de Apă — vezi `docs/ARAD-DATA.md`). De făcut: pozele (descărcate de pe Wikimedia, cu credit) și eventual EN. Lista inițială: Cetatea Aradului, Palatul Cultural (Filarmonica + Muzeul), Teatrul Clasic „Ioan Slavici”, Palatul Administrativ (Primăria), Turnul de Apă, Catedrala „Sfânta Treime”, Biserica Roșie, Faleza Mureșului, Pădurea Ceala, Podgoria Miniș (Crama Dealul Miniș — fictivă în prototip, poate fi un producător real), Castelul Macea, Moneasa. Fiecare: coordonate corecte, program, durată de vizită, 3–6 puncte de ghid de câte 60–120 de cuvinte (generate cu Claude/GPT, verificate sumar).
- FE mobil `/m/places/:id` (E3): hero, „Ghid virtual · N puncte · M min”, bară audio (play/pauză, punctul curent, viteză), lista punctelor cu text; „Următorul punct”; „Indicații” (→ T08). Web `/w/places/:id` cu aceeași structură pe lățime mare.
- `composables/useTts.ts`: `speechSynthesis` cu `lang = 'ro-RO'` (fallback `en-US`), play/pause/stop, evidențiază punctul curent. Opțional mai târziu: `POST /ai/tts` cu OpenAI TTS care returnează mp3 (cache pe disc) — doar dacă vocea din browser e slabă pe telefonul de demo.

**Verificare:** detaliul unui loc arată toate punctele; audio pornește/oprește pe Android și iOS (iOS cere tap pe buton — nu autoplay); `PlaceServiceTest` (not found → 404, ordonarea punctelor).

### T06 · Evenimente — listare, căutare, detaliu, salvate
**Scop:** inima aplicației: S1, S2, S3, Salvate, hot events; pagini web echivalente.
**Depinde de:** T03, T05

- BE (`V4__events.sql`): `events`, `saved_events`. `GET /events` cu filtre `from,to,category,near=lat,lng,radiusKm,organizerBusinessId,organizerType,hot,q,page,size`, sortare după `startAt`; `GET /events/{id}`; `POST/DELETE /events/{id}/save`; `GET /me/saved-events`. `isHot` = `participantsCount >= 50 || savesCount >= 20` (praguri în config). `distanceKm` calculat în DTO când vine `near`.
- Creare evenimente: `POST /events` (CITY_HALL/ADMIN) și `POST /business/events` (T09). În T06 e suficient seed-ul.
- **Gata:** `V4__events.sql` + `V4_1__seed_events.sql` (21 evenimente reale din nov–dec 2026 — Filarmonica, Teatrul Clasic, Târgul de Crăciun, UTA — marcate `is_demo=false`, + 9 demo cu `is_demo=true`). Lista orientativă inițială era: 15–20 evenimente reale/plauzibile pe 7–30 nov 2026 (Filarmonica, Teatrul Clasic, expoziții la Palatul Cultural, tur ghidat la Cetate, târg de produse locale, meci UTA, Festivalul vinului Miniș etc.), categorii: `CONCERT, THEATRE, FAMILY, EXHIBITION, SPORT, OUTDOOR, FAIR, FOOD`.
- FE mobil: S1 Acasă (header „Ce faci în Arad?”, căutare, cele 3 carduri Evenimente/Oferte/Comunitate, chips Azi/Weekend/7 zile, lista), S2 Căutare + filtre (sheet), S3 Detaliu (hero, bilete, dată, loc + „Indicații”, preț, descriere, „🔥 Popular · N participă”), Salvate. Web: `/w/events` grid + filtre, `/w/events/:id`.
- `EventCard` în `shared/components` folosit de ambele UI.

**Verificare:** filtrele funcționează pe date reale; „near” ordonează după distanță; salvare persistă după refresh; `EventQueryTest` (filtru dată/categorie, hot), `EventServiceTest` (save/unsave idempotent).

### T07 · Bilete & înscriere la evenimente
**Scop:** S4 → S5 → S6 → S9 → S10 cu plată simulată și cod QR.
**Depinde de:** T06

- BE (`V5__tickets.sql`): `tickets`. `POST /events/{id}/tickets {qtyAdult, qtyChild, email}` → validează capacitate (`capacity - participantsCount`), calculează totalul din `priceAdult/priceChild`, generează `code = AX-T{eventId}-{6 alfanumerice}`, incrementează `participantsCount`. `GET /me/tickets?upcoming=true|false`, `GET /tickets/{code}` (doar proprietar/organizator/admin), `POST /tickets/{code}/use` (organizator/admin). Evenimente `FREE` → bilet gratuit cu același flux („Înscrie-te”), `EXTERNAL` → doar link.
- „Plata”: FE arată S5 cu card salvat/nou; BE nu procesează nimic — se confirmă direct. În UI scrie „Plată demonstrativă”.
- FE mobil: S4 (date, Adult/Copil, total), S5 (email + metodă), S6 (confirmare), S9 (Viitoare/Trecute), S10 (bilet cu QR generat din `code` cu `qrcode`, „funcționează offline” — cache-uim biletele în localStorage). Web: „Biletele mele” în Contul meu (W14).
- **Calendar:** `GET /events/{id}/ics` (fișier .ics) + link „Google Calendar” construit în FE (template URL, fără login) pe S3/W6 și pe bilet.
- **Recenzii (partea 2, dacă e timp în T07 sau la T15):** tabela `reviews` (în V5), `GET/POST/PUT /events/{id}/reviews` doar după ce evenimentul a trecut, 1–5 stele + text, media pe S3/W6 și pe pagina firmei. Vezi `docs/FEATURES.md` §9.

**Verificare:** cumpărare → apare în Biletele mele → QR-ul se scanează cu telefonul și conține codul; capacitate epuizată → 409 cu mesaj afișat; `TicketServiceTest` (capacitate, total, cod unic).

### T08 · Hartă & indicații
**Scop:** S7 + „Indicații” de oriunde; componenta de hartă refolosită de itinerar (T13).
**Depinde de:** T05, T06

- `shared/components/MapView.vue` (Leaflet, tile-uri OSM `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, atribuire): props `markers[] {id, lat, lng, kind: event|place|offer|action, label}`, `route?: LatLng[]`, `selectedId`, `userLocation`; emite `select`. Pin-uri numerotate când `numbered=true`.
- `composables/useRoute.ts`: OSRM public `https://routing.openstreetmap.de/routed-{foot|car}/route/v1/driving/{lng,lat};{lng,lat}?overview=full&geometries=geojson` → polilinie + durată + distanță. Fallback: linie dreaptă + estimare 5 km/h / 30 km/h dacă OSRM pică.
- `composables/useGeo.ts`: `navigator.geolocation` cu fallback pe centrul Aradului (46.1866, 21.3123).
- FE mobil S7: hartă full-screen, căutare, chips Azi/Weekend/7 zile, filtre Locuri/Evenimente/Oferte, categorii; tap pe pin → card preview jos → „Arată traseul” (pe jos/mașină) / „Deschide”. „Indicații” din S3/E3/oferte deschide S7 centrat cu traseu. Web: hartă în `/w` landing și `/w/map` cu lista în stânga.
- Opțional: buton „Deschide în Google Maps” (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`) — util real pe telefon.

**Verificare:** pin-urile corespund filtrelor; traseul se desenează între locația mea și pin; fără internet la OSRM se afișează linia dreaptă fără eroare în consolă.

---

## Faza 2 — Firme, oferte, comunitate

### T09 · Firme: profil, evenimente, anunțuri, panou
**Scop:** rolul Firmă locală: pagina publică a firmei, publicare evenimente și anunțuri, panoul cu statistici (E5 pentru mobil, W-panou pentru web).
**Depinde de:** T03, T06

- BE (`V6__business_posts.sql`): `announcements` (+ `events.organizer_business_id` există din V4). `GET /businesses/{id}` (profil + evenimente viitoare + oferte active + anunțuri), `GET /business/me` (firma mea + `stats {views, codesUsed, pointsPayments, upcomingEvents}`), `PUT /business/me`, `POST/PUT/DELETE /business/events`, `GET /business/events`, `POST/DELETE /business/announcements`, `GET /business/activity` (ultimele 20: cod folosit, ofertă salvată, înscriere la eveniment). Firma neverificată poate crea, dar conținutul rămâne `DRAFT` până la verificare (T14) — pentru demo firma din seed e verificată.
- FE web `/w/business`: dashboard (3 statistici), tab-uri **Oferte / Evenimente / Anunțuri / Coduri**, formulare de creare (sheet pe mobil, pagină pe web), activitate recentă. FE mobil `/m/panel` (E5): aceleași tab-uri simplificate + butonul „Validează cod”. Pagina publică a firmei `/m/businesses/:id` și `/w/businesses/:id`.
- Evenimentele firmei apar în S1/S2 ca orice eveniment, cu „Organizat de {firmă}”.

**Verificare:** o firmă creează un eveniment și îl vede în lista publică; anunțul apare pe pagina firmei; firma nu poate edita evenimentul altei firme (403); `BusinessServiceTest`.

### T10 · Oferte & coduri de revendicare
**Scop:** tab-ul Oferte (vizitator/localnic), revendicare cu cod/QR, validare la firmă.
**Depinde de:** T09

- BE (`V7__offers.sql`): `offers`, `offer_redemptions`. Public: `GET /offers?category&localProduct&near`, `GET /offers/{id}` (incrementează `viewsCount`). Autentificat: `POST /offers/{id}/redeem` → `code = AX-O{offerId}-{6}`, status `ISSUED`, o revendicare activă per user per ofertă (409 altfel); `GET /me/redemptions`. Firmă: `POST/PUT/DELETE /business/offers`, `GET /business/offers`, `POST /business/redemptions/use {code}` → `USED` + `usedAt` (409 dacă e deja folosit/nu e al firmei). `pointsPrice` se setează aici, dar debitarea punctelor vine în T11 (până atunci ofertele cu `pointsPrice` se revendică gratuit cu un TODO vizibil).
- Seed `V7_1__seed_offers.sql`: 5–8 oferte (cafea -20%, covrigi 2+1, degustare Miniș, miere „Făcut în Arad”, prăjitură) — pozele sunt în `design/assets/`.
- FE mobil: tab Oferte pe S1 (banner „Doar în AradExperience”, categorii Cafenele/Restaurante/Făcut în Arad/Evenimente, carduri), detaliu ofertă („Revendică” → sheet cu QR + cod + „Arată codul la casă”). Panou firmă (web + mobil): lista ofertelor cu vizualizări/folosite, formular ofertă nouă, ecran „Validează cod” (input + scanner QR cu `html5-qrcode`).

**Verificare:** revendic → cod → firma îl validează → apare în activitatea firmei și `codesUsed` crește; a doua validare dă 409; `OfferRedemptionServiceTest`.

### T11 · Comunitate & puncte (Primărie + Localnic)
**Scop:** bucla principală a demo-ului: acțiune comunitară → înscriere → QR → validare de Primărie → puncte → clasament → plată cu puncte la o firmă.
**Depinde de:** T03, T10

- BE (`V8__community_points.sql`): `community_actions`, `community_registrations`, `points_transactions`; `users.points_balance` ținut sincron de `PointsService` (singurul loc care scrie puncte: `award(userId, amount, refType, refId)`, `spend(...)` cu 409 dacă soldul e insuficient).
- Public: `GET /community/actions?upcoming=true`, `GET /community/actions/{id}` (include `goingPreview[]` — 3 prenume + număr). Localnic: `POST /community/actions/{id}/register` → `code = AX-C{actionId}-{6}`, `DELETE` (anulare), `GET /me/community/registrations`, `GET /me/points` (sold + tranzacții), `GET /community/leaderboard?period=month|year` → top 50 + poziția mea.
- Primărie: `POST/PUT /city/actions`, `GET /city/actions`, `GET /city/actions/{id}/registrations`, `POST /city/registrations/confirm {code}` (din scanner), `POST /city/registrations/{id}/confirm`, `POST /city/registrations/{id}/reject` — confirmarea acordă `pointsReward` o singură dată (idempotent).
- Plata cu puncte: `POST /offers/{id}/redeem` debitează `pointsPrice` prin `PointsService.spend` (completează T10).
- Seed `V8_1__seed_community.sql`: 3 acțiuni (plantare pe Faleză 7 nov +50, curățenie Pădurea Ceala 8 nov +40, donare de sânge 10 nov +80), înscriși fictivi și tranzacții ca să existe un clasament.
- FE mobil (localnic): tab Comunitate pe S1 (card puncte, streak, locul în clasament, acțiuni), detaliu acțiune (+puncte, locuri, pași „cum primești punctele”, „Mă înscriu” → QR-ul meu), clasament (Luna/Anul + premii), în Oferte: „Plătește cu N puncte”. FE web `/w/city` (Primărie): acțiunile mele + înscriși, formular acțiune nouă, **Validare** (listă cu Confirmă/Respinge + „Scanează QR” cu camera), clasament. Mobil `/m/panel` pentru Primărie: doar Scanează QR + lista de azi (pe teren).

**Verificare:** fluxul D din prototip cap-coadă cu două telefoane (localnic + primărie): QR-ul localnicului scanat de primărie → sold +50 → clasamentul se actualizează → oferta cu puncte se plătește și soldul scade; confirmarea de două ori nu dublează punctele; `PointsServiceTest`, `CommunityServiceTest` (capacitate, dublă înscriere 409, confirmare idempotentă).

---

## Faza 3 — AI (diferențiatorul)

### T12 · Chat AI
**Scop:** S8: asistent care răspunde la „ce fac în weekend cu copiii?” cu evenimente reale din DB.
**Depinde de:** T06

- BE modul `ai`: `OpenAiClient` (HTTP, `OPENAI_API_KEY`, `OPENAI_MODEL`, timeout 20 s, retry 1). `POST /ai/chat {messages[], locale}` → `{reply, suggestedEventIds[], quickReplies[]}`. Prompt de sistem: rol, limbă, data curentă, **catalogul compact** al evenimentelor din următoarele 14 zile (id, titlu, categorie, dată, loc, preț, maxim ~60 rânduri) și regula: răspunde scurt, pune o întrebare de clarificare dacă lipsesc ziua/compania, returnează JSON `{reply, suggestedEventIds, quickReplies}` (response_format json_schema). Fără plăți, fără date inventate — doar id-uri din catalog (BE filtrează id-urile inexistente).
- **Plasă de siguranță pentru demo:** dacă API-ul pică/timeout → răspuns pre-scris pentru 3 întrebări tipice (`ai/fallback.json`) + mesaj „răspuns offline”.
- FE mobil S8: istoric mesaje, chips de clarificare (`quickReplies`), carduri de evenimente sub răspuns (`EventCard` compact) → S3. Chat nou. Web: panou de chat în `/w` (dreapta) sau pagină `/w/chat`.

**Verificare:** „Ce pot face cu copiii în weekend?” → întrebare de clarificare → chips → listă cu 2–3 evenimente din DB; cu cheia greșită aplicația nu se blochează; `ChatServiceTest` cu client mock (filtrarea id-urilor, fallback).

### T13 · Planificator de itinerar (E1 → E2 → E4)
**Scop:** vizitatorul spune cât timp are, cum se deplasează și ce îl interesează → program cu obiective, ore, traseu pe hartă, ghid audio la fiecare oprire.
**Depinde de:** T05, T08, T12

- BE (`V9__itineraries.sql`): `itineraries`. `POST /ai/itinerary {date, startTime, hours | days, transport: WALK|CAR|PUBLIC, interests[], freeText, start?{lat,lng}}` → prompt cu **catalogul locurilor** (id, nume, tip, tag-uri, durată de vizită, program, coordonate, distanța față de centru) + oferte/evenimente din ziua respectivă (ca opriri opționale) → JSON `{title, summary, stops:[{order, placeId|eventId|offerId, arriveAt, leaveAt, note, parkingHint?}]}` (json_schema). BE validează id-urile, recalculează orele dacă se suprapun, estimează deplasarea între opriri (haversine × factor pe mod de transport), apoi `POST /itineraries` salvează și întoarce `id` + `shareCode`. `GET /itineraries/{id}`, `GET /me/itineraries`. Fallback: 2 itinerarii pre-generate (pe jos 1 zi, mașină 1 zi) dacă OpenAI pică.
- FE mobil: **E1** wizard (timp: 3 h / jumătate de zi / o zi / 2 zile + data; transport: Pe jos / Mașină / Transport public; interese: Istorie, Crame & vin, Muzee, Natură, Familie, Gastronomie; text liber; „Generează programul” cu stare de încărcare 5–15 s), **E2** rezultat (rezumat, timeline cu opriri, durată, „ghid disponibil”, oferta din traseu, butoane Vezi pe hartă / Pornește ghidul / Salvează / Regenerează), **E4** hartă cu pin-uri numerotate + traseu OSRM înlănțuit + sheet „Oprirea 2 din 5 · 8 min pe jos” (+ „Parcare: …” la mașină). „Pornește ghidul” → E3 al locului curent. Web `/w/plan`: wizard în stânga, rezultat + hartă în dreapta.

**Verificare:** 3 combinații (pe jos 3 h istorie / mașină 1 zi crame / familie jumătate de zi) dau programe coerente cu ore plauzibile și toate opririle pe hartă; itinerarul salvat se redeschide după refresh; `ItineraryServiceTest` (id invalid eliminat, ore fără suprapunere).

---

## Faza 4 — Admin, finisaje, livrare

### T14 · Admin (web) — W3
**Scop:** verificarea firmelor, moderarea conținutului, statistici.
**Depinde de:** T09, T10, T11

- BE `admin`: `GET /admin/stats` (users pe roluri, evenimente, bilete, oferte revendicate, puncte acordate), `GET /admin/businesses?verified=false`, `POST /admin/businesses/{id}/verify`, `PATCH /admin/events/{id}/status`, `PATCH /admin/offers/{id}/status`, `PATCH /admin/actions/{id}/status`, `GET /admin/users?role`.
- FE web `/w/admin`: sidebar (Dashboard, Firme, Evenimente, Oferte, Acțiuni, Utilizatori), tabel „Firme de verificat” cu Verifică/Respinge, tabele cu filtru + ascunde/publică, carduri de statistici.

**Verificare:** firma nouă înregistrată apare la verificat → verificată → ofertele ei devin publice; vizitatorul primește 403 pe `/admin/**`.

### T15 · i18n RO/EN, PWA, Android (opțional)
**Depinde de:** ecranele existente

- Toate textele din UI în `i18n/ro.json` + `en.json` (HU doar dacă rămâne timp — juriul e român). Selector de limbă în Profil.
- PWA: icon, splash, `theme-color`, verificare „Add to Home Screen” pe Android și iOS.
- Capacitor (opțional, ~1 h): `npx cap add android`, `cap sync`, APK de debug pentru demo; cameră nativă pentru scanner QR dacă `html5-qrcode` e lent.

### T17 · (opțional) Rating & recenzii Google pentru obiective și firme
**Depinde de:** T05, T09 · **Doar dacă rămâne timp și există cheie Google cu billing.**
- Coloana `google_place_id` pe `places` (V3 există deja → se adaugă în V5) și `businesses` (V6). BE: `GET /places/{id}/google`, `GET /businesses/{id}/google` → Places API (New) Place Details (`rating`, `userRatingCount`, `reviews` max 5, `googleMapsUri`), cache 24 h în memorie, cheia doar în BE. FE: bloc „Pe Google · 4,6 ★ (1.240)” cu până la 5 recenzii și „Powered by Google”, pe E3/W8 și W15.
- Fără scriere/sincronizare spre Google (ar cere OAuth). Evenimentele cu bilete în aplicație rămân doar în aplicație, marcate „Doar în AradExperience”.

### T16 · Deploy final, seed de producție, demo
**Depinde de:** toate

- Rulezi migrările + seed-ul pe DB-ul de producție, verifici conturile demo, pozele, cheile. Un `docs/DEPLOY.md` actualizat.
- Walkthrough complet `docs/DEMO.md` pe două telefoane + laptop/proiector, cronometrat (≤ 6 min). Înregistrezi un video de backup al demo-ului. Slide-uri (max 8): problema, soluția, cele 4 roluri, demo live, tehnologie într-un slide, ce urmează.
- Îngheț de cod duminică 10:00. După: doar date și fix-uri de 5 minute.

---

## Ce e „done” pentru orice task
1. Codul e pe `main` printr-un PR (branch `feat/T05-places`), build + teste verzi.
2. Criteriile din „Verificare” bifate manual, pe mobil **și** web unde există ambele.
3. `docs/API.md` actualizat dacă s-a schimbat ceva față de contract; `docs/STATUS.md` are task-ul mutat la „Done” + deciziile luate + ce a rămas.
4. Fluxul de demo (`docs/DEMO.md`) încă merge cap-coadă.

---

## Calendar orientativ (dezvoltarea înainte de eveniment e permisă)
| Când | Ce | Țintă la final |
|---|---|---|
| **Vineri 6 nov** | T00, T01, T02 (toți, 2–3 h) → apoi T03 + T04 în paralel → seara: T05 și T06 pornite | API + APP rulează local și în producție, login merge, există locuri și evenimente în DB |
| **Sâmbătă 7 nov** (start 11:00 la UAV) | dimineață: T06 final, T07, T08, T09 · după-amiază: T10, T11, T12 · seara/noaptea: T13, verificări pe fluxul de demo | Toată bucla comunitate → puncte → ofertă merge pe două telefoane; chat + itinerar funcționale |
| **Duminică 8 nov** | până la 10:00: T14 (dacă e timp), T16 (seed prod, video backup, slide-uri) · 10:00 îngheț de cod · 12:00 prezentări | Demo de 6 minute, repetat de 2 ori, cu plan B |

Regula de aur pentru noapte: la 02:00 opriți feature-urile noi și faceți doar stabilizare; un om doarme 4 ore pe rând ca să fie cineva limpede dimineața.

---

## Direcții viitoare (după hackathon) — de pus în pitch la „ce urmează”
- Plăți reale (Stripe/Netopia) și anularea biletelor; notificări push (PWA) pentru mementouri și acțiuni noi.
- Sincronizare bidirecțională cu Google Calendar (OAuth) și import automat al evenimentelor instituțiilor (scraping/API-uri: Filarmonica, Teatrul Clasic, Primăria).
- Rating & recenzii Google (T17), recenzii la obiective, traducere automată RO→EN/HU a ghidului și voce naturală (OpenAI TTS).
- Transport public în itinerar (orare CTP Arad, tramvaiul Arad–Ghioroc), parcări în timp real.
- Parteneriate reale cu firme (program de puncte al orașului), rapoarte pentru Primărie (participare, impact), gamificare pentru vizitatori (badge-uri la obiective).
