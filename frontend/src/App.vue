<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <div class="app-shell">
    <AppHeader @logout="logout" />
    <main class="app-main">
      <RouterView />
    </main>
    <BottomNav v-if="auth.isAuthenticated" />
  </div>
</template>
