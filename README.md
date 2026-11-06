# AradEx-Ops — agenții Paperclip pentru HACK4ARAD

Aici stă doar partea de Paperclip. Planul, documentele, designul și skill-urile sunt în [AradEx-Plan](https://github.com/HACK4ARAD/AradEx-Plan), iar codul în `AradEx-Backend` și `AradEx-Frontend`. Toate 5 repo-urile stau în același folder (ex. `~/HACK4ARAD/`). Ghidul complet de configurare pentru Lukas (P2), Octav (P3) și Damian (P4): `../AradEx-Plan/docs/SETUP-ECHIPA.md`.

Ce e aici:
- `setup-lane.mjs`: creează în Paperclip-ul tău local:
  - compania HACK4ARAD;
  - agentul culoarului tău, cu cele 5 skill-uri din `../AradEx-Plan/.claude/skills/`;
  - proiectul, cu workspace-ul `../AradEx-Plan`;
  - task-urile tale.

  Se pornește din acest folder:
  ```
  node setup-lane.mjs --lane P2|P3|P4
  ```
  Îl poți rula de mai multe ori: nu dublează nimic și aduce la zi instrucțiunile agentului și workspace-ul.
- `agents/`: instrucțiunile agenților. `common.md` se adaugă la fiecare agent; `P1.md`–`P4.md` sunt cele ale culoarelor; `LEAD.md` și `QA.md` sunt doar la Zoltan.
- `tasks.json`: task-urile din `../AradEx-Plan/docs/PLAN.md`, împărțite pe culoare, cu ore, prioritate și dependențe.

Doar Zoltan (P1) modifică acest repo, prin PR. Commit-urile sunt fără `Co-Authored-By:`. După ce o schimbare intră în `main`, fiecare face `./setup.sh` din `AradEx-Plan` (sau `git pull`) și rulează din nou scriptul.
