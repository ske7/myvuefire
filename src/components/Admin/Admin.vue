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
      <v-toolbar flat color="green lighten-5" class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <v-icon>domain</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>Admin dashboard</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon @click.native.stop="mini = !mini">
                <v-icon>chevron_left</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list class="pt-0" dense>
        <v-divider/>
        <v-flex fluid>
          <v-list-tile
            v-for="item in items"
            :key="item.id"
            @click="chooseAdminPage(item.id)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
      </v-flex></v-list>
    </v-navigation-drawer>
    <v-layout row wrap text-xs-center>
      <v-flex>
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
		"Config": () => import("./Config.vue"),
		"Users": () => import("./Users.vue")
	},
	data() {
		return {
			drawer: true,

			currentItemComponent: "Config",
			items: [
				{ id: 0, title: "Config", icon: "build" },
				{ id: 1, title: "Users", icon: "group" }
			],
			mini: true,
			title: "Admin panel!"
		};
	},
	created() {
		this.$store.dispatch("clearError");
		let currentUser = db.auth.currentUser;
		if (currentUser) {
			if (!currentUser.emailVerified) {
				this.$router.push("/profile");
			}
		}
	},
	methods: {
		chooseAdminPage(id) {
			this.currentItemComponent = this.items[id].title;
			this.title = this.items[id].title;
		}
	}
};
</script>

<style scoped>
.page {
	height: auto;
}
</style>
