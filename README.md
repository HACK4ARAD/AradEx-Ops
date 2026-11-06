# AradExperience — Hack4Arad 2026

Evenimente, obiective cu ghid virtual, oferte locale, acțiuni comunitare cu puncte, chat AI și planificator de itinerar pentru Arad.
Web + mobil (PWA) din același cod Vue; backend Spring Boot + PostgreSQL.

## Pornire rapidă
```
cp .env.example .env                 # completează OPENAI_API_KEY și JWT_SECRET
docker compose up -d                 # Postgres
cd api && ./mvnw spring-boot:run     # http://localhost:8080/swagger-ui.html
cd app && npm install && npm run dev # http://localhost:5173  (/m = mobil, /w = web)
```
Conturi demo: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` / `demo1234`.

## Unde e ce
- `docs/PLAN.md` — task-urile T00–T16, ordonate pe dependențe, cu descriere și checklist de verificare
- `docs/API.md` — contractul de API (endpoint-uri + DTO-uri) · `docs/DATA-MODEL.md` — tabele și enum-uri
- `docs/STATUS.md` — starea curentă, decizii, probleme (se actualizează la fiecare task) · `docs/DEMO.md` — fluxul de demo și pitch-ul · `docs/DEPLOY.md`
- `CLAUDE.md`, `api/CLAUDE.md`, `app/CLAUDE.md` — reguli pentru Claude Code · `.claude/skills/` — `task-workflow`, `be-module`, `fe-feature`, `seed-data`
- `design/` — prototipul original (`AradExperience.html`), ecranele noi (`AradExperience-extensii.html`), capturi în `design/screens/`, poze în `design/assets/`

## Cum lucrăm
Un task din PLAN = un branch = un PR. Începe cu `/task-workflow` în Claude Code („ia task-ul T05”), termină cu checklist-ul de verificare și STATUS.md.
`main` rulează mereu. Fluxul din `docs/DEMO.md` nu se strică.
