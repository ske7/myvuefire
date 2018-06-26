<template>
  <v-layout row wrap>
    <v-flex xs12 text-xs-center>
      <slot name="title" />
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: "Config",
  data() {
    return {
      //
    };
  }
};
</script>
