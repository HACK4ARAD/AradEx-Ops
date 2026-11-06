import { client } from './client'
import type { AuthResponse, RegisterRequest, UserDto } from '@/shared/types/api'

export const authApi = {
  login: (email: string, password: string) => client.post<AuthResponse>('/auth/login', { email, password }, { auth: false }),
  register: (req: RegisterRequest) => client.post<AuthResponse>('/auth/register', req, { auth: false }),
  me: () => client.get<UserDto>('/me'),
  updateMe: (patch: { displayName?: string; locale?: 'ro' | 'en' }) => client.patch<UserDto>('/me', patch),
}
