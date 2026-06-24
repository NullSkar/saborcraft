import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Recipes from "../views/Recipes.vue";
import RecipeDetails from "../views/RecipeDetails.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Profile from "../views/Profile.vue";
import EditProfile from "../views/EditProfile.vue";
import CreateRecipe from "../views/CreateRecipe.vue";
import EditRecipe from "../views/EditRecipe.vue";
import AdminPanel from "../views/AdminPanel.vue";
import { authService } from "../services/api";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  { 
    path: "/recipes", 
    name: "Recipes", 
    component: Recipes 
  },
  {
    path: "/recipes/create",
    name: "CreateRecipe",
    component: CreateRecipe,
    meta: { requiresAuth: true }
  },
  {
    path: "/recipes/:id/edit",
    name: "EditRecipe",
    component: EditRecipe,
    meta: { requiresAuth: true }
  },
  {
    path: "/recipes/:id",
    name: "RecipeDetails",
    component: RecipeDetails,
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/register",
    name: "Register",
    component: Register
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: "/profile/edit",
    name: "EditProfile",
    component: EditProfile,
    meta: { requiresAuth: true }
  },
  {
    path: "/admin",
    name: "AdminPanel",
    component: AdminPanel,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  }
});

// Route Guard - Proteger rutas que requieren autenticación
router.beforeEach((to, from, next) => {
  const isLoggedIn = authService.isLoggedIn();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Si la ruta requiere autenticación y no está logueado
  if (requiresAuth && !isLoggedIn) {
    // Redirigir a login
    next({
      path: '/login',
      query: { redirect: to.fullPath } 
    });
  } 
  // Si está logueado e intenta ir a login/register, redirigir a home
  else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    next('/');
  }
  // Permitir acceso
  else {
    next();
  }
});

export default router;
