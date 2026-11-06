# Echipa — 4 oameni, 4 culoare (lanes)

Fiecare om are **o culoare** cu task-urile lui din `docs/PLAN.md` și **un agent Paperclip** pereche (compania HACK4ARAD, http://127.0.0.1:3100).
Culoarele sunt tăiate pe module, ca să nu se calce pe fișiere: fiecare are pachetele lui din `api/` și view-urile lui din `app/`.
Efort estimat ~15–16 h de om + Claude pentru fiecare, plus 1–2 h de stretch.

| | Persoana 1 · Platformă & livrare | Persoana 2 · Experiența vizitatorului | Persoana 3 · Hărți & AI | Persoana 4 · Firme & comunitate |
|---|---|---|---|---|
| Task-uri | T00, T01, T02, T03, T04, T14, T16a | T05, T06, T07, T15 | T08, T12, T13, T16b | T09, T10, T11 |
| Ore (est.) | 1 + 1,5 + 0,5 + 5 + 2 + 3 + 2 = **15** | 3 + 5 + 5 + 3 = **16** | 4 + 4 + 6 + 2 = **16** | 5 + 4 + 6 = **15** |
| Stretch | — | recenzii la evenimente (T07 partea 2) | T17 Google rating, T19 Transport (tramvai) | T18 Rol Voluntar + mesaje |
| BE (pachete) | `common`, `auth`, `users`, `admin`, `health` | `places`, `events`, `tickets` | `ai`, `itineraries` | `business`, `offers`, `community`, `points` |
| FE (view-uri) | layout-uri, login, profil, `/w/admin`, i18n infra | Acasă, căutare, detaliu eveniment/loc, bilete, salvate | `MapView`, hartă, chat, planificator | panou firmă, oferte, comunitate, clasament, `/w/city` |
| Migrări rezervate | V2 (există) | V3, V4 (există), V5 | V9 | V6, V7, V8 |
| Agent Paperclip | P1 · Platformă & Livrare | P2 · Experiența Vizitatorului | P3 · Hărți & AI | P4 · Firme & Comunitate |
| Pași din DEMO.md | 9 (admin), deploy | 1, 3 | 2, 4 | 5, 6, 7, 8 |

Comune: **Lead Tehnic** (agent) ține `STATUS.md`, ordinea dependențelor și numerele de migrare; **QA & Demo** (agent) face review la fiecare branch cu checklist-ul din `task-workflow` și rulează fluxul din `DEMO.md`.
Review uman în perechi: **P1 ↔ P2**, **P3 ↔ P4** (verificarea pe telefon real și pe web ≥ 1280 px).

## Fișiere comune (atenție la conflicte)
`docs/API.md`, `app/src/shared/types/api.ts`, `app/src/router/index.ts`, `app/src/shared/i18n/ro.json`, `SecurityConfig.java`, `docs/STATUS.md`.
Regula: commit mic, separat, pe `main` cât mai repede (rebase des); la `ro.json` fiecare adaugă doar cheile lui sub prefixul modulului (`events.*`, `offers.*` …).

## Calendar
| Când | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| **Vineri 6 nov, seara** | T00 (repo GitHub, invită echipa), T01 compilat, T02 → T03 | T05 (poze + ecrane), pregătește T06 | T12 BE (`OpenAiClient`, `fallback.json`) + `MapView` pentru T08 | seed-uri V6/V7/V8 (firme, oferte, acțiuni) + schelet T09 |
| **Sâmbătă 7 nov, dimineața** | T04 deploy v0 | T06 final | T08 | T09 |
| **Sâmbătă, după-amiaza** | T14 BE + FE | T07 | T12 final | T10 |
| **Sâmbătă, seara/noaptea** | integrare, `main` verde, fluxul de demo | T15 (i18n, PWA) | T13 | T11 (bucla de puncte) |
| **Duminică 8 nov, până la 10:00** | T16a deploy final + seed prod | stabilizare, telefon A în demo | T16b slide-uri + video de rezervă | stabilizare, telefon B în demo |

10:00 îngheț de cod · 12:00 prezentări · la 02:00 noaptea se opresc feature-urile noi (doar stabilizare).

## Linia de demo (obligatoriu)
T00–T13 + T16. T14, T15 și tot ce e „stretch” doar dacă linia de demo e verde.
