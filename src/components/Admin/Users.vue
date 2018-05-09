<template>
  <div>
    <slot name="title"/>
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="dataloading"
      class="elevation-1 mt-2"
    >
      <template slot="headerCell" slot-scope="props">
        <v-tooltip bottom>
          <span slot="activator">
            {{ props.header.text }}
          </span>
          <span>
            {{ props.header.text }}
          </span>
        </v-tooltip>
      </template>
      <v-progress-linear slot="progress" :indeterminate="dataloading" color="blue"/>
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">{{ props.item.displayName }}</td>
        <td class="text-xs-left">{{ props.item.email }}</td>
        <td class="text-xs-center">{{ props.item.creationTime }}</td>
        <td class="text-xs-center">{{ props.item.lastSignInTime }}</td>
        <td class="text-xs-center">{{ props.item.isAdmin }}</td>
        <td class="text-xs-center">{{ props.item.emailVerified }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import db from "@/dbfunc/db";

export default {
	name: "Users",
	data() {
		return {
			dataloading: true,
			headers: [
				{
					text: "User Name",
					align: "left",
					value: "displayName"
				},
				{ text: "Email", value: "email", align: "left" },
				{ text: "Created", value: "creationTime", align: "center" },
				{ text: "Signed In", value: "lastSignInTime", align: "center" },
				{ text: "Admin", value: "isAdmin", align: "center" },
				{ text: "Email Verified", value: "emailVerified", align: "center" }
			],
			items: []
		};
	},
	created() {
		this.dataloading = true;
		let arr = [];
		db.db.collection("users").get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				arr = doc.data();
				let arr2 = {};
				Object.keys(arr).forEach(function(key) {
					var value = arr[key];
					arr2[key] = value;
					if (value === true) {
						arr2[key] = "yes";
					}
					if (value === false) {
						arr2[key] = "no";
					}
				});
				this.items.push(arr2);
			});
		}).then(() => {
			this.dataloading = false;
		});
	}
};
</script>
