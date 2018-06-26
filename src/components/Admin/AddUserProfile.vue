<template>
  <v-dialog v-model="showAddUserProfile" persistent max-width="500px" transition="slide-y-transition">
    <v-layout row>
      <v-flex xs12>
        <v-card class="blue-border-small" flat>
          <v-card-title primary-title class="headline blue--text text--darken-4 justify-center">
            Add user profile
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form" lazy-validation @submit.prevent="onAdd">
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
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      id="displayName"
                      v-model="displayName"
                      name="displayName"
                      label="User name (optional)"
                      type="text"/>
                  </v-flex>
                </v-layout>
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
                      type="text"/>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-card-text>
          <v-layout row justify-center align-center>
            <v-flex text-xs-center mb-3>
              <v-btn small color="green darken-5" outline @click.native="onAdd()">Add</v-btn>
              <v-btn small color="green darken-5" outline @click.native="onCloseForm()">Cancel</v-btn>
            </v-flex>
          </v-layout>
          <v-layout v-if="errorDialog" row pr-1 pl-1>
            <v-flex xs12>
              <app-alert :text="errorDialog.message" @dismissed="onDismissed" />
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <app-processing :is-processing="isProcessing" />
  </v-dialog>
</template>

<script>
import db from "@/dbfunc/db";

export default {
  name: "AddUserProfile",
  props: {
    showAddUserProfile: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      email: "",
      displayName: "",
      password: "",
      isProcessing: false
    };
  },
  computed: {
    errorDialog() {
      if (this.showAddUserProfile) {
        return this.$store.getters.errorDialog;
      }
    }
  },
  watch: {
    "showAddUserProfile": function() {
      this.$store.dispatch("clearErrorDialog");
    }
  },
  created() {
    this.$store.dispatch("clearErrorDialog");
  },
  methods: {
    validateBeforeSubmit() {
      return this.$validator.validateAll().then((result) => {
        return result;
      });
    },
    onDismissed() {
      this.$store.dispatch("clearErrorDialog");
    },
    onCloseForm() {
      this.$refs.form.reset();
      this.email = "";
      this.displayName = "";
      this.password = "";
      this.$emit("closeform");
    },
    onAdd() {
      this.validateBeforeSubmit().then((validateResult) => {
        if (!validateResult) return;
        if (this.$refs.form.validate()) {
          this.isProcessing = true;
          const createUser = db.firefunctions.httpsCallable("createUser");
          createUser({ email: this.email, password: this.password, displayName: this.displayName }).then((result) => {
            const user = result.data.user;
            db.addUser(
              user,
              false,
              "password",
              true
            ).then(() => {
              this.isProcessing = false;
              this.$emit("save", user);
            });
          }).catch((error) => {
            this.isProcessing = false;
            this.$store.commit("setErrorDialog", error);
          });
        }
      });
    }
  }
};
</script>
