<template>
  <v-dialog v-model="toggle" max-width="280" persistent transition="fade-transition">
    <v-card>
      <v-layout row justify-center align-center>
        <v-card-title class="subheading text-xs-center">{{ question }}</v-card-title>
      </v-layout>
      <v-layout row justify-center align-center>
        <v-flex text-xs-center mb-2>
          <v-btn id="yesBtn" ref="yesBtn" small color="green darken-5" outline @click.native="onAccept()">Yes</v-btn>
          <v-btn id="cancelBtn" ref="cancelBtn" small color="green darken-5" outline @click.native="onCancel()">Cancel</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
	name: "YesCancelDialog",
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
