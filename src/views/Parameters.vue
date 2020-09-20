<template>
  <v-expansion-panels multiple>
    <DishPanel />
    <CellTypesPanel />
    <SimulationPanel />
  </v-expansion-panels>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import CellTypesPanel from "@/views/CellTypesPanel.vue";
import DishPanel from "@/views/DishPanel.vue";
import SimulationPanel from "@/views/SimulationPanel.vue";

@Component({
  components: {
    CellTypesPanel,
    DishPanel,
    SimulationPanel
  }
})
export default class Parameters extends Vue {}
</script>
