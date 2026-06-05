import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';
import ChatView from '@/views/ChatView.vue';
import TimelineView from '@/views/TimelineView.vue';
import CalendarView from '@/views/CalendarView.vue';
import TopView from '@/views/TopView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/chat', name: 'chat', component: ChatView, meta: { requiresAuth: true } },
    { path: '/timeline', name: 'timeline', component: TimelineView, meta: { requiresAuth: true } },
    { path: '/calendar', name: 'calendar', component: CalendarView, meta: { requiresAuth: true } },
    { path: '/top', name: 'top', component: TopView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'chat' };
  }
});

export default router;
