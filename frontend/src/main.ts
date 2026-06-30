import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import './style.css';
import '@/blocks/style.css';
import '@/editor/editor.css';

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);

  const auth = useAuthStore();
  await auth.init();
  await router.isReady();
  app.mount('#app');
}

bootstrap();
