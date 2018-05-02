<template>
  <v-footer height="auto" class="blue-grey darken-2 white--text text-xs-center" app fixed>
    <v-layout row wrap align-center>
      <v-flex xs12>
        <div class="white--text footertextclass">
          <span>&copy; {{ footerText }}</span>
        </div>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
export default {
	name: "Footer",
	data() {
		return {
			startYear: 2017,
			copyrightText: "SKE777 LTD"
		};
	},
	computed: {
		footerText() {
			var currYear = new Date().getFullYear();
			var years = currYear.toString();
			if (this.startYear !== currYear) {
				years = this.startYear.toString() + " - " + years;
			}
			return years + ", " + this.copyrightText;
		}
	}
};
</script>

<style scoped>
.footertextclass {
  font-size: 12px;
}
</style>
