# AradEx-Ops — context pentru Claude Code

Agenții Paperclip ai echipei HACK4ARAD: `setup-lane.mjs`, `agents/*.md` (instrucțiunile), `tasks.json` (task-urile pe culoare). Regulile echipei, planul și skill-urile sunt în `../AradEx-Plan` (citește `../AradEx-Plan/CLAUDE.md` și `../AradEx-Plan/STRUCTURE.md`).

- Doar P1 (Zoltan) modifică acest repo, prin PR. Task-urile din `tasks.json` oglindesc `../AradEx-Plan/docs/PLAN.md` și `docs/TEAM.md` — când se schimbă acolo, se schimbă și aici.
- `setup-lane.mjs` se rulează pe laptopul fiecăruia; trebuie să rămână idempotent (găsește după nume, creează doar ce lipsește) și să nu citească sau să afișeze secrete.
- Commit-uri scurte în engleză, **fără `Co-Authored-By:` și fără „Generated with Claude Code”** (hook-ul din `.githooks` le scoate).
