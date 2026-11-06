<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppButton, AppIcon, AppInput } from '@/shared/components'
import { useAuthStore } from '@/shared/stores/auth'
import { useUiStore } from '@/shared/stores/ui'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const name = ref('')
const role = ref<'VISITOR' | 'LOCAL' | 'BUSINESS'>('VISITOR')
const busy = ref(false)
const base = route.path.startsWith('/w') ? '/w' : '/m'
const showDemo = import.meta.env.DEV || import.meta.env.VITE_DEMO === 'true'

const demo = [
  ['Vizitator', 'visitor@demo.ro'], ['Localnic', 'local@demo.ro'], ['Firmă', 'firma@demo.ro'], ['Primărie', 'primaria@demo.ro'], ['Admin', 'admin@demo.ro'],
] as const

async function submit() {
  busy.value = true
  try {
    const u = mode.value === 'login'
      ? await auth.login(email.value.trim(), password.value)
      : await auth.register({ email: email.value.trim(), password: password.value, displayName: name.value.trim(), role: role.value })
    ui.toast(t('auth.welcome', { name: u.displayName }), 'success')
    router.replace((route.query.next as string) || base)
  } catch (e) { ui.error(e) } finally { busy.value = false }
}
function useDemo(mail: string) { email.value = mail; password.value = 'demo1234'; mode.value = 'login' }
</script>

<template>
  <button class="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center mb-3" @click="router.back()"><AppIcon name="arrow_back" /></button>
  <div class="flex items-center gap-2 text-[14px] font-semibold mb-6"><span class="w-2.5 h-2.5 rounded-full bg-accent" /> {{ t('app.name') }}</div>
  <h1 class="text-[28px] font-semibold tracking-[-0.025em] leading-tight m-0 mb-5">{{ t('auth.title') }}</h1>

  <form class="flex flex-col gap-3" @submit.prevent="submit">
    <AppInput v-if="mode === 'register'" v-model="name" :label="t('auth.name')" icon="person" autocomplete="name" />
    <AppInput v-model="email" :label="t('auth.email')" type="email" icon="mail" placeholder="nume@exemplu.ro" autocomplete="email" />
    <AppInput v-model="password" :label="t('auth.password')" type="password" icon="lock" autocomplete="current-password" />
    <div v-if="mode === 'register'" class="flex gap-2">
      <button v-for="r in (['VISITOR','LOCAL','BUSINESS'] as const)" :key="r" type="button"
        class="flex-1 h-10 rounded-full border text-[13px] font-medium" :class="role === r ? 'bg-ink text-white border-ink' : 'bg-white border-line'" @click="role = r">
        {{ r === 'VISITOR' ? t('auth.roleVisitor') : r === 'LOCAL' ? t('auth.roleLocal') : t('auth.roleBusiness') }}
      </button>
    </div>
    <AppButton type="submit" block :loading="busy" class="mt-2">{{ mode === 'login' ? t('auth.login') : t('auth.register') }}</AppButton>
  </form>

  <button class="w-full text-center text-[14px] font-semibold underline mt-4" @click="mode = mode === 'login' ? 'register' : 'login'">
    {{ mode === 'login' ? t('auth.noAccount') + ' ' + t('auth.register') : t('auth.haveAccount') + ' ' + t('auth.login') }}
  </button>
  <router-link :to="base" class="block text-center text-[14px] text-muted mt-3">{{ t('auth.asVisitor') }}</router-link>

  <div v-if="showDemo" class="mt-8">
    <div class="text-[12px] font-semibold tracking-wider uppercase text-muted mb-2">{{ t('auth.demoAccounts') }}</div>
    <div class="flex flex-wrap gap-2">
      <button v-for="d in demo" :key="d[1]" type="button" class="h-9 px-3 rounded-full bg-white border border-line text-[13px]" @click="useDemo(d[1])">{{ d[0] }}</button>
    </div>
  </div>
</template>
