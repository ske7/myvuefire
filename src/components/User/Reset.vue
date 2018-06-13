<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card class="blue-border-small" flat>
          <v-card-title primary-title class="headline justify-center">
            <div text-xs-center>Password reset</div>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form" lazy-validation @submit.prevent="onReset">
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
                <v-layout row justify-center align-center>
                  <v-flex xs12 text-xs-center>
                    <v-btn :disabled="loading || passwordResetEmailSent" :loading="loading" type="submit" small color="orange accent-1" light>
                      SEND
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-if="passwordResetEmailSent" row>
      <v-flex xs12 sm6 offset-sm3>
        <v-alert :value="true" color="blue" outline icon="check_circle">
          A message has been sent to you by email with instructions on how to reset your password!
        </v-alert>
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
  name: "Reset",
  data() {
    return {
      passwordResetEmailSent: false,
      email: ""
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
    onReset() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("passwordReset", { email: this.email }).then(
          () => {
            this.passwordResetEmailSent = true;
          }
        );
      }
    },
    onDismissed() {
      this.$store.dispatch("clearError");
    }
  }
};
</script>
