---
name: task-workflow
description: Cum se începe, se implementează, se verifică și se închide un task Txx din docs/PLAN.md. Folosește-l la orice „ia task-ul T07”, „începe T05”, „termină/verifică task-ul”, „fă review la ce am făcut”.
---

# Task workflow (AradExperience)

## 1. Start
1. Citește task-ul din `docs/PLAN.md`, secțiunile aferente din `docs/API.md` și `docs/DATA-MODEL.md`, și `docs/STATUS.md` (dependențele trebuie să fie DONE sau măcar mergeabile).
2. `git checkout main && git pull && git checkout -b feat/Txx-nume-scurt`.
3. Scrie în 5–10 rânduri planul concret: fișiere pe care le creezi/modifici, migrarea (numărul din STATUS.md — rezervă-l acolo acum), endpoint-urile, ecranele. Arată-l omului **înainte** de a scrie cod dacă task-ul atinge și BE și FE; altfel mergi direct.
4. Marchează task-ul `IN PROGRESS` în STATUS.md cu numele tău și branch-ul.

## 2. Implementare
- BE: urmează skill-ul `be-module` (migrare → entitate → repo → service → DTO → controller → teste). FE: `fe-feature` (tipuri → api → store/composable → view mobil → view web → rută → nav).
- Ordinea recomandată într-un task mixt: migrare + entități → service + teste → controller → tipuri FE → api FE → ecran mobil → ecran web → seed. Rulează aplicația după fiecare pas mare, nu la final.
- Seed-ul (`seed-data`) se scrie înainte de ecrane, ca să ai date reale când le construiești.
- Dacă dai de ceva neclar sau API.md trebuie schimbat: alege varianta simplă, notează în STATUS.md „Decizii”, continuă. Nu bloca pe întrebări mici.
- Nu ieși din scopul task-ului. Ce observi în plus → listă „De făcut mai târziu” în STATUS.md.

## 3. Verificare (înainte de PR) — checklist
Rulează efectiv, nu presupune:
- [ ] `cd api && ./mvnw test` verde; `cd app && npm run build && npm run test` verde; fără erori în consola browserului.
- [ ] Fiecare punct din secțiunea „Verificare” a task-ului, executat manual: pe **mobil** (Chrome device toolbar 390×844 + telefon real dacă există) și pe **web** (≥1280px) unde task-ul are ambele.
- [ ] Endpoint-urile noi apar în Swagger și răspund conform `docs/API.md` (status-uri 400/401/403/404/409 incluse — încearcă-le).
- [ ] Rolurile: un cont cu rol greșit primește 403, nu 500. Guest-ul vede doar ce e public.
- [ ] Stări de listă: loading, gol, eroare — nu ecran alb.
- [ ] Texte în română cu diacritice, în `ro.json`. Fără „lorem ipsum”, fără `console.log` rămase, fără `TODO` fără explicație.
- [ ] Fluxul din `docs/DEMO.md` până la pasul care implică task-ul tău încă funcționează (rulează-l).
- [ ] Nicio cheie/secret în diff (`git diff main --stat` + caută `sk-`, `secret`, `password` în fișierele noi).
Scrie rezultatul verificării în PR (ce ai testat, ce nu, ce ai observat).

## 4. Review (de preferat de altcineva + Claude)
Cere review cu: „Fă review la PR-ul pentru Txx: caută bug-uri care strică demo-ul, încălcări ale CLAUDE.md, diferențe față de API.md.” Reviewer-ul rulează aplicația, nu doar citește diff-ul. Se repară doar ce e major/critic; restul → STATUS.md „Probleme cunoscute”.

## 5. Închidere
1. Merge în `main` (squash), șterge branch-ul.
2. STATUS.md: task → `DONE`, decizii, probleme cunoscute, numărul de migrare următor, „De făcut mai târziu”.
3. `docs/API.md` actualizat dacă s-a schimbat ceva. Dacă ai adăugat un ecran care nu era în design, pune o captură în `design/screens/`.
4. Spune în chat, în 3 rânduri: ce merge, ce nu, ce urmează.
