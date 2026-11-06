# api/ — schelet de pornire (T01)

Schelet scris în avans, **necompilat** (Maven Central nu era accesibil din mediul în care a fost generat). Prima dată:

```
docker compose up -d                 # din rădăcina repo-ului
cd api
mvn -q test                          # compilează + rulează testele (ApiSmokeTest cere Docker; altfel se sare)
mvn spring-boot:run                  # http://localhost:8080/api/v1/health · /swagger-ui.html
mvn wrapper:wrapper                  # opțional: generează ./mvnw ca în CLAUDE.md
```
Dacă apar erori de compilare, sunt mici (import/versiune) — rezolvă-le cu Claude Code și notează în `docs/STATUS.md`.

Ce conține:
- `pom.xml` — Spring Boot 3.3.5, Java 21, JPA, Security, Validation, Flyway (+ modul Postgres), springdoc, jjwt 0.12, Testcontainers.
- `application.yml` — toate setările din variabile de mediu (`.env.example`), `ddl-auto: validate`.
- `common/config` — `AppProps` (record-uri), `SecurityConfig` (reguli pe rute și roluri, CORS, 401/403 ca ProblemDetail), `OpenApiConfig` (buton Authorize).
- `common/security` — `JwtService` (emitere/validare HS256), `JwtAuthFilter`, `CurrentUser`, `Role`.
- `common/error` — `ApiException` + `BadRequest/NotFound/Conflict/Forbidden`, `GlobalExceptionHandler` (RFC 7807, validare cu `errors[]`).
- `common/util` — `Codes` (coduri `AX-…`), `Geo` (haversine). `common/web/PageResponse`.
- `health/HealthController` — `GET /api/v1/health`.
- `db/migration/`: V1 baseline, **V2 users+businesses (+ seed conturi demo), V3 places+guide_points (+ seed 12 locuri reale), V4 events+saved_events (+ seed 30 evenimente)** — toate verificate pe Postgres 16; `Dockerfile` multi-stage.
- Teste: `JwtServiceTest`, `CodesAndGeoTest` (unitare), `ApiSmokeTest` (Testcontainers).

Următorul pas: T03 (`auth`, `users`, migrarea `V2__users_businesses.sql`) cu skill-ul `be-module`.
