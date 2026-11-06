# HACK4ARAD — cum îți pregătești laptopul (Lukas, Octav, Damian)

Ai primit de la Zoltan un zip cu numele tău. În el găsești:
- `SETUP-ECHIPA.md`: acest ghid, la fel pentru toți;
- `<Nume>-Px.md`: fișa ta, cu culoarul, task-urile, orele și fișierele tale;
- `AradExperience/`: proiectul complet (cod, documente, design), cu istoricul git.

**Pe scurt:** fiecare lucrează pe laptopul lui, cu abonamentul lui Claude și cu un agent AI în propriul Paperclip. Partea comună a echipei e GitHub-ul: PR-uri, plus `docs/status/Px.md`. Zoltan (P1) are în Paperclip-ul lui agenții **Lead Tehnic** și **QA & Demo**: ei urmăresc PR-urile tuturor, fac review și le fac merge.

| Culoar | Om | Task-uri |
|---|---|---|
| P1 | Zoltan | T00–T04, T14, T16a |
| P2 | Lukas | T05, T06, T07, T15 |
| P3 | Octav | T08, T12, T13, T16b |
| P4 | Damian | T09, T10, T11 |

Pregătirea ține cam 30–45 de minute. Fă-o înainte de hackathon.

---

## 1. Unelte (o singură dată)
| Unealtă | Verificare | Notă |
|---|---|---|
| Git | `git --version` | |
| GitHub CLI | `gh --version`, apoi `gh auth login` | contul tău de GitHub (trimite-i lui Zoltan username-ul, ca să te adauge în organizația HACK4ARAD) |
| Node.js 20+ | `node -v` | pentru `app/` și pentru Paperclip |
| Java 21 + Maven | `java -version` (21), `mvn -v` | macOS: `brew install openjdk@21 maven` |
| Docker Desktop (sau Postgres 16 local) | `docker compose version` | baza de date locală |
| Claude Code | `claude --version`, apoi pornește `claude` o dată și loghează-te | **cu abonamentul tău** (Pro/Max) |

Pe Windows merge, dar e mai simplu din WSL sau Git Bash. Comenzile de mai jos sunt pentru macOS/Linux.

## 2. Proiectul
1. Dezarhivează zip-ul. Obții un folder `HACK4ARAD` cu acest ghid, fișa ta și `AradExperience/`. Mută-l în folderul tău personal (`~/HACK4ARAD`), unde rămâne. Paperclip ține minte calea, așa că nu-l mai muta după pasul 4.
2. ```
   cd ~/HACK4ARAD/AradExperience
   cp .env.example .env
   ```
   Cheile (`OPENAI_API_KEY`, `JWT_SECRET`) le primești de la Zoltan **pe un canal privat**. Nu le pui niciodată în git, în chat-uri publice sau în task-uri.
3. Verificare rapidă:
   ```
   docker compose up -d
   cd app && npm ci && npm run build && cd ..
   ```
   `api/` (Spring Boot) compilează abia după ce Zoltan termină T01. Până atunci nu-ți face griji pentru `mvn test`.

## 3. Paperclip (orchestratorul agenților)
Rulează într-un terminal separat și **lasă-l pornit**:
```
npx --yes paperclipai@latest install --yes
paperclipai onboard --yes
```
- Pentru Zoltan, versiunea `2026.1023.0` a mers fără probleme.
- `onboard` pornește serverul și rămâne deschis. UI-ul e la **http://127.0.0.1:3100**.
- Data viitoare îl pornești doar cu `paperclipai run`.

## 4. Culoarul tău în Paperclip
Într-un al doilea terminal, din folderul proiectului:
```
cd ~/HACK4ARAD/AradExperience
node tools/paperclip/setup-lane.mjs --lane P2      # Lukas = P2, Octav = P3, Damian = P4
```
1. **Prima rulare** creează compania **HACK4ARAD** și se oprește cu un link (`http://127.0.0.1:3100/HAC…/company/settings/connections`). Deschide-l și conectează **Claude cu abonamentul tău** („subscription”, login în browser). Apoi bifează-l ca default.
2. **Rulează din nou aceeași comandă.** Acum scriptul creează:
   - agentul tău (Claude Sonnet 5.5, cu skill-urile proiectului: `task-workflow`, `be-module`, `fe-feature`, `seed-data`);
   - proiectul „AradExperience”, legat de folderul tău;
   - task-urile tale, în *backlog*, cu dependențele legate;
   - un task `SETUP` pentru tine.
