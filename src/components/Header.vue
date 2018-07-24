<template>
  <v-toolbar color="indigo" dark fixed app clipped-left dense>
    <v-toolbar-side-icon
      v-show="$vuetify.breakpoint.smAndDown && needToShowSideIcon"
      @click="$store.commit('adminDrawerToggle')"/>
    <v-toolbar-items color="indigo" dark>
      <v-tooltip :disabled="$vuetify.breakpoint.width > 320" right open-delay="600">
        <v-btn
          slot="activator"
          color="indigo"
          dark
          flat
          style="min-width:24px; max-width:24px;"
          to="/">
          <img :src="'/static/img/favicon.png'">
        </v-btn>
        <span>{{ appNameText }}</span>
      </v-tooltip>
    </v-toolbar-items>
    <v-toolbar-title v-show="$vuetify.breakpoint.width > 320">
      <div class="hidden-xs-only">{{ appNameText }}</div>
      <div class="hidden-sm-and-up subheading">{{ appNameText }}</div>
    </v-toolbar-title>
    <v-spacer/>
    <v-tooltip :disabled="!$vuetify.breakpoint.xs" bottom open-delay="600">
      <v-btn
        v-if="!userIsAuthenticated"
        slot="activator"
        :to="'/login'"
        small
        color="green darken-1"
        class="text-xs-center"
        style="min-width:32px;"
        dark>
        <i class="fa fa-sign-in"/>
        <span class="ml-2 hidden-xs-only">Log in</span>
      </v-btn>
      <span>Log in</span>
    </v-tooltip>
    <v-tooltip :disabled="!$vuetify.breakpoint.xs" bottom open-delay="600">
      <v-btn
        v-if="!userIsAuthenticated"
        slot="activator"
        :to="'/signup'"
        small
        color="primary"
        class="text-xs-center"
        style="min-width:32px;"
        dark>
        <i class="fa fa-thumbs-up"/>
        <span class="ml-2 hidden-xs-only">Sign up</span>
      </v-btn>
      <span>Sign up</span>
    </v-tooltip>
    <v-tooltip :disabled="!$vuetify.breakpoint.xs" bottom open-delay="600">
      <v-btn
        v-if="userIsAuthenticated"
        slot="activator"
        :to="'/profile'"
        small
        color="primary"
        class="text-xs-center"
        style="min-width:32px;"
        dark>
        <i class="fa fa-user"/>
        <span class="ml-2 hidden-xs-only">Profile</span>
      </v-btn>
      <span>Profile</span>
    </v-tooltip>
    <v-tooltip :disabled="!$vuetify.breakpoint.xs" bottom open-delay="600">
      <v-btn
        v-if="userIsAdmin"
        slot="activator"
        :to="'/admin'"
        small
        color="red darken-4"
        class="text-xs-center"
        style="min-width:32px;"
        dark>
        <i class="fa fa-key"/>
        <span class="ml-2 hidden-xs-only">Admin</span>
      </v-btn>
      <span>Admin</span>
    </v-tooltip>
    <v-tooltip :disabled="!$vuetify.breakpoint.xs" bottom open-delay="600">
      <v-btn
        v-if="userIsAuthenticated"
        slot="activator"
        small
        color="primary"
        class="text-xs-center"
        style="min-width:32px;"
        dark
        @click="onTryToLogout()">
        <i class="fa fa-sign-out"/>
        <span class="ml-2 hidden-xs-only">Log out</span>
      </v-btn>
      <span>Log out</span>
    </v-tooltip>
    <p/>
    <keep-alive>
      <app-yescanceldlg
        :toggle="logoutdialog"
        question="Do you really want to log out?"
        @cancel-dialog="logoutdialog = false"
        @accept-question="onLogout()"/>
    </keep-alive>
  </v-toolbar>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      logoutdialog: false
    };
  },
  computed: {
    needToShowSideIcon() {
      return this.$route.name === "Admin";
    },
    appNameText() {
      return this.$store.getters.appNameText || "VueFire CRM";
    },
    userIsAuthenticated() {
      return (
        this.$store.getters.user !== null &&
				this.$store.getters.user !== undefined
      );
    },
    userIsAdmin() {
      return (
        this.$store.getters.user !== null &&
				this.$store.getters.user !== undefined &&
				this.$store.getters.isadminemail === true
      );
    }
  },
  methods: {
    onTryToLogout() {
      this.logoutdialog = true;
    },
    onLogout() {
      this.logoutdialog = false;
      this.$store.dispatch("logout").then(
        () => {
          this.$router.push("/");
        }
      );
    }
  }
};
</script>
