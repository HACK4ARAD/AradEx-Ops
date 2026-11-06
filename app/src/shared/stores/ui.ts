import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast { id: number; message: string; kind: 'info' | 'success' | 'error'; action?: { label: string; onClick: () => void } }

/** Stare de UI globală: toast-uri + preferința mobil/web. */
export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  let seq = 0

  function toast(message: string, kind: Toast['kind'] = 'info', action?: Toast['action'], ms = 3500) {
    const id = ++seq
    toasts.value.push({ id, message, kind, action })
    window.setTimeout(() => dismiss(id), ms)
    return id
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  function error(err: unknown) {
    const message = err instanceof Error ? err.message : 'A apărut o eroare'
    return toast(message, 'error')
  }

  return { toasts, toast, dismiss, error }
})
