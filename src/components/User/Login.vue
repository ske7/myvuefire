<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card class="blue-border-small" flat>
          <v-card-title primary-title class="headline justify-center">
            <div text-xs-center>Log in to your account</div>
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
                    <v-btn :disabled="loading" :loading="loading" type="submit">
                      Log in
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                  </v-flex>
                </v-layout>
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
              </v-form>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-if="error" row>
      <v-flex xs12 sm6 offset-sm3>
        <app-alert :text="error.message" @dismissed="onDismissed"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
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
		onDismissed() {
			this.$store.dispatch("clearError");
		}
	}
};
</script>
