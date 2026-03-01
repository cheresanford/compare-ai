import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import AboutPage from '../pages/AboutPage.vue';
import EventsListPage from '../pages/EventsListPage.vue';
import EventFormPage from '../pages/EventFormPage.vue';
import EventDetailPage from '../pages/EventDetailPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/events',
      name: 'events',
      component: EventsListPage,
    },
    {
      path: '/events/new',
      name: 'event-new',
      component: EventFormPage,
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: EventDetailPage,
    },
    {
      path: '/events/:id/edit',
      name: 'event-edit',
      component: EventFormPage,
    },
    {
      path: '/sobre',
      name: 'about',
      component: AboutPage,
    },
  ],
});

export default router;
