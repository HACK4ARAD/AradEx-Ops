import type { ProblemDetail } from '@/shared/types/api'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080/api/v1'
const TOKEN_KEY = 'ax.token'

/** Eroare de API: are status + detail din ProblemDetail (RFC 7807). FE afișează `detail` în toast. */
export class ApiError extends Error {
  status: number
  problem?: ProblemDetail
  constructor(status: number, message: string, problem?: ProblemDetail) {
    super(message)
    this.status = status
    this.problem = problem
  }
}

export const tokenStore = {
  get(): string | null {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token: string | null) {
    try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY) } catch { /* privat / blocat */ }
  },
}

/** Apelat de store-ul de auth la 401, ca să facă logout + redirect fără import circular. */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) { onUnauthorized = fn }

type Query = Record<string, string | number | boolean | undefined | null>

interface Options { query?: Query; body?: unknown; headers?: Record<string, string>; auth?: boolean }

function buildUrl(path: string, query?: Query): string {
  const url = new URL(BASE.replace(/\/$/, '') + path)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

async function request<T>(method: string, path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (token && opts.auth !== false) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Nu am putut contacta serverul. Verifică conexiunea.')
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? safeJson(text) : undefined

  if (!res.ok) {
    const problem = data as ProblemDetail | undefined
    if (res.status === 401 && token) onUnauthorized?.()
    throw new ApiError(res.status, problem?.detail || problem?.title || `Eroare ${res.status}`, problem)
  }
  return data as T
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text) } catch { return text }
}

export const client = {
  get: <T>(path: string, opts?: Options) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: Options) => request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: Options) => request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: Options) => request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: Options) => request<T>('DELETE', path, opts),
}
