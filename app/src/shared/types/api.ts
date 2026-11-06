// Oglinda DTO-urilor din docs/API.md. Când BE schimbă un DTO, se schimbă și aici, în același PR.

export type Role = 'VISITOR' | 'LOCAL' | 'BUSINESS' | 'CITY_HALL' | 'ADMIN'
export type Transport = 'WALK' | 'CAR' | 'PUBLIC'
export type TicketType = 'FREE' | 'IN_APP' | 'EXTERNAL'

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
}

export interface ProblemDetail {
  type?: string
  title?: string
  status: number
  detail?: string
  instance?: string
  errors?: { field: string; message: string }[]
}

export interface GeoPoint { lat: number; lng: number }

export interface BusinessSummary { id: number; name: string; category: string; verified: boolean; imageUrl?: string }

export interface UserDto {
  id: number
  email: string
  displayName: string
  role: Role
  locale: 'ro' | 'en'
  pointsBalance: number
  business?: BusinessSummary
}

export interface AuthResponse { token: string; user: UserDto }

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  role: 'VISITOR' | 'LOCAL' | 'BUSINESS'
  business?: { name: string; category: string; address: string; lat?: number; lng?: number }
}

export interface PlaceSummary {
  id: number; name: string; type: string; imageUrl?: string; lat: number; lng: number
  visitMinutes: number; tags: string[]; distanceKm?: number
}
export interface GuidePointDto {
  id: number; position: number; title: string; text: string; imageUrl?: string; audioUrl?: string
  lat?: number; lng?: number; durationSec?: number
}
export interface PlaceDto extends PlaceSummary {
  slug: string; description: string; address: string; openingHours?: string; rating?: number
  parkingHint?: string; imageCredit?: string; exteriorOnly: boolean; guidePoints: GuidePointDto[]
}

export interface EventSummary {
  id: number; title: string; category: string; startAt: string; endAt?: string; locationName: string
  lat: number; lng: number; imageUrl?: string; ticketType: TicketType; priceFrom?: number; isHot: boolean; isDemo: boolean
  participantsCount: number; organizerName: string; organizerType: string; distanceKm?: number; saved?: boolean
  ratingAvg?: number; ratingCount: number
}
export interface EventDto extends EventSummary {
  description: string; address: string; placeId?: number; organizerBusinessId?: number
  priceAdult?: number; priceChild?: number; externalUrl?: string; capacity?: number; spotsLeft?: number
  savesCount: number; status: string
}
export interface EventQuery {
  from?: string; to?: string; category?: string; near?: string; radiusKm?: number
  organizerBusinessId?: number; organizerType?: string; hot?: boolean; q?: string; page?: number; size?: number
}

export interface TicketDto {
  code: string; eventId: number; eventTitle: string; startAt: string; locationName: string
  qtyAdult: number; qtyChild: number; total: number; status: string; createdAt: string
}

export interface OfferSummary {
  id: number; businessId: number; businessName: string; title: string; discountLabel: string
  localProduct: boolean; validUntil: string; pointsPrice?: number; imageUrl?: string; distanceKm?: number; rating?: number
}
export interface RedemptionDto {
  id: number; code: string; offerId: number; offerTitle: string; businessName: string; pointsSpent: number
  status: 'ISSUED' | 'USED' | 'CANCELLED'; issuedAt: string; usedAt?: string
}
export interface OfferDto extends OfferSummary {
  description: string; validFrom: string; status: string; viewsCount: number; redemptionsCount: number
  usedCount: number; myRedemption?: RedemptionDto
}

export interface RegistrationDto {
  id: number; actionId: number; actionTitle: string; code: string
  status: 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'; registeredAt: string; confirmedAt?: string
  user?: { id: number; displayName: string }
}
export interface ActionSummary {
  id: number; title: string; category: string; startAt: string; endAt: string; locationName: string
  lat: number; lng: number; pointsReward: number; capacity: number; registeredCount: number; imageUrl?: string
  goingPreview: string[]; myRegistration?: RegistrationDto
}
export interface ActionDto extends ActionSummary { description: string; address: string; status: string; confirmedCount: number }
export interface ConfirmResultDto extends RegistrationDto { alreadyConfirmed: boolean; pointsAwarded: number }

export interface PointsDto {
  balance: number; monthEarned: number; rank?: number
  transactions: { id: number; amount: number; type: string; note?: string; createdAt: string }[]
}
export interface LeaderboardDto {
  period: 'month' | 'year'
  entries: { rank: number; userId: number; displayName: string; points: number }[]
  me?: { rank: number; points: number }
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatResponse { reply: string; suggestedEventIds: number[]; quickReplies: string[]; offline: boolean }

export interface ItineraryStop {
  order: number; kind: 'PLACE' | 'EVENT' | 'OFFER'; refId: number; name: string; lat: number; lng: number
  arriveAt: string; leaveAt: string; durationMin: number; travelMinutesFromPrev: number; travelMode: Transport
  note?: string; parkingHint?: string; hasGuide: boolean; imageUrl?: string
}
export interface ItineraryRequest {
  date: string; startTime?: string; hours?: number; days?: number; transport: Transport
  interests: string[]; freeText?: string; start?: GeoPoint
}
export interface ItineraryDto {
  id?: number; shareCode?: string; title: string; summary: string; date: string; transport: Transport
  totalMinutes: number; stops: ItineraryStop[]
}

export interface HealthDto { status: string; time: string; version?: string }
