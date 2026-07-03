<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useShellMode } from '@/composables/useShellMode';
import { useMoreModal } from '@/composables/useMoreModal';
import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import TelegramShell from '@/layouts/TelegramShell.vue';
import MoreMenuModal from '@/components/shell/MoreMenuModal.vue';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { usesUnifiedShell } = useShellMode();
const { moreModalOpen, closeMoreModal } = useMoreModal();

const isWelcomeRoute = computed(() => route.name === 'welcome');

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>

<template>
  <RouterView v-if="isWelcomeRoute" />

  <TelegramShell v-else-if="usesUnifiedShell && auth.isAuthenticated" @logout="logout" />

  <div v-else class="app-shell">
    <AppHeader @logout="logout" />
    <main class="app-main">
      <RouterView />
    </main>
    <BottomNav v-if="auth.isAuthenticated" />
  </div>

  <MoreMenuModal
    v-if="auth.isAuthenticated && !isWelcomeRoute"
    :open="moreModalOpen"
    @close="closeMoreModal"
  />
</template>
