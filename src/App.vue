<template>
  <v-app>
    <v-app-bar style="flex: 0 1 auto">
      <v-tabs v-model="tab">
        <v-tab>Model</v-tab>
        <v-tab>Papers</v-tab>
      </v-tabs>

      <v-switch
        v-model="$vuetify.theme.dark"
        hide-details
        inset
        label="Dark mode"
      ></v-switch>
      <v-btn href="https://github.com/Eclion/web-ca/" target="_blank" text>
        <v-icon large>mdi-github</v-icon>
      </v-btn>
    </v-app-bar>
    <v-container>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <SimulationPage />
        </v-tab-item>
        <v-tab-item>
          <PapersPage />
        </v-tab-item>
      </v-tabs-items>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import SimulationPage from "@/views/SimulationPage.vue";
import PapersPage from "@/views/PapersPage.vue";

export default Vue.extend({
  name: "App",

  components: {
    SimulationPage,
    PapersPage
  },

  data: () => ({
    tab: null
  })
});
</script>
