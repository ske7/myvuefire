<template>
  <v-dialog v-model="showUserLogins" persistent full-width hide-overlay scrollable fullscreen transition="slide-y-transition" @keydown.esc="onCloseForm()">
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
              <div>
                <v-data-table :headers="headers"
                              :items="items"
                              :loading="dataloading"
                              :rows-per-page-items="[10, 5]"
                              :pagination.sync="pagination"
                              :custom-sort="customSort"
                              class="elevation-3 mt-1">
                  <template slot="headerCell" slot-scope="props">
                    <span>
                      {{ props.header.text }}
                    </span>
                  </template>
                  <v-progress-linear slot="progress" :indeterminate="dataloading" color="blue" />
                  <template slot="items" slot-scope="props">
                    <td class="text-xs-center">{{ props.item.loginTime | formatDate }}</td>
                    <td class="text-xs-center">{{ props.item.utc_offset }}</td>
                    <td class="text-xs-center">{{ props.item.userip }}</td>
                    <td class="text-xs-center">{{ props.item.providerId }}</td>
                    <td class="text-xs-center">{{ props.item.emailVerified }}</td>
                  </template>
                </v-data-table>
                <app-alertpop :toggle="!!errorDialog" :error="errorDialog" @dismissed="onDismissed()"/>
              </div>
            </v-flex>
          </v-layout>
          <v-layout row justify-center align-center>
            <v-flex text-xs-center mb-3>
              <v-btn small color="green darken-5" outline @click.native="onCloseForm()">Close</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-layout>
    </v-container>
  </v-dialog>
</template>

<script>
import db from "@/dbfunc/db";
import mixins from "@/helpers/mixins";

export default {
  name: "UserLogins",
  mixins: [mixins.dataTableMixin],
  props: {
    uid: {
      type: String,
      default: "",
      required: true
    },
    showUserLogins: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      dataloading: true,
      propsItem: null,
      pagination: {
        sortBy: "loginTime",
        descending: true,
        rowsPerPage: 10
      },
      headers: [
        { text: "Login time", value: "loginTime", align: "center" },
        { text: "UTC offcet", value: "utc_offset", align: "center", sortable: false },
        { text: "User IP", value: "userip", align: "center" },
        { text: "Provider", value: "providerId", align: "center" },
        { text: "Verified", value: "emailVerified", align: "center" }
      ],
      items: [],
      dateColumns: ["loginTime"]
    };
  },
  computed: {
    errorDialog() {
      if (this.showUserLogins === true) {
        return this.$store.getters.errorDialog;
      }
    }
  },
  watch: {
    "uid": function() {
      if (this.uid !== "") {
        this.dataloading = true;
        let arr = [];
        this.items = [];
        db.firestore.collection("users").doc(this.uid).collection("logins")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              arr = doc.data();
              const arr2 = {};

              Object.keys(arr).forEach((key) => {
                const value = arr[key];

                if (key === "loginTime" ||
                    key === "userip" ||
                    key === "utc_offset" ||
                    key === "providerId" ||
                    key === "emailVerified") {
                  arr2[key] = value;
                  if (value === true) {
                    arr2[key] = "yes";
                  }
                  if (value === false) {
                    arr2[key] = "-";
                  }
                }
              });
              this.items.push(arr2);
            });
          }).then(() => {
            this.dataloading = false;
          })
          .catch((error) => {
            this.dataloading = false;
            this.$store.commit("setErrorDialog", error);
          });
      }
    }
  },
  created() {
    this.$store.dispatch("clearErrorDialog");
  },
  methods: {
    onDismissed() {
      this.$store.dispatch("clearErrorDialog");
    },
    onCloseForm() {
      this.$emit("closeform");
    }
  }
};
</script>
