# STATUS — memoria echipei (se actualizează la finalul fiecărui task)

Ultima actualizare: 2026-11-06 (kit inițial, înainte de cod)

## Task-uri
| Task | Stare | Cine | Branch / PR | Note |
|---|---|---|---|---|
| T00 Repo & tooling | IN PROGRESS | kit | — | docker-compose, .env.example, .gitignore, CLAUDE.md, skills, docs — de făcut: `git init`, remote, CI opțional |
| T01 API skeleton | IN PROGRESS | kit | — | schelet scris în avans (api/README.md): pom, config, security JWT, erori, health, V1, teste — **de compilat** (`mvn test`) și de rulat o dată |
| T02 APP skeleton | IN PROGRESS | kit | — | schelet construit și verificat (`npm run build/test` verzi): layout-uri, router cu toate rutele, client API, auth store, componente de bază, i18n, PWA. Lipsesc: MapView, QrCode/QrScanner, AppSheet (vin în task-urile lor) |
| T03 Auth & roluri | TODO | | | migrarea V2 + seed-ul V2_1 (conturi demo) există |
| T04 Deploy v0 | TODO | | | |
| T05 Locuri & ghid | TODO | | | migrarea V3 + seed-ul V3_1 (12 locuri reale, 33 puncte de ghid) există; de adăugat pozele |
| T06 Evenimente | TODO | | | migrarea V4 + seed-ul V4_1 (21 evenimente reale + 9 demo) există |
| T07 Bilete | TODO | | | |
| T08 Hartă | TODO | | | |
| T09 Firme & panou | TODO | | | |
| T10 Oferte & coduri | TODO | | | |
| T11 Comunitate & puncte | TODO | | | |
| T12 Chat AI | TODO | | | |
| T13 Planificator itinerar | TODO | | | |
| T14 Admin | TODO | | | |
| T15 i18n / PWA / Android | TODO | | | |
| T16 Deploy final & demo | TODO | | | |

Stări: TODO · IN PROGRESS · REVIEW · DONE · BLOCKED (cu motiv).

## Următorul număr de migrare Flyway liber
`V5` (V1 baseline, V2 users/businesses, V3 places, V4 events — toate scrise și verificate pe Postgres 16 la 6 nov). Cine ia un număr îl scrie aici imediat, ca să nu se ciocnească două PR-uri. V5 = tickets + reviews (T07), V6 = announcements + google_place_id (T09), V7 offers, V8 community/points, V9 itineraries.

## Decizii luate
- 2026-11-06 · Email + parolă în loc de cod pe e-mail (prototip) — fără server de mail de configurat.
- 2026-11-06 · Un singur proiect Vue cu `mobile/` și `web/` + `shared/`; PWA din start, Capacitor opțional la final.
- 2026-11-06 · Plata biletelor e simulată; „Plată demonstrativă” vizibil în UI.
- 2026-11-06 · OpenAI doar prin backend; răspunsuri de fallback pentru demo.
- 2026-11-06 · Hărți: Leaflet + OSM + OSRM public. Fără Google Maps.
- 2026-11-06 · Ghid audio: `speechSynthesis` în browser; OpenAI TTS doar dacă rămâne timp.
- 2026-11-06 · Cetatea Aradului și Turnul de Apă sunt obiective „doar exterior” (`exterior_only`) — interiorul nu se vizitează (unitate militară / închis). Ghidurile sunt scrise din exterior.
- 2026-11-06 · Evenimentele reale sunt `EXTERNAL` cu link spre organizator; cele cu bilete în aplicație sunt fictive și marcate `is_demo`.
- 2026-11-06 · Google: doar citire (rating/recenzii Places, opțional T17) + link „Google Calendar” fără login; fără OAuth/sincronizare inversă.

## Probleme cunoscute / de rezolvat
- (nimic încă)

## Ce a rămas în afara planului (idei pentru „ce urmează” în pitch)
- Notificări push, recenzii la evenimente, plăți reale, limba maghiară, traducere automată a ghidului.
