import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "welcome",
      component: () => import("../views/WelcomeView.vue"),
    },
    {
      path: "/mission-control",
      name: "mission-control",
      component: () => import("../views/MissionControlView.vue"),
    },
    {
      path: "/automation",
      name: "automation",
      component: () => import("../views/AutomationView.vue"),
    },
    {
      path: "/devices",
      name: "devices",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/DevicesView.vue"),
    },
    {
      path: "/health",
      name: "health",
      component: () => import("../views/SystemHealthView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
    },
  ],
});

export default router;
