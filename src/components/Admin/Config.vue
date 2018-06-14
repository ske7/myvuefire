<template>
  <div>
    <v-layout row>
      <v-flex text-xs-center>
        <slot name="title" />
      </v-flex>
    </v-layout>
  </div>
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
