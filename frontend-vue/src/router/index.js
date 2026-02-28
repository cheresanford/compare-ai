import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import ListagemPage from '../pages/ListaEventosPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/listagem',
      name: 'listagem',
      component: ListagemPage,
    },
  ],
});

export default router;
