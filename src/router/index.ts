import { createRouter, createWebHistory } from "vue-router";
import LayoutWithMenu from "../layouts/LayoutWithMenu.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "welcome",
      components: {
        default: () => import("../views/WelcomeView.vue"),
        layout: LayoutWithMenu,
      },
    },
    {
      path: "/mission-control",
      name: "mission-control",
      components: {
        default: () => import("../views/MissionControlView.vue"),
        layout: LayoutWithMenu,
      },
    },
    {
      path: "/mission-control/device/:id",
      component: () => import("../views/MissionControlSingleView.vue"),
    },
    {
      path: "/automation",
      name: "automation",
      components: {
        default: () => import("../views/AutomationView.vue"),
        layout: LayoutWithMenu,
      },
    },
    {
      path: "/devices",
      name: "devices",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      components: {
        default: () => import("../views/DevicesView.vue"),
        layout: LayoutWithMenu,
      },
    },
    {
      path: "/health",
      name: "health",
      components: {
        default: () => import("../views/SystemHealthView.vue"),
        layout: LayoutWithMenu,
      },
    },
    {
      path: "/settings",
      name: "settings",
      components: {
        default: () => import("../views/SettingsView.vue"),
        layout: LayoutWithMenu,
      },
    },
  ],
});

export default router;