3. În UI → Agents, agentul tău trebuie să ajungă **idle** (verde) în cel mult un minut. Dacă rămâne „paused”, rulează scriptul încă o dată; repornește verificarea.

Scriptul poate fi rulat de oricâte ori: nu dublează nimic și aduce la zi instrucțiunile agentului (după un `git pull`).

**Nimic nu pornește singur.** Task-urile stau în *backlog* până le muți tu.

## 5. Când Zoltan pune repo-ul pe GitHub (T00)
Repo-ul echipei va fi **https://github.com/HACK4ARAD/AradExperience** (organizația [HACK4ARAD](https://github.com/HACK4ARAD)). Zoltan urcă acolo **exact acest repo**, cu același istoric, și te adaugă în organizație. Accepți invitația (e-mail sau https://github.com/orgs/HACK4ARAD/invitation), apoi:
```
cd ~/HACK4ARAD/AradExperience
git remote add origin https://github.com/HACK4ARAD/AradExperience.git
git fetch origin
git branch -u origin/main main
git pull
```

## 6. Cum lucrăm în timpul hackathonului
1. **Pornești un task** mutându-l din *backlog* în **todo**. Faci asta doar când task-urile de care depinde sunt deja pe `main`; descrierea task-ului îți spune care sunt. Agentul se apucă imediat.
2. Agentul lucrează în `../_wt/Txx`, un worktree separat, pe branch-ul `feat/Txx-…`. Folderul tău principal rămâne liber pentru tine.
3. La final, agentul rulează testele și checklist-ul din `task-workflow`, deschide un **PR pe GitHub**, pune link-ul în task și îl mută în `in_review`.
4. **Tu** verifici pe telefonul tău și pe web ce a făcut. Review-ul se face în perechi: Zoltan ↔ Lukas, Octav ↔ Damian.
5. **QA & Demo**, pe laptopul lui Zoltan, face review pe GitHub:
   - dacă cere modificări, muți task-ul înapoi în `todo` cu un comentariu și agentul le repară pe același branch;
   - dacă aprobă, face merge, iar tu marchezi task-ul `done`.
6. Pornește-ți următorul task.

Regulă de aur: **lucrezi doar în fișierele tale.** Tabelul „Cine ce atinge” din `docs/TEAM.md` spune exact care sunt.
- Router-ul, navigația, `SecurityConfig` și componentele de bază sunt ale lui Zoltan.
- Dacă îți trebuie ceva din fișierele altcuiva, îi ceri lui. Agentul face la fel: se oprește și te întreabă.
- Starea ta o scrii în `docs/status/Px.md`, nu în `STATUS.md`.

**Agentul se oprește și te întreabă** (task pe `blocked`) înainte să:
- creeze conturi;
- facă deploy;
- instaleze ceva;
- cheltuie bani;
- trimită mesaje;
- adauge librării noi.

Răspunzi cu un comentariu în task și îl muți înapoi în `todo`.

## 7. Dacă ceva nu merge
| Problemă | Ce faci |
|---|---|
| `Paperclip is not reachable` | pornește `paperclipai run` în alt terminal |
| Agentul rămâne „paused” | conexiunea Claude nu e default; o faci default și rulezi scriptul din nou |
| `Expected the repo skills…` | rulează scriptul din folderul `AradExperience` (sau dă `--repo <cale>`) |
| Agentul spune că o dependență nu e pe `main` | e corect: aștepți PR-ul colegului (vezi `docs/status/`) |
| Ai mutat folderul | în Paperclip: Projects → AradExperience → Workspace → noua cale |
| Laptop lent | rulează un singur task odată; oprește `npm run dev` și API-ul când nu le folosești |

Întrebări: pe grupul echipei, către Zoltan.
