<template>
  <v-dialog v-model="isProcessing" max-width="180" persistent transition="fade-transition">
    <v-card>
      <v-layout row justify-center align-center>
        <v-card-title class="subheading text-xs-center">{{ processingMessage }}
          <v-progress-circular :size="20" indeterminate color="green" />
        </v-card-title>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
	name: "VProcessing",
	props: {
		"is-processing": {
			type: Boolean,
			default: false,
			required: true
		},
		"processing-message": {
			type: String,
			default: "Working...",
			required: false
		}
	}
};
</script>
