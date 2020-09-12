<template>
  <v-expansion-panel>
    <v-expansion-panel-header color="primary"
      >Cells types</v-expansion-panel-header
    >
    <v-expansion-panel-content color="primary">
      <!--
            add/remove buttons
          -->
      <v-expansion-panels multiple>
        <CellTypeConfig
          v-for="cellType in cellTypes"
          v-bind:key="cellType.name"
          :name="cellType.name"
          :id="cellType.id"
          :color="cellType.color"
          :initialCount="cellType.initialCount"
          :distribution="cellType.distribution"
        />
      </v-expansion-panels>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import CellTypeConfig from "@/components/CellTypeConfig.vue";
import CellType from "@/models/CellType";
import { State } from "vuex-class";

@Component({
  components: {
    CellTypeConfig
  }
})
export default class CellTypesPanel extends Vue {
  @State("cellTypes", { namespace: "cellTypes" })
  public cellTypes!: Array<CellType>;
}
</script>
