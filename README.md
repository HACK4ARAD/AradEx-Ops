# AradEx-Ops — Hack4Arad 2026

Repo-ul de coordonare al **AradExperience**: evenimente, obiective cu ghid virtual, oferte locale, acțiuni comunitare cu puncte, chat AI și planificator de itinerar pentru Arad.
Codul stă în repo-uri surori din organizația [HACK4ARAD](https://github.com/HACK4ARAD):

| Repo | Ce conține |
|---|---|
| **AradEx-Ops** (acesta) | plan, contract API, docs, design, skill-uri Claude, agenți Paperclip |
| [AradEx-Backend](https://github.com/HACK4ARAD/AradEx-Backend) | API Spring Boot 3 + PostgreSQL |
| [AradEx-Frontend](https://github.com/HACK4ARAD/AradEx-Frontend) | Vue 3 PWA (web `/w` + mobil `/m`) |
| [AradEx-Infrastructure](https://github.com/HACK4ARAD/AradEx-Infrastructure) | Postgres local, deploy |

## Pornire rapidă (din folderul comun, ex. `~/HACK4ARAD`)
```
(cd AradEx-Infrastructure && docker compose up -d)                                        # Postgres
(cd AradEx-Backend && cp .env.example .env && set -a && . ./.env && set +a && mvn spring-boot:run)   # :8080
(cd AradEx-Frontend && cp .env.example .env && npm install && npm run dev)                # :5173 (/m mobil, /w web)
```
Conturi demo: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` / `demo1234`.

## Unde e ce
- `docs/TEAM.md` — cine ce face (Zoltan, Lukas, Octav, Damian) și ce fișiere îi aparțin fiecăruia · `docs/SETUP-ECHIPA.md` — instalarea pe laptop
- `docs/PLAN.md` — task-urile T00–T19 · `docs/API.md` — contractul de API · `docs/DATA-MODEL.md` — tabele și enum-uri
- `docs/STATUS.md` — rezumat (Lead) + `docs/status/Px.md` — starea fiecărui culoar · `docs/DEMO.md` — demo + pitch · `docs/DEPLOY.md`
- `CLAUDE.md` (+ `CLAUDE.md` din fiecare repo) — reguli pentru Claude Code · `.claude/skills/` — `task-workflow`, `be-module`, `fe-feature`, `seed-data`
- `design/` — prototipuri, capturi, poze · `tools/paperclip/` — agenții Paperclip

## Cum lucrăm
Un task din PLAN = un branch `feat/Txx-...` în fiecare repo atins = câte un PR. Începe cu `/task-workflow`, termină cu checklist-ul și `docs/status/Px.md`.
Fără `Co-Authored-By` în commit-uri. `main` rulează mereu; fluxul din `docs/DEMO.md` nu se strică.
