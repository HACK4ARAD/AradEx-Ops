# Deploy

## Local
```
cp .env.example .env            # completează OPENAI_API_KEY, JWT_SECRET
docker compose up -d            # Postgres
cd api && ./mvnw spring-boot:run
cd app && npm install && npm run dev
```

## Producție (T04 → T16)
| Componentă | Unde | Config |
|---|---|---|
| DB | Neon (free) sau Render Postgres | copiază connection string în `POSTGRES_URL` (format JDBC: `jdbc:postgresql://host/db?sslmode=require`), user/parolă |
| API | Render Web Service, Docker (`api/Dockerfile`) | env: `POSTGRES_*`, `JWT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `CORS_ORIGINS=https://<app>.netlify.app`, `SPRING_PROFILES_ACTIVE=prod`; health check `/api/v1/health` |
| APP | Netlify | base `app`, build `npm run build`, publish `app/dist`, env `VITE_API_URL=https://<api>.onrender.com/api/v1`; `app/public/_redirects`: `/* /index.html 200` |

Completați aici URL-urile reale când există:
- API: `https://________.onrender.com`
- APP: `https://________.netlify.app`
- DB: ________ (cine are credențialele)

Note: Render free adoarme după 15 min de inactivitate → prima cerere durează ~30 s. Duminică dimineață deschideți API-ul cu 10 minute înainte de demo (sau țineți un ping la 10 minute).
Migrările + seed-ul rulează automat la pornirea API-ului (Flyway). Datele demo trebuie să fie identice cu cele locale.
