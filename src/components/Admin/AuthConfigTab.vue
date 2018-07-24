<template>
  <v-card flat color="transparent">
    <v-container fluid px-3>
      <v-flex xs6 text-xs-left>
        <v-card-text>Enable OAuth providers</v-card-text>
        <v-checkbox v-model="authmodes" label="Google" value="Google" @change="onChange()"/>
        <v-checkbox v-model="authmodes" label="Facebook" value="Facebook" @change="onChange()"/>
        <v-checkbox v-model="authmodes" label="Twitter" value="Twitter" @change="onChange()"/>
        <v-checkbox v-model="authmodes" label="GitHub" value="GitHub" @change="onChange()"/>
      </v-flex>
      <v-layout row justify-center align-center mb-2>
        <v-flex xs12 text-xs-left>
          <v-btn
            :disabled="loading || !needToSave"
            :loading="loading"
            style="max-width:150px;"
            type="submit"
            small
            color="orange accent-1"
            light
            @click.native="onSaveSettings()">
            Save settings
            <span slot="loader" class="custom-loader">
              <v-icon light>cached</v-icon>
            </span>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
    <app-alertpop :toggle="!!error" :error="error" @dismissed="onDismissed()"/>
  </v-card>
</template>

<script>
import db from "@/dbfunc/db";

export default {
  name: "AuthConfigTab",
  data() {
    return {
      tabs: null,
      needToSave: false,
      oldauthmodes: [],
      authmodes: []
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
    this.needToSave = false;
    if (this.$store.getters.useGoogleProvider === true) {
      this.authmodes.push("Google");
    }
    if (this.$store.getters.useFacebookProvider === true) {
      this.authmodes.push("Facebook");
    }
    if (this.$store.getters.useTwitterProvider === true) {
      this.authmodes.push("Twitter");
    }
    if (this.$store.getters.useGitHubProvider === true) {
      this.authmodes.push("GitHub");
    }
    this.oldauthmodes = this.authmodes;
  },
  methods: {
    onChange() {
      if (this.oldauthmodes.sort().join(",") === this.authmodes.sort().join(",")) {
        this.needToSave = false;
        return;
      }
      this.needToSave = true;
    },
    onDismissed() {
      this.$store.dispatch("clearError");
    },
    onSaveSettings() {
      this.$store.commit("setLoading", true);
      db.saveAuthModesToConfig(this.authmodes).then(() => {
        this.oldauthmodes = this.authmodes;
        this.$store.commit("setLoading", false);
        this.needToSave = false;
      }).catch((error) => {
        this.$store.commit("setLoading", false);
        this.$store.commit("setError", error);
      });
    }
  }
};
</script>
