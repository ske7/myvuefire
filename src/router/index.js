import Vue from "vue";
import Router from "vue-router";

import db from "@/dbfunc/db";
import { store } from "@/store";

// Pages
import Page from "@/components/Page";
import Signup from "@/components/User/Signup";
import Login from "@/components/User/Login";
import Reset from "@/components/User/Reset";
import Profile from "@/components/User/Profile";
import Admin from "@/components/Admin/Admin";

Vue.use(Router);

export const router = new Router({
  mode: "history",
  routes: [
    {
      path: "*",
      redirect: "/"
    },
    {
      path: "/",
      name: "Page",
      component: Page
    },
    {
      path: "/signup",
      name: "Signup",
      component: Signup,
      meta: {
        alreadyAuth: true
      }
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: {
        alreadyAuth: true
      }
    },
    {
      path: "/reset",
      name: "Reset",
      component: Reset,
      meta: {
        alreadyAuth: true
      }
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/admin",
      name: "Admin",
      component: Admin,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (
    !store.getters.isUserVerified &&
    to.path !== "/" &&
    to.path !== "/profile"
  ) {
    next("/");
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const alreadyAuth = to.matched.some((record) => record.meta.alreadyAuth);
  if (alreadyAuth) {
    const currentUser = db.auth.currentUser;
    if (currentUser) {
      next("/");
    } else {
      next();
    }
  } else {
    if (requiresAuth) {
      const currentUser = db.auth.currentUser;
      if (!currentUser) {
        next("/login");
      } else {
        if (requiresAdmin) {
          if (store.getters.isadminemail) {
            next();
          } else {
            next("/");
          }
        } else {
          next();
        }
      }
    } else {
      next();
    }
  }
});
