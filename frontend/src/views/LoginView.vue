<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');

async function submit() {
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    const redirect = (router.currentRoute.value.query.redirect as string) || '/chat';
    router.push(redirect);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка входа';
  }
}
</script>

<template>
  <section class="auth-page">
    <h2 class="auth-page__title">Вход</h2>
    <form class="auth-form" @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label>
        Пароль
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="btn-primary auth-form__submit" :disabled="auth.loading">
        {{ auth.loading ? 'Вход…' : 'Войти' }}
      </button>
    </form>
    <div class="auth-footer">
      <div class="auth-divider" aria-hidden="true" />
      <p class="auth-link">
        Нет аккаунта?
        <RouterLink to="/register">Зарегистрироваться</RouterLink>
      </p>
    </div>
  </section>
</template>
