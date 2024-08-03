import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth'; // Import the authentication store
import { defineAsyncComponent, defineComponent, Component } from 'vue';

function lazyLoadRoute(loader: () => Promise<{ default: Component }>) {
  return defineAsyncComponent(loader);
}

// Use the function like this:
const Home = lazyLoadRoute(() => import('@/views/index.vue'));
const Login = lazyLoadRoute(() => import('@/views/auth/login.vue'));
const Register = lazyLoadRoute(() => import('@/views/auth/register.vue'));
const Dashboard = lazyLoadRoute(() => import('@/views/dashboard.vue'));

// Define routes with lazy-loaded components and authentication metadata
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home as unknown as Component,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login as unknown as Component,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register as unknown as Component,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard as unknown as Component,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Define type for route metadata to include 'requiresGuest' and 'requiresAuth' properties
interface RouteMeta extends Record<string | number | symbol, unknown> {
  requiresGuest?: boolean;
  requiresAuth?: boolean;
}

// Navigation guard to handle route protection based on authentication status
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Get the instance of the authentication store

  if ((to.meta as RouteMeta).requiresAuth) {
    // This route requires authentication
    if (!authStore.isAuthenticated) {
      // User is not authenticated, redirect to login page
      next({ name: 'Login' });
    } else {
      // User is authenticated, allow access to the route
      next();
    }
  } else if ((to.meta as RouteMeta).requiresGuest) {
    // This route requires a guest user (not authenticated)
    if (authStore.isAuthenticated) {
      // User is authenticated, redirect to dashboard page
      next({ name: 'Dashboard' });
    } else {
      // User is not authenticated, allow access to the route
      next();
    }
  } else {
    // Route does not require authentication or being a guest, allow access
    next();
  }
});

export default router;
