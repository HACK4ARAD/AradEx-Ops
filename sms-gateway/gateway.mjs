#!/usr/bin/env node
// T24 · gateway-ul de SMS al AradExperience: ia codurile OTP din coada API-ului și le trimite prin aplicația Mesaje
// (iPhone-ul lui Zoltan, cu „Redirecționare mesaje text” spre acest Mac). Mac-ul doar întreabă API-ul (fără porturi deschise).
//
//   node gateway.mjs                 rulează (launchd îl ține pornit; vezi setup.sh)
//   node gateway.mjs --test +40744…  trimite un SMS de test, fără API (verifici Mesaje + iPhone)
//
// Tokenul stă în Keychain (serviciul `aradex-sms-gateway`), pus de setup.sh; nu se afișează și nu se scrie în fișiere.
// În log apar doar ultimele 3 cifre ale numărului, niciodată textul (are codul).
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const API = (process.env.AX_API ?? 'https://aradexperience.site/api/v1').replace(/\/$/, '')
const KEYCHAIN_SERVICE = process.env.AX_KEYCHAIN_SERVICE ?? 'aradex-sms-gateway'
/** AX_DRY_RUN=1: nu trimite nimic, doar confirmă (test local al cozii, fără SMS). */
const DRY_RUN = process.env.AX_DRY_RUN === '1'
const POLL_MS = 3000
const MAX_BACKOFF_MS = 60000
const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'send-sms.applescript')

export const mask = (phone) => '***' + String(phone).slice(-3)
const log = (...a) => console.log(new Date().toISOString(), ...a)

async function readToken() {
  const { stdout } = await run('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-a', 'gateway', '-w'])
  const token = stdout.trim()
  if (!token) throw new Error('empty token in Keychain')
  return token
}

export async function sendSms(phone, body) {
  if (!/^\+\d{8,15}$/.test(phone)) throw new Error('bad phone')
  if (DRY_RUN) return
  await run('osascript', [SCRIPT, phone, body], { timeout: 30000 })
}

async function api(token, path) {
  const res = await fetch(`${API}${path}`, { method: 'POST', headers: { 'X-Gateway-Token': token }, signal: AbortSignal.timeout(15000) })
  if (res.status === 401) throw Object.assign(new Error('token rejected (401)'), { fatal: true })
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`)
  return res.status === 204 ? null : res.json()
}

async function loop() {
  const token = await readToken()
  log(`gateway started · ${API}${DRY_RUN ? ' · DRY RUN (no SMS)' : ''}`)
  let backoff = POLL_MS
  for (;;) {
    try {
      const batch = await api(token, '/sms-gateway/claim')
      for (const m of batch) {
        try {
          await sendSms(m.phone, m.body)
          await api(token, `/sms-gateway/messages/${m.id}/sent`)
          log(`sent #${m.id} to ${mask(m.phone)}`)
        } catch (err) {
          log(`FAILED #${m.id} to ${mask(m.phone)}: ${err.message.split('\n')[0]}`)
          await api(token, `/sms-gateway/messages/${m.id}/failed`).catch(() => {})
        }
      }
      backoff = POLL_MS
    } catch (err) {
      if (err.fatal) { log(err.message, '— run setup.sh again'); process.exit(1) }
      backoff = Math.min(backoff * 2, MAX_BACKOFF_MS)
      log(`API unreachable (${err.message}); retry in ${backoff / 1000}s`)
    }
    await new Promise((r) => setTimeout(r, backoff))
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--test')
  if (i > -1) {
    const phone = process.argv[i + 1]
    sendSms(phone, 'Test AradExperience: gateway-ul de SMS funcționează.')
      .then(() => log(`test SMS sent to ${mask(phone)}`))
      .catch((e) => { log('test failed:', e.message); process.exit(1) })
  } else {
    loop().catch((e) => { log('fatal:', e.message); process.exit(1) })
  }
}
