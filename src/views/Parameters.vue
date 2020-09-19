<template>
  <v-expansion-panels multiple>
    <CellTypesPanel />
    <DishPanel />
  </v-expansion-panels>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import CellTypesPanel from "@/views/CellTypesPanel.vue";
import DishPanel from "@/views/DishPanel.vue";

@Component({
  components: {
    CellTypesPanel,
    DishPanel
  }
})
export default class Parameters extends Vue {}
</script>
