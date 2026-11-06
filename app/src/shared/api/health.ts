import { client } from './client'
import type { HealthDto } from '@/shared/types/api'

export const healthApi = {
  check: () => client.get<HealthDto>('/health', { auth: false }),
}
