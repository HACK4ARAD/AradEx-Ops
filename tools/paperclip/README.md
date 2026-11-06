# Paperclip pe laptopul tău (Persoanele 2, 3, 4)

Fiecare din noi își rulează culoarul în **propriul Paperclip**, cu **propriul abonament Claude**. Paperclip-urile nu comunică între ele: **GitHub și `docs/STATUS.md` sunt sursa comună de adevăr.** Persoana 1 are în Paperclip-ul ei și Lead Tehnic + QA & Demo, care fac review și merge la PR-urile tuturor.

Împărțirea: `docs/TEAM.md`. Persoana 2 = `P2`, Persoana 3 = `P3`, Persoana 4 = `P4`.

## Pași (≈ 15 minute)
1. **Unelte:** Claude Code instalat și logat (`claude`), Node 20+, `gh` logat (`gh auth login`), Java 21 + Maven, Postgres 16 (`docker compose up -d` din repo merge).
2. **Repo:** acceptă invitația GitHub de la Persoana 1, apoi `git clone <repo> && cd AradExperience`. `.env` din `.env.example`; cheile le primești de la Persoana 1 pe un canal privat, nu le pui în git.
3. **Paperclip:** instalează și pornește-l (https://paperclip.ing): `npx paperclipai onboard`. Dacă te întreabă de o companie, numește-o exact **HACK4ARAD**. UI-ul e pe http://127.0.0.1:3100.
4. **Abonamentul tău Claude:** în UI → compania HACK4ARAD → Settings → AI connections → conectează Claude (subscription) și fă-l default.
5. **Culoarul tău:** din rădăcina repo-ului:
   ```
   node tools/paperclip/setup-lane.mjs --lane P2
   ```
   (`P3` / `P4` după caz). Scriptul creează compania (dacă nu există), agentul tău, proiectul „AradExperience” cu folderul clonei și task-urile tale în *backlog*. Se poate rula din nou fără duplicate (actualizează și instrucțiunile agentului).
6. **Pornești un task** mutându-l în `todo` în Paperclip, **doar** după ce dependențele lui din alte culoare sunt pe `main` (scrie în descriere care sunt). Agentul lucrează în `../_wt/Txx`, deschide PR pe GitHub și pune task-ul în `in_review`. QA & Demo (la Persoana 1) face review și merge.

## Reguli scurte
- Nu lucra pe `main`; un task = un branch = un PR.
- Tu verifici pe telefonul tău ce a făcut agentul (review în perechi: P1 ↔ P2, P3 ↔ P4).
- Agentul se oprește și te întreabă înainte de conturi externe, deploy, instalări, bani, mesaje.
- Instrucțiunile agenților sunt în `tools/paperclip/agents/`; dacă le schimbi, fă PR, apoi fiecare rulează din nou `setup-lane.mjs`.
