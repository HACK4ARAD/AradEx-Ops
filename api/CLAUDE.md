# api/ — Spring Boot (vezi și CLAUDE.md din rădăcină)

## Stack aprobat
Java 21 · Spring Boot 3.3+ · Maven (`mvn`, sau `./mvnw` după `mvn wrapper:wrapper`) · spring-web, data-jpa, validation, security, actuator · Flyway · PostgreSQL ·
springdoc-openapi · jjwt 0.12 · Lombok · teste: JUnit 5, Mockito, AssertJ, spring-boot-starter-test, Testcontainers (postgres).
Client HTTP pentru OpenAI: `RestClient` din Spring (fără SDK extern).

## Structură pe module (pachet per funcționalitate)
```
ro.aradexperience.api
  common/   config (SecurityConfig, CorsConfig, OpenApiConfig, AppProps), security (JwtService, JwtAuthFilter, CurrentUser),
            error (GlobalExceptionHandler, BadRequestException, NotFoundException, ConflictException, ForbiddenException), util (Codes, Geo)
  auth/     AuthController, AuthService, dto/
  users/    User, UserRepository, UserService, dto/UserDto
  places/   Place, GuidePoint, *Repository, PlaceService, PlaceController, AdminPlaceController, dto/
  events/   Event, SavedEvent, EventRepository (+ EventSpecifications), EventService, EventController, dto/
  tickets/  Ticket, TicketRepository, TicketService, TicketController
  business/ Business, Announcement, repos, BusinessService, BusinessController (/business/**), PublicBusinessController
  offers/   Offer, OfferRedemption, repos, OfferService, OfferController, BusinessOfferController
  community/ CommunityAction, CommunityRegistration, repos, CommunityService, CommunityController, CityController
  points/   PointsTransaction, PointsRepository, PointsService, LeaderboardService
  ai/       OpenAiClient, ChatService, ItineraryService, prompts/ (text), schemas/ (json), fallback/ (json), AiController
  itineraries/ Itinerary, ItineraryRepository, ItineraryController
  admin/    AdminController, AdminService
```
Într-un modul: `Controller` (doar validare + mapare DTO), `Service` (logica, `@Transactional`), `Repository` (Spring Data),
entități JPA, `dto/` cu `record`-uri. Mapare entitate↔DTO prin metode statice `XDto.from(entity)` — fără MapStruct.

## Convenții
- Endpoint-urile și DTO-urile = exact `docs/API.md`. Prefix global `/api/v1` (în `application.yml`: `spring.mvc.servlet.path` sau `@RequestMapping`).
- Erori: aruncă `BadRequestException("...")` (400), `NotFoundException("Event %d not found")` (404), `ConflictException("capacity")` (409), `ForbiddenException()` (403); handler-ul le face ProblemDetail. Validare cu `@Valid` + jakarta annotations pe DTO-urile de cerere.
- Utilizatorul curent: `@AuthenticationPrincipal CurrentUser user` (`id`, `role`, `email`). Verificarea de proprietar se face în service (`assertOwner`).
- Coduri: `Codes.generate("AX-T" + eventId)` → `AX-T12-7K3Q9Z` (A-Z0-9, fără 0/O/1/I).
- Geo: `Geo.distanceKm(lat1,lng1,lat2,lng2)` (haversine); filtrul `near` se face în SQL cu formula haversine sau în memorie dacă lista e < 500.
- Timpi: `OffsetDateTime` în entități/DTO, DB `timestamptz`. Zona pentru logică de „azi/weekend”: `Europe/Bucharest`.
- Paginare: `Pageable` → `PageResponse<T>` propriu (`content, page, size, totalElements`).
- Config: `AppProps` (`@ConfigurationProperties("app")`) cu `jwt.secret`, `jwt.expirationHours`, `cors.origins`, `openai.apiKey/model`, `events.hotParticipants=50`, `events.hotSaves=20`.
- Migrări: `src/main/resources/db/migration/V{n}__{modul}.sql` + `V{n}_1__seed_{modul}.sql`. Următorul număr liber e în `docs/STATUS.md`.
- Loguri: `@Slf4j`, nivel INFO pentru acțiuni de business (bilet emis, puncte acordate), fără date personale.

## Teste
- Obligatoriu: test unitar pe fiecare `Service` cu logică (Mockito pentru repo-uri): cazurile din „Verificare” ale task-ului.
- Opțional: un `@SpringBootTest` + Testcontainers per modul pentru endpoint-ul principal (`MockMvc`). Dacă Docker lipsește local, `@EnabledIfEnvironmentVariable(named="DOCKER_TESTS", matches="true")`.
- Numele testelor spun comportamentul: `register_duplicateEmail_returns409`.

## Nu
- Nu schimba `SecurityConfig` ca să „meargă” un endpoint — adaugă regula corectă pentru ruta ta.
- Nu pune logică în controllere, nu întoarce entități JPA din controllere.
- Nu `spring.jpa.hibernate.ddl-auto=update` — schema vine doar din Flyway (în teste poate fi `validate`).
