<template>
  <div>
    <v-layout row>
      <v-flex text-xs-center>
        <slot name="title" />
      </v-flex>
    </v-layout>
    <v-data-table :headers="headers"
                  :items="items"
                  :loading="dataloading"
                  :rows-per-page-items="[5, 10, 20]"
                  :pagination.sync="pagination"
                  :custom-sort="customSort"
                  class="elevation-1 mt-1">
      <template slot="headerCell" slot-scope="props">
        <span>
          {{ props.header.text }}
        </span>
      </template>
      <v-progress-linear slot="progress" :indeterminate="dataloading" color="blue" />
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">{{ props.item.email }}</td>
        <td class="text-xs-left">{{ props.item.displayName }}</td>
        <td class="text-xs-center">{{ props.item.creationTime | formatDate }}</td>
        <td class="text-xs-center">{{ props.item.lastSignInTime | formatDate }}</td>
        <td class="text-xs-center">{{ props.item.providerId }}</td>
        <td class="text-xs-center">{{ props.item.isAdmin }}</td>
        <td class="text-xs-center">{{ props.item.emailVerified }}</td>
        <td class="text-xs-center">{{ props.item.disabled }}</td>
        <td class="text-xs-center justify-center layout px-0">
          <v-container justify-center align-center>
            <v-layout row>
              <v-tooltip top>
                <v-btn slot="activator" icon class="mx-0" @click="lockUser(props.item)">
                  <v-icon color="yellow darken-1">{{ props.item.disabled === "yes" ? "lock" : "lock_open" }}</v-icon>
                </v-btn>
                <span>{{ props.item.disabled === "yes" ? "Unlock user" : "Lock user" }}</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn slot="activator" icon class="mx-0" @click="onTryToDeleteUserProfile(props.item)">
                  <v-icon color="pink">delete</v-icon>
                </v-btn>
                <span>Delete user profile</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn slot="activator" icon class="mx-0" @click="onShowUserLogins(props.item)">
                  <v-icon color="blue">book</v-icon>
                </v-btn>
                <span>Show users logins</span>
              </v-tooltip>
            </v-layout>
          </v-container>
        </td>
      </template>
    </v-data-table>
    <app-processing :is-processing="isProcessing" />
    <keep-alive>
      <app-yescanceldlg
        :toggle="deleteprofiledialog"
        question="Do you really want to delete user profile?"
        @cancel-dialog="deleteprofiledialog = false"
        @accept-question="deleteUserProfile()" />
    </keep-alive>
    <app-alertpop :toggle="!!error || !!info" :error="error" :info="info" @dismissed="onDismissed()"/>
    <v-dialog v-model="showUserLogins" persistent full-width hide-overlay scrollable fullscreen transition="slide-y-transition">
      <v-container fill-height fluid>
        <v-layout row wrap justify-center align-center>
          <v-card class="blue-border-small" flat>
            <v-layout row justify-center align-center>
              <v-card-title primary-title class="headline blue--text text--darken-4 justify-center">
                User logins
              </v-card-title>
            </v-layout>
            <v-layout row wrap justify-center align-center ml-3 mr-3 mb-3>
              <v-flex xs12>
                <app-user-logins :uid="propsItem ? propsItem.uid : ''"/>
              </v-flex>
            </v-layout>
            <v-layout row justify-center align-center>
              <v-flex text-xs-center mb-3>
                <v-btn small color="green darken-5" outline @click.native="showUserLogins = false">Close</v-btn>
              </v-flex>
            </v-layout>
          </v-card>
        </v-layout>
      </v-container>
    </v-dialog>
  </div>
</template>

<script>
import db from "@/dbfunc/db";
import mixins from "@/helpers/mixins";

