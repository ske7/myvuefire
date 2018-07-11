<template>
  <div style="width: 100%; max-width: 100%;">
    <v-layout row justify-center align-content-center>
      <v-flex text-xs-center>
        <slot name="title" />
      </v-flex>
    </v-layout>
    <v-tabs
      v-model="tabs"
      left
      color="transparent"
      slider-color="blue darken-1">
      <v-tab v-for="item in items" :key="item">
        {{ item }}
      </v-tab>
    </v-tabs>
    <v-layout row justify-left align-left mt-2>
      <v-flex xs12 sm6 text-xs-left>
        <v-tabs-items v-model="tabs">
          <v-tab-item v-for="item in items" :key="item">
            <component :is="item"/>
          </v-tab-item>
        </v-tabs-items>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: "Config",
  components: {
    Authentication: () => import("./AuthConfigTab.vue"),
    Additional: () => import("./AdditionalConfigTab.vue")
  },
  data() {
    return {
      tabs: null,
      items: ["Authentication", "Additional"]
    };
  }
};
</script>
