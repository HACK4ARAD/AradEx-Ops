import { createI18n } from 'vue-i18n'
import ro from './ro.json'
import en from './en.json'

export type Locale = 'ro' | 'en'
const LOCALE_KEY = 'ax.locale'

function savedLocale(): Locale {
  try { return (localStorage.getItem(LOCALE_KEY) as Locale) || 'ro' } catch { return 'ro' }
}

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale(),
  fallbackLocale: 'ro',
  messages: { ro, en },
})

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  try { localStorage.setItem(LOCALE_KEY, locale) } catch { /* ignore */ }
  document.documentElement.lang = locale
}
