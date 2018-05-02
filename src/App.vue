<template>
  <v-app id="app" light>
    <app-header app/>
    <v-jumbotron
      color="light-green lighten-2"
      gradient="45deg, #F1F8E9, #FFF8E9"
      height="100%">
      <v-content>
        <v-container fluid>
          <transition name="fade" mode="out-in">
            <router-view/>
          </transition>
        </v-container>
      </v-content>
    </v-jumbotron>
    <app-footer app/>
  </v-app>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";

export default {
	name: "App",
	components: {
		appHeader: Header,
		appFooter: Footer
	}
};
</script>

<style lang="stylus">
.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s;
}

.fade-enter-active {
  transition-delay: .1s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

@import './stylus/main.styl';
</style>
