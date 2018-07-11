<template>
  <v-content>
    <v-spacer/>
  </v-content>
</template>

<script>
export default {
  name: "AdditionalConfigTab",
  data() {
    return {
      needToSave: false
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
  },
  methods: {
    onDismissed() {
      this.$store.dispatch("clearError");
    },
    onSaveSettings() {
      this.needToSave = true;
    }
  }
};
</script>
