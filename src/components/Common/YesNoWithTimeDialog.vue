<template>
  <v-dialog v-model="toggle" max-width="280" persistent transition="fade-transition">
    <v-card>
      <v-layout row justify-center align-center>
        <v-card-title class="subheading text-xs-center">{{ question }}</v-card-title>
      </v-layout>
      <v-layout row justify-center align-center>
        <v-flex text-xs-center mb-2>
          <v-btn id="yesBtn" ref="yesBtn" :disabled="yesDisable" small color="green darken-5" outline @click.native="onAccept()">Yes {{ showCounter }}</v-btn>
          <v-btn id="cancelBtn" ref="cancelBtn" small color="green darken-5" outline @click.native="onCancel()">No</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "YesNoWithTimeDialog",
  props: {
    question: {
      type: String,
      default: "",
      required: true
    },
    toggle: {
      type: Boolean,
      default: false,
      required: true
    },
    initcounter: {
      type: Number,
      default: 5,
      required: false
    }
  },
  data() {
    return {
      tm: null,
      interval: null,
      counter: this.initcounter,
      disabled: true
    };
  },
  computed: {
    yesDisable() {
      return this.disabled;
    },
    showCounter() {
      if (this.counter > 0) {
        return `: ${this.counter}`;
      } else {
        clearTimeout(this.tm);
        clearInterval(this.interval);
        return "";
      }
    }
  },
  watch: {
    "toggle": function() {
      if (this.toggle) {
        this.counter = this.initcounter;
        this.disabled = true;
        this.$nextTick(function() {
          this.$refs.cancelBtn.$el.focus();
        });
        this.interval = window.setInterval(() => {
          this.counter = this.counter - 1;
        }, 1000);
        this.tm = setTimeout(() => {
          this.disabled = false;
        }, this.initcounter * 1000);
      } else {
        this.$nextTick(function() {
          clearTimeout(this.tm);
          clearInterval(this.interval);
        });
      }
    }
  },
  methods: {
    onCancel() {
      this.$emit("cancel-dialog");
    },
    onAccept() {
      this.$emit("accept-question");
    }
  }
};
</script>
