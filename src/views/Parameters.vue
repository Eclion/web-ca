<template>
  <v-expansion-panels multiple>
    <CellTypesPanel />
  </v-expansion-panels>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import CellTypesPanel from "@/views/CellTypesPanel.vue";

@Component({
  components: {
    CellTypesPanel
  }
})
export default class Parameters extends Vue {}
</script>
