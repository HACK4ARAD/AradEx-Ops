# Paperclip pentru HACK4ARAD

Ghidul complet de configurare pentru Lukas (P2), Octav (P3) și Damian (P4) este în `docs/SETUP-ECHIPA.md`.

Ce e aici:
- `setup-lane.mjs`: creează, în Paperclip-ul tău local, compania HACK4ARAD, agentul culoarului tău (cu skill-urile din `.claude/skills/`), proiectul legat de folderul tău și task-urile tale. Se pornește cu `node tools/paperclip/setup-lane.mjs --lane P2|P3|P4`. Îl poți rula de mai multe ori: nu dublează nimic și actualizează instrucțiunile agentului.
- `agents/`: instrucțiunile agenților. `common.md` se adaugă la fiecare agent; `P1.md`–`P4.md` sunt cele ale culoarelor; `LEAD.md` și `QA.md` sunt doar la Zoltan.
- `tasks.json`: task-urile din `docs/PLAN.md`, împărțite pe culoare, cu ore, prioritate și dependențe.

Dacă schimbi ceva aici, deschide un PR. După ce intră în `main`, fiecare rulează din nou scriptul.
