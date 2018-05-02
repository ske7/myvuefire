import Vue from "vue";
import Router from "vue-router";

import db from "@/dbfunc/db";

// Pages
import Page from "@/components/Page";
import Signup from "@/components/User/Signup";
import Login from "@/components/User/Login";
import Reset from "@/components/User/Reset";
import Profile from "@/components/User/Profile";
import Admin from "@/components/Admin";

import { store } from "@/store";

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
	if (!store.getters.isUserVerified && to.path !== "/") {
		next("/");
	}

	let requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
	let requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
	let alreadyAuth = to.matched.some((record) => record.meta.alreadyAuth);
	if (alreadyAuth) {
		let currentUser = db.auth.currentUser;
		if (currentUser) {
			next("/");
		} else {
			next();
		}
	} else {
		if (requiresAuth) {
			let currentUser = db.auth.currentUser;
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
