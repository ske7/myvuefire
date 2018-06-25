<template>
  <div>
    <v-data-table :headers="headers"
                  :items="items"
                  :loading="dataloading"
                  :rows-per-page-items="[10, 5]"
                  :pagination.sync="pagination"
                  :custom-sort="customSort"
                  class="elevation-4 mt-1">
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
    <app-alertpop :toggle="!!error" :error="error" :info="info" @dismissed="onDismissed()"/>
  </div>
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
    error() {
      return this.$store.getters.error;
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
            this.$store.commit("setError", error);
          });
      }
    }
  },
  created() {
    this.$store.dispatch("clearError");
  },
  methods: {
    onDismissed() {
      this.$store.dispatch("clearError");
    }
  }
};
</script>
