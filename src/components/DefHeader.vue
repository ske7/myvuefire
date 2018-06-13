<template>
  <v-toolbar color="indigo" dark fixed app clipped-left dense>
    <v-toolbar-items color="indigo" dark>
      <v-btn
        color="indigo"
        dark
        flat
        style="min-width:48px; max-width:96px;">
        <img :src="'/static/img/favicon.png'">
      </v-btn>
    </v-toolbar-items>
    <v-toolbar-title>
      <div class="hidden-xs-only">VueFire CRM</div>
      <div class="hidden-sm-and-up subheading">VueFire CRM</div>
    </v-toolbar-title>
    <v-spacer/>
    <v-btn
      v-show="false"
      small
      color="green darken-1"
      class="text-xs-center"
      style="min-width:32px;"
      dark>
      <i class="fa fa-sign-in"/>
      <span class="ml-2 hidden-xs-only">Login</span>
    </v-btn>
    <v-btn
      v-show="false"
      small
      color="primary"
      class="text-xs-center"
      style="min-width:32px;"
      dark>
      <i class="fa fa-thumbs-up"/>
      <span class="ml-2 hidden-xs-only">Sign up</span>
    </v-btn>
  </v-toolbar>
</template>

<script>
export default {
  name: "DefHeader"
};
</script>