export default {
  name: "Users",
  components: {
    appUserLogins: () => import("./UserLogins.vue")
  },
  mixins: [mixins.dataTableMixin],
  data() {
    return {
      dataloading: true,
      isProcessing: false,
      deleteprofiledialog: false,
      showUserLogins: false,
      propsItem: null,
      pagination: {
        sortBy: "creationTime",
        descending: true,
        rowsPerPage: 10
      },
      headers: [
        { text: "Email", value: "email", align: "left" },
        { text: "User name", align: "left", value: "displayName" },
        { text: "Created", value: "creationTime", align: "center" },
        { text: "Signed In", value: "lastSignInTime", align: "center" },
        { text: "Provider", value: "providerId", align: "center" },
        { text: "Admin", value: "isAdmin", align: "center" },
        { text: "Verified", value: "emailVerified", align: "center" },
        { text: "Locked", value: "disabled", align: "center" },
        { text: "Actions", value: "name", align: "center", sortable: false }
      ],
      items: [],
      dateColumns: ["creationTime", "lastSignInTime"]
    };
  },
  computed: {
    error() {
      return this.$store.getters.error;
    },
    info() {
      return this.$store.getters.info;
    }
  },
  created() {
    this.$store.dispatch("clearError");
    this.dataloading = true;
    let arr = [];
    const getUsers = db.firefunctions.httpsCallable("getUsers");

    getUsers().then((result) => {
      result.data.users.forEach((user) => {
        arr = user;
        const arr2 = {};
        Object.keys(arr).forEach((key) => {
          const value = arr[key];

          if (key === "email" ||
              key === "displayName" ||
              key === "uid" ||
              key === "disabled" ||
              key === "emailVerified") {
            arr2[key] = value;
            if (value === true) {
              arr2[key] = "yes";
            }
            if (value === false) {
              arr2[key] = "-";
            }
          }

          if (key === "metadata") {
            arr2["creationTime"] = value["creationTime"];
            arr2["lastSignInTime"] = value["lastSignInTime"];
          }
          if (key === "providerData") {
            const arr3 = [];
            for (const [key] in value) {
              arr3.push(value[key].providerId);
            }
            arr2["providerId"] = arr3.join(", ");
          }

          if (key === "email") {
            if (this.$store.state.confData.adminemail === value) {
              arr2["isAdmin"] = "yes";
            } else {
              arr2["isAdmin"] = "-";
            }
          }
        });
        this.items.push(arr2);
      });
      this.dataloading = false;
    }).catch((error) => {
      this.dataloading = false;
      this.$store.commit("setError", error);
    });
  },
  methods: {
    lockUser(editedItem) {
      if (editedItem.isAdmin === "yes") {
        this.$store.commit("setInfo", "Cannot disable user with admin rights");
        return;
      }
      this.isProcessing = true;
      const isDisable = (editedItem.disabled !== "yes");
      const editedIndex = this.items.indexOf(editedItem);
      const item = editedItem;
      const lockUser = db.firefunctions.httpsCallable("modifyLockOfUser");
      lockUser({ uid: editedItem.uid, disabled: isDisable }).then((result) => {
        db.updateUserDisable(editedItem.uid, isDisable).then(() => {
          item.disabled = isDisable ? "yes" : "-";
          Object.assign(this.items[editedIndex], item);
          this.isProcessing = false;
        });
      }).catch((error) => {
        this.isProcessing = false;
        this.$store.commit("setError", error);
      });
    },
    onDismissed() {
      this.$store.dispatch("clearError");
      this.$store.dispatch("clearInfo");
    },
    onTryToDeleteUserProfile(propsItem) {
      if (propsItem.isAdmin === "yes") {
        this.$store.commit("setInfo", "Cannot delete user with admin rights");
        return;
      }
      this.deleteprofiledialog = true;
      this.propsItem = propsItem;
    },
    deleteUserProfile() {
      const deleteditem = this.propsItem;
      this.propsItem = null;
      this.deleteprofiledialog = false;
      this.isProcessing = true;
      const editedIndex = this.items.indexOf(deleteditem);

      const deleteUserProfile = db.firefunctions.httpsCallable("deleteUserProfile");
      deleteUserProfile({ uid: deleteditem.uid }).then((result) => {
        this.items.splice(editedIndex, 1);
        this.isProcessing = false;
      }).catch((error) => {
        this.isProcessing = false;
        this.$store.commit("setError", error);
      });
    },
    onShowUserLogins(propsItem) {
      this.propsItem = propsItem;
      this.showUserLogins = true;
    }
  }
};
</script>
