import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useChatsStore } from '@/stores/chats';
import FiltersView from '@/views/FiltersView.vue';
import GroupsView from '@/views/GroupsView.vue';
import GraphView from '@/views/GraphView.vue';
import ChatsListView from '@/views/ChatsListView.vue';
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
    { path: '/', redirect: '/filters' },
    { path: '/filters', name: 'filters', component: FiltersView },
    { path: '/groups', name: 'groups', component: GroupsView, meta: { requiresAuth: true } },
    { path: '/graph', name: 'graph', component: GraphView, meta: { requiresAuth: true } },
    { path: '/tags', redirect: '/filters' },
    { path: '/chats', name: 'chats-list', component: ChatsListView, meta: { requiresAuth: true } },
    {
      path: '/chat',
      name: 'chat',
      redirect: '/chats',
      meta: { requiresAuth: true },
    },
    {
      path: '/chats/:chatId',
      name: 'chat-room',
      component: ChatView,
      meta: { requiresAuth: true },
    },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/timeline', name: 'timeline', component: TimelineView, meta: { requiresAuth: true } },
    { path: '/calendar', name: 'calendar', component: CalendarView, meta: { requiresAuth: true } },
    { path: '/top', name: 'top', component: TopView, meta: { requiresAuth: true } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
  ],
});

async function resolveGeneralChatId() {
  const chats = useChatsStore();
  await chats.load();
  return chats.general?.id ?? chats.allChats[0]?.id ?? null;
}

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.init();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'chats-list' };
  }

  if (to.name === 'chat-room' && to.params.chatId === 'general') {
    const chatId = await resolveGeneralChatId();
    if (chatId && chatId !== 'general') {
      return { name: 'chat-room', params: { chatId }, replace: true };
    }
  }
});

export default router;
