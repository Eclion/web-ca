<template>
  <v-card color="primary">
    <v-card-title>Parameters</v-card-title>
    <v-divider />
    <v-expansion-panels multiple>
      <DishPanel />
      <CellTypesPanel />
      <SimulationPanel />
    </v-expansion-panels>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import CellTypesPanel from "@/views/panels/CellTypesPanel.vue";
import DishPanel from "@/views/panels/DishPanel.vue";
import SimulationPanel from "@/views/panels/SimulationPanel.vue";

@Component({
  components: {
    CellTypesPanel,
    DishPanel,
    SimulationPanel
  }
})
export default class Parameters extends Vue {}
</script>
