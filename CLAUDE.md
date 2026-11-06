# AradExperience — context pentru Claude Code

Aplicație pentru Hack4Arad 2026 (7–8 nov): evenimente, obiective turistice cu ghid virtual, oferte de la firme locale,
acțiuni comunitare ale Primăriei cu puncte și clasament, chat AI și planificator de itinerar. 4 roluri: Vizitator, Localnic,
Firmă locală, Primărie (+ Admin). Echipă de 4 oameni, 2 zile. **Obiectiv: demo fără bug-uri majore, nu cod perfect.**

## Citește înainte de orice task
1. `docs/PLAN.md` — task-ul pe care lucrezi (scop, BE, FE, seed, verificare). Nu lucra în afara task-ului curent.
2. `docs/API.md` — contractul exact al endpoint-urilor și DTO-urilor. BE îl implementează, FE îl consumă. Dacă trebuie schimbat, schimbă-l în același PR și spune explicit ce ai schimbat.
3. `docs/DATA-MODEL.md` — tabele, enum-uri, convenții de migrări.
4. `docs/STATUS.md` — rezumatul echipei (îl ține Lead Tehnic) și `docs/status/Px.md` — starea culoarului tău, decizii, probleme. **Actualizează-l pe al tău (`docs/status/Px.md`) la finalul fiecărui task; nu edita STATUS.md.**
   `docs/TEAM.md` — cine ce face și **ce fișiere îi aparțin fiecăruia** (secțiunea „Cine ce atinge”).
5. `docs/DEMO.md` — fluxul de demo; nu are voie să se strice.
6. `docs/FEATURES.md` — definirea funcționalităților pe roluri (reguli, stări, mobil vs web). `docs/ARAD-DATA.md` — datele reale despre Arad folosite în seed (obiective, program, evenimente nov 2026) și ce e FICTIV.
Design: `design/AradExperience.html` (prototip original mobil, S0–S12), `design/AradExperience-extensii.html` (E1–E7 mobil, W1–W4 web), `design/AradExperience-web.html` (W5–W26, toate paginile web) și `design/AradExperience-web-prototip.html` (web navigabil, cu date mock). Capturi în `design/screens/`. Stil: „Clean Ink” (fundal `#F7F7F2`, ink `#111`, accent `#FF5A36`, carduri albe radius 16, butoane negre radius 14, font Inter, Material Symbols).

## Structură
```
api/   Spring Boot 3, Java 21, Maven, PostgreSQL 16, Flyway, Spring Security + JWT, springdoc   → api/CLAUDE.md
app/   Vue 3 + Vite + TypeScript, Pinia, Vue Router, Tailwind, vue-i18n, Leaflet, PWA          → app/CLAUDE.md
       app/src/shared (API client, tipuri, store-uri, componente), app/src/mobile (/m/*), app/src/web (/w/*)
docs/  PLAN, API, DATA-MODEL, STATUS, DEMO, DEPLOY
design/ prototipuri HTML + capturi + assets (poze cu licență, vezi design/README.md)
.claude/skills/  task-workflow, be-module, fe-feature, seed-data
```

## Comenzi
```
docker compose up -d                      # Postgres local (arad/arad, db aradexperience, :5432)
cd api && mvn spring-boot:run            # API pe :8080 (sau ./mvnw după `mvn wrapper:wrapper`), Swagger: /swagger-ui.html, health: /api/v1/health
cd api && mvn test                       # teste BE
cd app && npm run dev                     # APP pe :5173 ( / → /m pe telefon, /w pe desktop; ?ui=m|w forțează)
cd app && npm run build && npm run test   # build + vitest
cp .env.example .env                      # secretele stau în .env (nu e în git); API-ul citește din env
```

## Mod de lucru (obligatoriu)
- Un task din PLAN = un branch `feat/T07-tickets` = un PR spre `main`. `main` trebuie să ruleze mereu.
- Folosește skill-ul `task-workflow` la început și la sfârșit de task (planificare scurtă → implementare → verificare cu checklist → `docs/status/Px.md`).
- Modul nou în BE → skill `be-module`. Ecran/feature nou în FE → skill `fe-feature`. Date demo → skill `seed-data`.
- Rulează testele înainte de a declara ceva gata. Nu dezactiva teste ca să treacă.
- Commit-uri mici, mesaje scurte în engleză (`feat(events): list + filters`, `fix(auth): 401 on expired token`).
- Când ceva din PLAN/API nu se poate face exact așa, alege varianta cea mai simplă care ține demo-ul, notează decizia în `docs/status/Px.md` și mergi mai departe. Nu reproiecta.

## Reguli
- **Niciodată** secrete în cod, în FE sau în git: cheia OpenAI e doar în `api` (`OPENAI_API_KEY`). `.env` e ignorat de git.
- Schema DB se schimbă **doar** prin migrări Flyway noi; nu se editează migrări deja pe `main`.
- Punctele se scriu doar prin `PointsService`. Codurile QR conțin doar codul text (`AX-...`), nu URL-uri, nu date personale.
- Textele din UI sunt în română cu diacritice corecte (ă â î ș ț) și trec prin i18n (`ro.json`), chiar dacă EN vine mai târziu.
- Componentele comune stau în `app/src/shared`; `mobile/` și `web/` au doar layout-uri și view-uri. Nu duplica logică între ele.
- Erorile API sunt ProblemDetail; FE afișează `detail` în toast, nu „Something went wrong”.
- Fără librării noi fără motiv: lista aprobată e în `api/CLAUDE.md` și `app/CLAUDE.md`. Dacă chiar trebuie una, scrie de ce în `docs/status/Px.md`.
- Date demo = date reale din Arad (locuri, adrese, coordonate). Firmele pot fi fictive, dar plauzibile. Pozele doar cu licență (vezi `design/README.md`).
- Nu șterge și nu rescrie fișiere mari „ca să fie curat”. Nu rulezi `git push --force`, nu umbli în `.github/` fără să spui.

## Fără conflicte între culoare (4 oameni în paralel)
- Fiecare culoar editează doar fișierele lui (vezi `docs/TEAM.md` §„Cine ce atinge”). Dacă îți trebuie o schimbare într-un fișier al altui culoar, o ceri în PR-ul/task-ul lui; nu o faci tu.
- Rutele, navigația, `SecurityConfig`, `client.ts`, layout-urile și componentele comune de bază sunt ale lui P1 și sunt gata după T02/T03 — ceilalți doar înlocuiesc conținutul view-urilor lor.
- i18n pe fișiere de modul (`app/src/shared/i18n/ro/<modul>.json`), tipuri pe fișiere de modul (`app/src/shared/types/<modul>.ts`), API pe fișiere de modul (`app/src/shared/api/<modul>.ts`). Importă direct din fișierul modulului, nu adăuga linii în fișiere `index.ts` comune.
- `docs/API.md`: modifici doar secțiunea modulului tău.

## Definiția lui „gata”
Build + teste verzi · criteriile din „Verificare” ale task-ului bifate pe mobil și web · API.md actualizat dacă s-a schimbat ·
`docs/status/Px.md` actualizat · fluxul din DEMO.md încă merge.

## Conturi demo
`visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` — parola `demo1234`.
