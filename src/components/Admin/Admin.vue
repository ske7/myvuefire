<template>
  <v-container>
    <v-navigation-drawer
      :mini-variant="mini"
      v-model="drawer"
      clipped
      app
      permanent
      hide-overlay
      mini-variant-width="80"
      absolute>
      <v-list class="pt-0" dense>
        <v-flex fluid>
          <v-list-tile v-for="item in items" :key="item.id" :class="{selected : selectedid === item.id}" @click="chooseAdminPage(item.id)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-flex>
      </v-list>
    </v-navigation-drawer>
    <v-layout row wrap justify-center align-center>
      <v-flex text-xs-center xs12>
        <component :is="currentItemComponent">
          <h1 slot="title">{{ title }}</h1>
        </component>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import db from "@/dbfunc/db";

export default {
  name: "Admin",
  components: {
    Config: () => import("./Config.vue"),
    Users: () => import("./Users.vue")
  },
  data() {
    return {
      drawer: true,
      mini: true,
      selectedid: 0,
      currentItemComponent: "Config",
      items: [
        { id: 0, title: "Config", icon: "build" },
        { id: 1, title: "Users", icon: "group" }
      ],
      title: "Admin panel!"
    };
  },
  created() {
    this.$store.dispatch("clearError");
    const currentUser = db.auth.currentUser;
    if (currentUser) {
      if (!currentUser.emailVerified) {
        this.$router.push("/profile");
      }
    }
    this.chooseAdminPage(this.selectedid);
  },
  methods: {
    chooseAdminPage(id) {
      this.selectedid = id;
      this.currentItemComponent = this.items[id].title;
      this.title = this.items[id].title;
    }
  }
};
</script>

<style scoped>
.selected {
	background-color:skyblue;
}
</style>
