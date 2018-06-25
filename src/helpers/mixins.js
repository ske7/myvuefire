const dataTableMixin = {
  filters: {
    formatDate(date) {
      if (date === null || date === undefined || date === "") {
        return "";
      }
      const option = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC"
      };
      return new Date(Date.parse(date)).toLocaleDateString("en-GB", option);
    }
  },
  methods: {
    customSort(items, index, desc) {
      const modifier = (desc ? -1 : 1);
      return items.sort((var1, var2) => {
        if (!index) {
          return 0;
        }

        let val1 = var1[index];
        let val2 = var2[index];

        if (this.dateColumns.indexOf(index) !== -1) {
          if (val1 === null || val1 === undefined) {
            val1 = 0;
          } else {
            val1 = Date.parse(val1);
          }
          if (val2 === null || val2 === undefined) {
            val2 = 0;
          } else {
            val2 = Date.parse(val2);
          }
        }

        if (val1 === null || val1 === undefined) {
          val1 = "";
        }

        if (val2 === null || val2 === undefined) {
          val2 = "";
        }

        if (isFinite(val1) && isFinite(val2)) {
          return modifier * (val1 - val2);
        }

        return modifier * val1.toString().localeCompare(val2);
      });
    }
  }
};

// ------------------------------------- //
export default {
  dataTableMixin
};
