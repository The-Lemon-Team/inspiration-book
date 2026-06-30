<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');

async function submit() {
  error.value = '';
  try {
    await auth.register(email.value, password.value, name.value || undefined);
    router.push('/chat');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка регистрации';
  }
}
</script>

<template>
  <section class="auth-page">
    <h2 class="auth-page__title">Регистрация</h2>
    <form class="auth-form" @submit.prevent="submit">
      <label>
        Имя <span class="auth-form__optional">необязательно</span>
        <input v-model="name" type="text" autocomplete="name" placeholder="Как к вам обращаться" />
      </label>
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label>
        Пароль
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          placeholder="Мин. 6 символов"
        />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="btn-primary auth-form__submit" :disabled="auth.loading">
        {{ auth.loading ? 'Регистрация…' : 'Создать аккаунт' }}
      </button>
    </form>
    <div class="auth-footer">
      <div class="auth-divider" aria-hidden="true" />
      <p class="auth-link">
        Уже есть аккаунт?
        <RouterLink to="/login">Войти</RouterLink>
      </p>
    </div>
  </section>
</template>
