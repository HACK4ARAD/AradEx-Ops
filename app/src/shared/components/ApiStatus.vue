<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { healthApi } from '@/shared/api/health'
import AppIcon from './AppIcon.vue'

const { t } = useI18n()
const online = ref<boolean | null>(null)
const version = ref('')
onMounted(async () => {
  try { const h = await healthApi.check(); online.value = h.status === 'ok'; version.value = h.version ?? '' }
  catch { online.value = false }
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-[12px] rounded-full px-2.5 py-1"
    :class="online === null ? 'bg-white text-muted' : online ? 'bg-green-soft text-green' : 'bg-peach text-accent'">
    <AppIcon :name="online ? 'cloud_done' : 'cloud_off'" :size="16" />
    {{ online === null ? t('common.loading') : online ? t('common.apiOnline') + (version ? ' · ' + version : '') : t('common.apiOffline') }}
  </span>
</template>
