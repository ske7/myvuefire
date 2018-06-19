<template>
  <v-dialog v-model="toggle" max-width="320" persistent transition="fade-transition">
    <v-card>
      <v-layout row justify-center align-center>
        <v-card-title class="subheading text-xs-center">
          <v-alert :value="true" :color="btnColor" :icon="icon" outline>{{ message }}</v-alert>
        </v-card-title>
      </v-layout>
      <v-layout row justify-center align-center>
        <v-flex text-xs-center mb-2>
          <v-btn id="OKBtn" ref="OKBtn" :color="btnColor" small outline @click.native="onDismissed()">OK</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AlertPopup",
  props: {
    error: {
      type: Error,
      default: null,
      required: false
    },
    info: {
      type: String,
      default: "",
      required: false
    },
    initmessage: {
      type: String,
      default: "",
      required: false
    },
    toggle: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      message: this.initmessage,
      btnColor: "",
      icon: null
    };
  },
  watch: {
    "toggle": function() {
      if (this.toggle) {
        if (this.error !== null && this.error.message !== "" & this.initmessage === "") {
          this.message = this.error.message;
          this.btnColor = "error";
          this.icon = "error";
        } else if (this.info !== "" & this.initmessage === "") {
          this.message = this.info;
          this.btnColor = "info";
          this.icon = "info";
        } else {
          this.message = this.initmessage;
          this.btnColor = "green darken-5";
          this.icon = null;
        }
      }
    }
  },
  methods: {
    onDismissed() {
      this.$emit("dismissed");
    }
  }
};
</script>
