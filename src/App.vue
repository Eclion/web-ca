<template>
  <v-app>
    <v-main>
      <SimulationPage />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import SimulationPage from "@/views/SimulationPage.vue";

export default Vue.extend({
  name: "App",

  components: {
    SimulationPage
  },

  data: () => ({
    //
  })
});
</script>
