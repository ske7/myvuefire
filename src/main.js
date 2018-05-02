// IE11 Support
import "babel-polyfill";
import "event-source-polyfill";

// Packages
import Vue from "vue";
import VueResource from "vue-resource";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import colors from "vuetify/es5/util/colors";

import { router } from "./router";
import { store } from "./store";
import db from "@/dbfunc/db";

// App
import App from "./App";
import AlertCmp from "./components/Common/Alert.vue";

Vue.config.productionTip = false;
Vue.config.performance = process.env.NODE_ENV === "development";
Vue.use(Vuetify, {
	theme: {
		primary: colors.purple.darken1,
		secondary: "#424242",
		accent: "#82B1FF",
		error: "#FF5252",
		info: "#2196F3",
		success: "#4CAF50",
		warning: "#FFC107"
	}
});
Vue.use(VueResource);
Vue.http.options.root = "/";
Vue.component("app-alert", AlertCmp);

let vm;
store.commit("setAuthPreparing", true);

store
	.dispatch("getconfJSON")
	.then((data) => {
		store.commit("setConfData", data);

		db.auth.onAuthStateChanged(async function(user) {
			if (store.state.signUpProcess) return false;
			if (user) {
				store.commit("setUser", {
					uid: user.uid,
					email: user.email,
					emailVerified: user.emailVerified,
					displayName: user.displayName,
					photoURL: user.photoURL,
					isAdmin: store.state.confData.adminemail === user.email
				});
			}
			if (!vm) {
				if (user) {
					await store.dispatch("autoLogin", user);
				} else {
					await store.dispatch("logout");
				}
				await store.dispatch("authPreparing", false);
				vm = new Vue({
					el: "#app",
					router,
					store,
					components: { App },
					template: "<App/>",
					render: (h) => h(App)
				});
			}
		});
	})
	.catch((error) => {
		alert("conf.json not found" + ":" + JSON.stringify(error));
	});
