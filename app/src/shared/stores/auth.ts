import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/shared/api/auth'
import { tokenStore, setUnauthorizedHandler } from '@/shared/api/client'
import type { RegisterRequest, Role, UserDto } from '@/shared/types/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserDto | null>(null)
  const token = ref<string | null>(tokenStore.get())
  const ready = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const role = computed<Role | null>(() => user.value?.role ?? null)

  function setSession(t: string, u: UserDto) {
    token.value = t
    user.value = u
    tokenStore.set(t)
  }

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password)
    setSession(res.token, res.user)
    return res.user
  }

  async function register(req: RegisterRequest) {
    const res = await authApi.register(req)
    setSession(res.token, res.user)
    return res.user
  }

  function logout() {
    token.value = null
    user.value = null
    tokenStore.set(null)
  }

  /** La pornire: dacă există token, încarcă /me; dacă e invalid, curăță sesiunea. */
  async function init() {
    if (ready.value) return
    if (token.value) {
      try { user.value = await authApi.me() } catch { logout() }
    }
    ready.value = true
  }

  function hasRole(...roles: Role[]) {
    return !!user.value && (user.value.role === 'ADMIN' || roles.includes(user.value.role))
  }

  setUnauthorizedHandler(() => logout())

  return { user, token, ready, isLoggedIn, role, login, register, logout, init, hasRole }
})
