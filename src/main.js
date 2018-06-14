// IE11 Support
import "babel-polyfill";
import "event-source-polyfill";

// Packages
import Vue from "vue";
import Vuetify from "vuetify";
import VeeValidate from "vee-validate";
import "vuetify/dist/vuetify.min.css";
import colors from "vuetify/es5/util/colors";
import axios from "axios";

// Application modules
import App from "./App";
import Def from "./Def";
import AlertCmp from "./components/Common/Alert.vue";
import AppProcessing from "./components/Common/Processing.vue";
import AppYesCancelDialog from "./components/Common/YesCancelDialog.vue";
import AlertPopup from "./components/Common/AlertPopup.vue";

import { router } from "./router";
import { store } from "./store";
import { defstore } from "./store/defstore";
import db from "@/dbfunc/db";

// Vue config and add plugins
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
Vue.use(VeeValidate);
Vue.component("app-alert", AlertCmp);
Vue.component("app-processing", AppProcessing);
Vue.component("app-yescanceldlg", AppYesCancelDialog);
Vue.component("app-alertpop", AlertPopup);
Vue.prototype.$http = axios;

const defvm = new Vue({
  store: defstore,
  components: { Def },
  template: "<Def/>",
  render: (h) => h(Def)
});
defvm.$mount("#def");

let vm;

db.auth.onAuthStateChanged(async(user) => {
  try {
    if (store.state.signUpProcess) return false;

    await store
      .dispatch("getconfJSON")
      .then((confdata) => {
        store.commit("setConfData", confdata);
      })
      .catch((error) => {
        if (error.message === "Request failed with status code 404") {
          defstore.commit("setError", {
            errorText:
              "conf.json not found" + ":" + JSON.stringify(error.response),
            errorCode: "er101"
          });
        } else {
          defstore.commit("setError", { errorText: error, errorCode: "er100" });
        }
      });
    if (defstore.state.isError) return false;

    let redirectResult;
    await db.auth
      .getRedirectResult()
      .then((result) => {
        redirectResult = result;
      })
      .catch(async(error) => {
        let errorMode = "";
        if (error.code === "auth/account-exists-with-different-credential") {
          await db.auth
            .fetchSignInMethodsForEmail(error.email)
            .then((signMethods) => {
              if (signMethods.indexOf("google.com") !== -1) {
                errorMode = "googleSignIn";
              } else if (signMethods.indexOf("facebook.com") !== -1) {
                errorMode = "facebookSignIn";
              } else if (signMethods.indexOf("twitter.com") !== -1) {
                errorMode = "twitterSignIn";
              } else if (signMethods.indexOf("github.com") !== -1) {
                errorMode = "githubSignIn";
              }
              if (errorMode !== "") {
                localStorage.setItem(
                  "firebaseErrorAuthCredential",
                  JSON.stringify(error.credential)
                );
              }
            });
        }
        defstore.commit("setError", {
          errorText: error.message,
          errorCode: error.code,
          errorMode: errorMode
        });
      });
    if (defstore.state.isError) return false;

    if (user) {
      store.commit("setUser", {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: user.providerId,
        isAdmin: store.state.confData.adminemail === user.email
      });
    }

    if (!vm) {
      if (user) {
        await axios
          .get("https://ipapi.co/json/")
          .then((response) => {
            store.commit("setUserIP", response.data.ip);
            store.commit("setUserIPData", response.data);
          })
          .catch((error) => {
            store.commit("setUserIP", "0.0.0.0");
            store.commit("setUserIPData", null);
            store.commit("setError", error);
          });

        await store.dispatch("autoLogin", { redirectResult, user });
      } else {
        await store.dispatch("logout");
      }

      defstore.commit("setLoading", false);
      vm = new Vue({
        el: "#app",
        router,
        store,
        components: { App },
        template: "<App/>",
        render: (h) => h(App)
      });
    }
  } catch (error) {
    defstore.commit("setError", {
      errorText: error.message,
      errorCode: error.code
    });
  }
});
