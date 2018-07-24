<template>
  <v-container>
    <v-layout row wrap class="page blue-border">
      <v-flex text-xs-center>
        <h1 class="display-1">{{ welcomeMessage }}</h1>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-dialog v-model="isNotVerified" max-width="280" persistent transition="fade-transition">
        <v-card>
          <v-layout row justify-center align-center>
            <v-card-title class="subheading text-xs-center">You have to get verification before proceed to work!</v-card-title>
          </v-layout>
          <v-layout row justify-center align-center>
            <v-flex text-xs-center mb-2>
              <v-btn small color="green darken-5" outline @click.native="onVerificationAgreed()">OK</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Page",
  data() {
    return {
      isNotVerified: false
    };
  },
  computed: {
    welcomeMessage() {
      const name = this.$store.getters.appNameText || "VueFire CRM";
      return `Welcome to Your ${name}!`;
    }
  },
  created() {
    this.$store.dispatch("clearError");
    this.isNotVerified = !this.$store.getters.isUserVerified;
  },
  methods: {
    onVerificationAgreed() {
      this.$router.push("/profile");
    }
  }
};
</script>

<style scoped>
.page {
	height: auto;
}
</style>
