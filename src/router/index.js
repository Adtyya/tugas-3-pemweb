import { createRouter, createWebHistory } from "vue-router";
import Stock from "../components/Stock.vue";
import Tracking from "../components/DeliveryTracking.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Stock,
  },
  {
    path: "/tracking",
    name: "Tracking",
    component: Tracking,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
