<template>
  <v-container fluid>
    <v-navigation-drawer
      :mini-variant="mini"
      :value="drawer"
      :stateless="$vuetify.breakpoint.mdAndDown"
      clipped
      app
      hide-overlay
      mini-variant-width="80">
      <v-list class="pt-0" dense>
        <v-flex fluid>
          <v-list-tile v-for="item in items" :key="item.id" :class="{selected : selectedid === item.id}" @click="chooseAdminPage(item.id)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.title }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-flex>
      </v-list>
    </v-navigation-drawer>
    <component :is="currentItemComponent">
      <div slot="title" class=" headline blue--text text--darken-4">{{ title }}</div>
    </component>
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
  computed: {
    drawer() {
      return this.$store.state.adminDrawer || !this.$vuetify.breakpoint.mdAndDown;
    }
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
