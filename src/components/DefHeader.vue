<template>
  <v-toolbar color="indigo" dark fixed app clipped-left dense>
    <v-toolbar-items color="indigo" dark>
      <v-btn
        color="indigo"
        dark
        flat
        style="min-width:24px; max-width:24px;">
        <img :src="'/static/img/favicon.png'">
      </v-btn>
    </v-toolbar-items>
    <v-toolbar-title v-show="$vuetify.breakpoint.width > 320">
      <div class="hidden-xs-only">{{ appNameText }}</div>
      <div class="hidden-sm-and-up subheading">{{ appNameText }}</div>
    </v-toolbar-title>
    <v-spacer/>
  </v-toolbar>
</template>

<script>
export default {
  name: "DefHeader",
  computed: {
    appNameText() {
      return "VueFire CRM";
    }
  }
};
</script>
