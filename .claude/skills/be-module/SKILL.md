---
name: be-module
description: Cum se adaugă sau se extinde un modul în AradEx-Backend/ (Spring Boot): migrare Flyway, entitate, repository, service, DTO-uri, controller, teste — în ordinea și cu șabloanele proiectului. Folosește-l pentru orice endpoint sau tabel nou.
---

# Modul nou / extindere în `AradEx-Backend/`

Citește `AradEx-Backend/CLAUDE.md`, secțiunea modulului din `docs/API.md` și tabelul din `docs/DATA-MODEL.md`. Pachet: `ro.aradexperience.api.<modul>`.

## Ordinea
1. **Migrare** `src/main/resources/db/migration/V{n}__{modul}.sql` (numărul rezervat pentru task-ul tău în `docs/STATUS.md`). Doar DDL + indexuri. Seed separat în `V{n}_1__seed_{modul}.sql` (skill `seed-data`).
2. **Entitate** JPA (Lombok `@Getter @Setter @NoArgsConstructor`, `@Entity @Table(name="...")`, id `@GeneratedValue(IDENTITY)`, enum-uri `@Enumerated(STRING)`, timpi `OffsetDateTime`). Fără relații bidirecționale dacă nu sunt necesare; FK-urile simple pot fi `Long businessId` în loc de `@ManyToOne` când nu ai nevoie de obiect.
3. **Repository** `extends JpaRepository<X, Long>` (+ `JpaSpecificationExecutor` pentru filtre). Query-uri cu `@Query` doar când derivatele nu ajung.
4. **Service** `@Service @RequiredArgsConstructor @Transactional(readOnly = true)`; metodele care scriu au `@Transactional`. Aici stau regulile (capacitate, idempotență, proprietar). Aruncă `NotFoundException`, `ConflictException`, `ForbiddenException`.
5. **DTO-uri** `record` în `dto/`: `XDto` (răspuns, cu `static XDto from(X e)`), `XCreateRequest` (cu validări jakarta). Numele câmpurilor = exact cele din `docs/API.md`.
6. **Controller** `@RestController @RequestMapping("/api/v1/...") @RequiredArgsConstructor`: `@Valid` pe body, `@AuthenticationPrincipal CurrentUser user`, întoarce DTO-uri / `ResponseEntity.status(201)` la creare / `204` la delete. Zero logică.
7. **Security**: adaugă regula rutei în `SecurityConfig` dacă nu intră în pattern-urile existente (`/business/**` BUSINESS, `/city/**` CITY_HALL, `/admin/**` ADMIN, GET-urile publice listate în CLAUDE.md).
8. **Teste**: `XServiceTest` (Mockito) pentru fiecare regulă din „Verificare” a task-ului; opțional `XControllerIT` cu MockMvc + Testcontainers.
9. Rulează: `./mvnw test`, apoi `./mvnw spring-boot:run` și verifică în Swagger cererea reală (inclusiv cazurile de eroare).

## Șabloane

```java
// dto/EventCreateRequest.java
public record EventCreateRequest(
    @NotBlank @Size(max = 160) String title,
    @NotBlank String description,
    @NotNull EventCategory category,
    Long placeId, @NotBlank String locationName, String address,
    @NotNull Double lat, @NotNull Double lng,
    @NotNull OffsetDateTime startAt, OffsetDateTime endAt,
    @NotNull TicketType ticketType, BigDecimal priceAdult, BigDecimal priceChild, String externalUrl,
    @Positive Integer capacity, String imageUrl) {}
```

```java
// service
@Transactional
public TicketDto buy(long eventId, CurrentUser user, TicketRequest req) {
    Event ev = events.findById(eventId).orElseThrow(() -> new NotFoundException("Event %d not found".formatted(eventId)));
    if (ev.getTicketType() == TicketType.EXTERNAL) throw new BadRequestException("Tickets are sold on the organizer's site");
    int qty = req.qtyAdult() + req.qtyChild();
    if (ev.getCapacity() != null && ev.getParticipantsCount() + qty > ev.getCapacity()) throw new ConflictException("capacity");
    Ticket t = new Ticket(); /* set fields */ t.setCode(Codes.generate("AX-T" + eventId));
    ev.setParticipantsCount(ev.getParticipantsCount() + qty);
    return TicketDto.from(tickets.save(t), ev);
}
```

```java
// test
@ExtendWith(MockitoExtension.class)
class TicketServiceTest {
  @Mock EventRepository events; @Mock TicketRepository tickets; @InjectMocks TicketService service;
  @Test void buy_overCapacity_throws409() {
    Event ev = event(capacity = 10, participants = 9);
    when(events.findById(1L)).thenReturn(Optional.of(ev));
    assertThatThrownBy(() -> service.buy(1L, user(), new TicketRequest(2, 0, "a@b.ro"))).isInstanceOf(ConflictException.class);
  }
}
```

## Capcane
- `near` + `radiusKm`: calculează distanța în SQL (haversine) sau filtrează în memorie dacă lista e mică; întoarce `distanceKm` în DTO.
- Idempotență: confirmarea unei înscrieri / folosirea unui cod a doua oară nu mai modifică nimic (200 cu flag sau 409, conform API.md).
- Nu expune entități; nu lăsa `fetch = EAGER` pe liste mari; paginează listele publice de evenimente.
- Orice scriere de puncte trece prin `PointsService` — nu modifica `users.points_balance` din alt loc.
