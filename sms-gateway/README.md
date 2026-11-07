# Gateway-ul de SMS (T24)

Codurile de login pentru conturile personale (telefon + cod, T21) pleacă de pe iPhone-ul lui Zoltan, nu prin Twilio:
API-ul pune SMS-ul într-o coadă (`sms_outbox`), `gateway.mjs` de pe Mac îl ia la 3 s, îl trimite prin aplicația **Mesaje**
(iPhone-ul cu „Redirecționare mesaje text” spre Mac) și confirmă. Mac-ul doar întreabă API-ul, nu primește nimic din internet.

## Pornire (o dată)
1. iPhone › Setări › Mesaje › **Redirecționare mesaje text** › activează acest Mac. Pe Mac, Mesaje e deschis, același Apple ID.
2. Test fără API: `node gateway.mjs --test +40…` (numărul tău). La prima rulare macOS întreabă dacă Terminalul poate controla
   Mesaje → **Permite**. Trebuie să primești SMS-ul „Test AradExperience…”.
3. `./setup.sh` — generează tokenul (Keychain + AWS `aradex/sms-gateway`), repornește API-ul, pornește gateway-ul cu launchd
   (repornește singur, și după restart). Prima dată macOS întreabă dacă **node** poate controla Mesaje → **Permite**.
4. Jurnal: `tail -f ~/Library/Logs/aradex-sms-gateway.log` (numerele apar doar cu ultimele 3 cifre, textul niciodată).

`./setup.sh --restart` după o actualizare · `./setup.sh --stop` oprește gateway-ul și golește tokenul (codurile reale trec pe Twilio / 503).
Test local, fără SMS: `AX_API=http://localhost:8092/api/v1 AX_DRY_RUN=1 node gateway.mjs`.

## Limite și riscuri
- Limitele din API rămân: doar +40, 60 s între cereri, 5 coduri pe zi pe număr, 300 de SMS-uri pe zi în total, 5 încercări pe cod.
- Un SMS neconfirmat în 60 s se dă din nou (max 3 ori); ce nu pleacă în 4 minute expiră (codul ține 5).
- Mac-ul pornit și iPhone-ul aproape; SMS-ul ajunge în 5–15 s. Multe SMS-uri de pe un număr personal pot fi văzute ca spam de operator.
