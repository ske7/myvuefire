<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card class="blue-border-small" flat>
          <v-card-title primary-title class="headline justify-center">
            <div text-xs-center>Sign up with Email</div>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form" lazy-validation @submit.prevent="onSignup">
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      v-validate="'email'"
                      id="email"
                      :error-messages="errors.collect('email')"
                      v-model="email"
                      :rules="[() => email.length > 0 || 'This field is required']"
                      name="email"
                      label="Email"
                      required
                      type="email"/>
                  </v-flex>
                </v-layout>
                <!--                   <v-layout row>
                    <v-flex xs12>
                      <v-text-field
                        id="displayName"
                        v-model="displayName"
                        name="displayName"
                        label="User displayed name (optional)"
                        type="text"/>
                    </v-flex>
                  </v-layout> -->
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      id="password"
                      v-model="password"
                      :rules="[() => !!password || 'This field is required',
                               () => !!password && password.length > 5 || 'Password should be at least 6 characters']"
                      name="password"
                      label="Password"
                      required
                      type="password"/>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      id="confirmPassword"
                      :rules="[comparePasswords]"
                      v-model="confirmPassword"
                      name="confirmPassword"
                      label="Confirm password"
                      type="password"/>
                  </v-flex>
                </v-layout>
                <v-layout row justify-center align-center>
                  <v-flex xs12 text-xs-center>
                    <v-btn :disabled="signUpProcess" :loading="signUpProcess" type="submit" small color="orange accent-1" light>
                      Sign up
                      <span slot="loader" class="custom-loader">
                        <v-icon dark>cached</v-icon>
                      </span>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-form>
              <v-layout row>
                <v-flex xs12 text-xs-center mt-3>
                  Already have an account?
                  <router-link to="/login"> Sign in</router-link>
                </v-flex>
              </v-layout>
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
	name: "Signup",
	data() {
		return {
			email: "",
			displayName: "",
			password: "",
			confirmPassword: ""
		};
	},
	computed: {
		comparePasswords() {
			if (!this.password) {
				return true;
			}
			if (this.password === this.confirmPassword) {
				return true;
			}
			return "Passwords do not match";
		},
		error() {
			return this.$store.getters.error;
		},
		signUpProcess() {
			return this.$store.getters.signUpProcess;
		}
	},
	created() {
		this.$store.dispatch("clearError");
	},
	methods: {
		validateBeforeSubmit() {
			return this.$validator.validateAll().then((result) => {
				return result;
			});
		},
		onSignup() {
			this.validateBeforeSubmit().then((validateResult) => {
				if (!validateResult) return;
				if (this.$refs.form.validate()) {
					this.$store.dispatch("signUserUp", {
						email: this.email,
						password: this.password,
						displayName: this.displayName
					}).then((newUser) => {
						this.$store.commit("setUser", newUser);
						this.$store.commit("setSignUpProcess", false);
						this.$router.push("/profile");
					}).catch((error) => {
						this.$store.commit("setUser", null);
						this.$store.commit("setSignUpProcess", false);
						this.$store.commit("setError", error);
					});
				}
			});
		},
		onDismissed() {
			this.$store.dispatch("clearError");
		}
	}
};
</script>

<style scoped>
	.btn {
		min-height: 10px;
		min-width: 10px;
	}
</style>
