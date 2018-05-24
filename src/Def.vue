<template>
  <v-app v-show="isLoading || isError" id="def" light>
    <app-header app/>
    <v-jumbotron
      color="light-green lighten-2"
      gradient="45deg, #F1F8E9, #FFF8E9"
      height="100%">
      <v-content>
        <v-container>
          <transition name="fade" mode="out-in">
            <v-layout row justify-center align-center>
              <v-flex xs8 text-xs-center>
                <v-alert :value="true" :color="isError ? 'error' : 'info'" :type="isError ? 'error' : 'info'">
                  <v-layout row justify-center align-centerp class="display-1">{{ headerText }}</v-layout>
                  <v-layout v-if="isError && errorCode" row justify-center wrap align-center class="body-1 mt-3">
                    <v-flex xs8 text-xs-left>Error code: {{ errorCode }} </v-flex>
                  </v-layout>
                  <v-layout v-if="isError" row justify-center wrap align-center class="body-1 mt-1">
                    <v-flex xs8 text-xs-left>Error message: {{ errorText }} </v-flex>
                  </v-layout>
                  <v-layout v-if="isLoading" row justify-center align-center mt-1><v-progress-circular :size="40" indeterminate color="white"/></v-layout>
                  <v-layout row justify-center align-center mt-3>
                    <v-btn
                      v-if="isError"
                      color="yellow"
                      light
                      small
                      style="min-width:48px; max-width:96px;"
                      @click="reload()">
                      Reload
                    </v-btn>
                  </v-layout>
                  <v-layout v-if="isGoogleSignIn" row justify-center align-center>
                    <v-btn
                      small
                      color="white"
                      light
                      round
                      @click="onSignupWithGoogle">
                      <i class="fa fa-google-plus"/>
                      <span class="ml-1">Sign in with Google</span>
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                  </v-layout>
                </v-alert>
              </v-flex>
            </v-layout>
          </transition>
        </v-container>
      </v-content>
    </v-jumbotron>
    <app-footer app/>
  </v-app>
</template>

<script>
import DefHeader from "./components/DefHeader.vue";
import Footer from "./components/Footer.vue";
import db from "@/dbfunc/db";

export default {
	name: "Def",
	components: {
		appHeader: DefHeader,
		appFooter: Footer
	},
	computed: {
		isLoading() {
			return (
				this.$store.getters.loading
			);
		},
		isError() {
			return (
				this.$store.getters.isError
			);
		},
		isGoogleSignIn() {
			return (
				this.$store.getters.errorMode === "googleSignIn"
			);
		},
		headerText() {
			if (this.$store.getters.loading === true) {
				return "Loading...";
			}
			if (this.$store.getters.isError === true) {
				return "Error!";
			}
			return "Information";
		},
		errorText() {
			return this.$store.state.errorText;
		},
		errorCode() {
			return this.$store.state.errorCode;
		}
	},
	methods: {
		reload() {
			location.reload();
		},
		onSignupWithGoogle() {
			db.signInWithGoogleAuthProvider().catch((error) => {
				alert(error);
			});
		}
	}
};
</script>

<style lang="stylus">
.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s;
}

.fade-enter-active {
  transition-delay: .1s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

@import './stylus/main.styl';
</style>