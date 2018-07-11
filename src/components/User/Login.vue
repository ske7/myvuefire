<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card class="blue-border-small" flat>
          <v-card-title primary-title class="headline justify-center">
            <div text-xs-center>Login</div>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form" lazy-validation @submit.prevent="onLogin">
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      id="email"
                      v-model="email"
                      :rules="[() => email.length > 0 || 'This field is required']"
                      name="email"
                      label="Email"
                      required
                      type="email"/>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      id="password"
                      v-model="password"
                      :rules="[() => password.length > 0 || 'This field is required']"
                      name="password"
                      label="Password"
                      required
                      type="password"/>
                  </v-flex>
                </v-layout>
                <v-layout row justify-center align-center>
                  <v-flex xs12 text-xs-center>
                    <v-btn :disabled="loading" :loading="loading" type="submit" small color="orange accent-1" light>
                      <div text-xs-center>LOG IN</div>
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-form>
              <template v-if="useGoogleProvider || useFacebookProvider || useGitHubProvider || useTwitterProvider">
                <v-layout row>
                  <v-flex xs12 text-xs-center mt-1 mb-1 body-2>
                    or
                  </v-flex>
                </v-layout>
                <v-layout row justify-center align-center>
                  <v-flex text-xs-center>
                    <v-btn
                      v-if="useGoogleProvider"
                      small
                      color="red"
                      dark
                      round
                      @click="onSignupWithGoogle">
                      <i class="fa fa-google-plus"/>
                      <span class="ml-1">Sign in with Google</span>
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                    <v-btn
                      v-if="useFacebookProvider"
                      small
                      color="blue darken-4"
                      dark
                      round
                      @click="onSignupWithFacebook">
                      <i class="fa fa-facebook-f"/>
                      <span class="ml-1">Sign in with Facebook</span>
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                    <v-btn
                      v-if="useGitHubProvider"
                      small
                      color="grey darken-4"
                      dark
                      round
                      @click="onSignupWithGithub">
                      <i class="fa fa-github"/>
                      <span class="ml-1">Sign in with Github</span>
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                    <v-btn
                      v-if="useTwitterProvider"
                      small
                      color="blue lighten-1"
                      dark
                      round
                      @click="onSignupWithTwitter">
                      <i class="fa fa-twitter"/>
                      <span class="ml-1">Sign in with Twitter</span>
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </template>
              <v-layout row>
                <v-flex xs12 text-xs-center mt-2>
                  <router-link to="/reset">Forgot your password?</router-link>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 text-xs-center mt-2>
                  Don't have an account?
                  <router-link to="/signup"> Sign up</router-link>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-if="error" row>
      <v-flex xs12 sm6 offset-sm3>
        <app-alert :text="error.message" @dismissed="onDismissed" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import db from "@/dbfunc/db";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  computed: {
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    },
    useGoogleProvider() {
      return this.$store.getters.useGoogleProvider;
    },
    useFacebookProvider() {
      return this.$store.getters.useFacebookProvider;
    },
    useTwitterProvider() {
      return this.$store.getters.useTwitterProvider;
    },
    useGitHubProvider() {
      return this.$store.getters.useGitHubProvider;
    }
  },
  created() {
    this.$store.dispatch("clearError");
  },
  methods: {
    onLogin() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("logUserIn", {
          email: this.email,
          password: this.password
        }).then((emailVerified) => {
          if (!emailVerified) {
            this.$router.push("/profile");
          } else {
            this.$router.push("/");
          }
        }).catch((error) => {
          this.$store.dispatch("logout").then(() => {
            this.$store.commit("setLoading", false);
            this.$store.commit("setError", error);
          });
        });
      }
    },
    onSignupWithGoogle() {
      db.signInWithGoogleAuthProvider().catch((error) => {
        this.$store.commit("setError", error);
      });
    },
    onSignupWithFacebook() {
      db.signInWithFacebookAuthProvider().catch((error) => {
        this.$store.commit("setError", error);
      });
    },
    onSignupWithGithub() {
      db.signInWithGithubAuthProvider().catch((error) => {
        this.$store.commit("setError", error);
      });
    },
    onSignupWithTwitter() {
      db.signInWithTwitterAuthProvider().catch((error) => {
        this.$store.commit("setError", error);
      });
    },
    onDismissed() {
      this.$store.dispatch("clearError");
    }
  }
};
</script>
