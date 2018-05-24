<template>
  <v-alert :value="true" outline type="error" dismissible @input="onClose">
    {{ code ? code + ': ' : '' }}{{ text }}
  </v-alert>
</template>

<script>
export default {
	name: "AlertCommon",
	props: {
		text: {
			type: String,
			default: "",
			required: true
		},
		code: {
			type: String,
			default: "",
			required: false
		}
	},
	methods: {
		onClose() {
			this.$emit("dismissed");
		}
	}
};
</script>
