<template>
  <v-app>
    <v-main>
      <v-expansion-panels multiple>
        <CellTypesPanel />
      </v-expansion-panels>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import CellTypesPanel from "./views/CellTypesPanel.vue";

export default Vue.extend({
  name: "App",

  components: {
    CellTypesPanel
  },

  data: () => ({
    //
  })
});
</script>
