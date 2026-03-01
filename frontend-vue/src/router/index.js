import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import AboutPage from "../pages/AboutPage.vue";
import EventsListPage from "../pages/EventsListPage.vue";
import EventFormPage from "../pages/EventFormPage.vue";
import EventDetailPage from "../pages/EventDetailPage.vue";
import CategoriesListPage from "../pages/CategoriesListPage.vue";
import CategoryFormPage from "../pages/CategoryFormPage.vue";
import CategoryDetailPage from "../pages/CategoryDetailPage.vue";

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
      path: "/categorias",
      name: "categories-list",
      component: CategoriesListPage,
    },
    {
      path: "/eventos/novo",
      name: "events-new",
      component: EventFormPage,
    },
    {
      path: "/categorias/novo",
      name: "categories-new",
      component: CategoryFormPage,
    },
    {
      path: "/eventos/:id",
      name: "events-detail",
      component: EventDetailPage,
    },
    {
      path: "/categorias/:id",
      name: "categories-detail",
      component: CategoryDetailPage,
    },
    {
      path: "/eventos/:id/editar",
      name: "events-edit",
      component: EventFormPage,
    },
    {
      path: "/categorias/:id/editar",
      name: "categories-edit",
      component: CategoryFormPage,
    },
    {
      path: "/sobre",
      name: "about",
      component: AboutPage,
    },
  ],
});

export default router;
