import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import AboutPage from "../pages/AboutPage.vue";
import EventsListPage from "../pages/EventsListPage.vue";
import EventFormPage from "../pages/EventFormPage.vue";
import EventDetailPage from "../pages/EventDetailPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage,
    },
    {
      path: "/eventos",
      name: "events-list",
      component: EventsListPage,
    },
    {
      path: "/eventos/novo",
      name: "events-new",
      component: EventFormPage,
    },
    {
      path: "/eventos/:id",
      name: "events-detail",
      component: EventDetailPage,
    },
    {
      path: "/eventos/:id/editar",
      name: "events-edit",
      component: EventFormPage,
    },
    {
      path: "/sobre",
      name: "about",
      component: AboutPage,
    },
  ],
});

export default router;
