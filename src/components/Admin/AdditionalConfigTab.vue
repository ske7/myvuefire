<template>
  <v-card flat color="transparent">
    <v-container fluid px-3>
      <v-flex xs6 text-xs-left>
        <v-card-text>Namings</v-card-text>
        <v-text-field
          id="appheader"
          v-model="appheader"
          name="appheader"
          label="Application name"
          placeholder="VueFire CRM"
          @input="onChange()"/>
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
  name: "AdditionalConfigTab",
  data() {
    return {
      needToSave: false,
      appheader: "",
      oldappheader: ""
    };
  },
  computed: {
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    },
    appNameText() {
      return this.$store.getters.appNameText;
    }
  },
  created() {
    this.$store.dispatch("clearError");
    this.needToSave = false;
    this.appheader = this.appNameText;
    this.oldappheader = this.appNameText;
  },
  methods: {
    onChange() {
      if (this.oldappheader === this.appheader) {
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
      db.firestore.collection("config").doc("configDoc")
        .set({
          appNameText: this.appheader
        }, { merge: true })
        .then(() => {
          this.oldappheader = this.appheader;
          this.$store.commit("setLoading", false);
          this.needToSave = false;
        })
        .catch((error) => {
          this.$store.commit("setLoading", false);
          this.$store.commit("setError", error);
        });
    }
  }
};
</script>
