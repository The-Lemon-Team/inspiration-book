import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';
import TagsView from '@/views/TagsView.vue';
import ChatView from '@/views/ChatView.vue';
import TimelineView from '@/views/TimelineView.vue';
import CalendarView from '@/views/CalendarView.vue';
import TopView from '@/views/TopView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import SettingsView from '@/views/SettingsView.vue';

const history =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? createWebHashHistory()
    : createWebHistory();

const router = createRouter({
  history,
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/tags', name: 'tags', component: TagsView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/chat', name: 'chat', component: ChatView, meta: { requiresAuth: true } },
    { path: '/timeline', name: 'timeline', component: TimelineView, meta: { requiresAuth: true } },
    { path: '/calendar', name: 'calendar', component: CalendarView, meta: { requiresAuth: true } },
    { path: '/top', name: 'top', component: TopView, meta: { requiresAuth: true } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.init();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'chat' };
  }
});

export default router;
