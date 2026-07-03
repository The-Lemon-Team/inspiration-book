<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';

const router = useRouter();
const auth = useAuthStore();
const settings = useSettingsStore();

const floatingIcons = [
  'person',
  'mic',
  'music_note',
  'smart_toy',
  'photo_camera',
  'chat_bubble',
  'description',
  'mood',
  'lock',
] as const;

async function startMessaging() {
  settings.markWelcomeSeen();

  if (auth.isAuthenticated) {
    await router.push('/chats');
    return;
  }

  await router.push({ name: 'login', query: { redirect: '/chats' } });
}
</script>

<template>
  <div class="welcome-screen">
    <header class="welcome-screen__hero" aria-hidden="true">
      <div class="welcome-screen__icons">
        <span
          v-for="(icon, index) in floatingIcons"
          :key="icon"
          class="welcome-screen__icon material-symbols-outlined"
          :style="{ '--i': index }"
        >
          {{ icon }}
        </span>
      </div>

      <div class="welcome-screen__logo-wrap">
        <img src="/favicon.svg" alt="" class="welcome-screen__logo" width="120" height="120" />
      </div>

      <div class="welcome-screen__clouds">
        <span class="welcome-screen__cloud welcome-screen__cloud--1" />
        <span class="welcome-screen__cloud welcome-screen__cloud--2" />
        <span class="welcome-screen__cloud welcome-screen__cloud--3" />
        <span class="welcome-screen__cloud welcome-screen__cloud--4" />
      </div>
    </header>

    <section class="welcome-screen__content">
      <h1 class="welcome-screen__title">Lemon Party</h1>
      <p class="welcome-screen__lead">
        Добро пожаловать в Lemon Party для ПК.
        <br />
        Быстрый и удобный клиент для чатов, заметок и вдохновения.
      </p>

      <button type="button" class="welcome-screen__cta" @click="startMessaging">
        Начать общение
      </button>
    </section>
  </div>
</template>

<style scoped>
.welcome-screen {
  --welcome-blue: #2aabee;
  --welcome-blue-deep: #229ed9;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #fff;
}

.welcome-screen__hero {
  position: relative;
  flex: 0 0 42%;
  min-height: 17rem;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: linear-gradient(180deg, var(--welcome-blue) 0%, var(--welcome-blue-deep) 100%);
}

.welcome-screen__logo-wrap {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.welcome-screen__logo {
  display: block;
  width: 5.5rem;
  height: 5.5rem;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.welcome-screen__icons {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.welcome-screen__icon {
  position: absolute;
  font-size: 1.35rem;
  color: rgba(255, 255, 255, 0.42);
  animation: welcome-float 6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.7s);
}

.welcome-screen__icon:nth-child(1) { top: 18%; left: 14%; font-size: 1.1rem; }
.welcome-screen__icon:nth-child(2) { top: 12%; left: 34%; font-size: 1rem; }
.welcome-screen__icon:nth-child(3) { top: 24%; left: 56%; font-size: 1.2rem; }
.welcome-screen__icon:nth-child(4) { top: 10%; left: 72%; font-size: 1.15rem; }
.welcome-screen__icon:nth-child(5) { top: 34%; left: 82%; font-size: 1rem; }
.welcome-screen__icon:nth-child(6) { top: 42%; left: 10%; font-size: 1.25rem; }
.welcome-screen__icon:nth-child(7) { top: 48%; left: 28%; font-size: 1rem; }
.welcome-screen__icon:nth-child(8) { top: 38%; left: 66%; font-size: 1.15rem; }
.welcome-screen__icon:nth-child(9) { top: 30%; left: 88%; font-size: 1.05rem; }

@keyframes welcome-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.42;
  }

  50% {
    transform: translateY(-6px);
    opacity: 0.62;
  }
}

.welcome-screen__clouds {
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 4.5rem;
  pointer-events: none;
}

.welcome-screen__cloud {
  position: absolute;
  bottom: 0;
  border-radius: 999px;
  background: #fff;
}

.welcome-screen__cloud--1 {
  left: -4%;
  width: 42%;
  height: 3.25rem;
}

.welcome-screen__cloud--2 {
  left: 24%;
  width: 34%;
  height: 2.75rem;
  bottom: 0.35rem;
  opacity: 0.92;
}

.welcome-screen__cloud--3 {
  left: 52%;
  width: 38%;
  height: 3rem;
}

.welcome-screen__cloud--4 {
  right: -6%;
  width: 36%;
  height: 2.5rem;
  bottom: 0.2rem;
}

.welcome-screen__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 2.5rem 1.75rem 2rem;
  text-align: center;
}

.welcome-screen__title {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.125rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #222;
}

.welcome-screen__lead {
  margin: 0;
  max-width: 26rem;
  font-size: 1rem;
  line-height: 1.55;
  color: #6b7280;
}

.welcome-screen__cta {
  width: min(100%, 18rem);
  margin-top: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 999px;
  background: var(--welcome-blue);
  color: #fff;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.welcome-screen__cta:hover {
  background: var(--welcome-blue-deep);
}

.welcome-screen__cta:active {
  transform: scale(0.98);
}

.welcome-screen__cta:focus-visible {
  outline: 2px solid var(--welcome-blue);
  outline-offset: 3px;
}
</style>
