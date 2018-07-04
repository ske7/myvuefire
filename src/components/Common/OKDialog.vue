<template>
  <v-dialog v-model="toggle" max-width="280" persistent transition="fade-transition">
    <v-card>
      <v-layout row justify-center align-center>
        <v-card-title class="subheading text-xs-center">{{ message }}</v-card-title>
      </v-layout>
      <v-layout row justify-center align-center>
        <v-flex text-xs-center mb-2>
          <v-btn id="OkBtn" ref="OkBtn" small color="green darken-5" outline @click.native="onAccept()">OK</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "OKDialog",
  props: {
    message: {
      type: String,
      default: "",
      required: true
    },
    toggle: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  methods: {
    onAccept() {
      this.$emit("accept-message");
    }
  }
};
</script>
