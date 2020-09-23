<template>
  <v-expansion-panel>
    <v-expansion-panel-header color="primary">
      <v-row align="center">
        <v-col cols="6">Cells types</v-col>
        <v-spacer />
        <v-col cols="2">
          <v-btn color="primary" depressed @click.stop @click="add()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-expansion-panel-header>
    <v-expansion-panel-content color="primary">
      <v-expansion-panels multiple>
        <!-- v-item-group theme--dark v-expansion-panels -->
        <draggable v-model="cellTypes" style="min-width:100%;">
          <CellTypeConfig
            v-for="cellType in cellTypes"
            v-bind:key="cellType.id"
            :name="cellType.name"
            :id="cellType.id"
            :color="cellType.color"
            :initialCount="cellType.initialCount"
            :distribution="cellType.distribution"
          />
        </draggable>
      </v-expansion-panels>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import CellTypeConfig from "@/components/CellTypeConfig.vue";
import CellType from "@/models/CellType";
import draggable from "vuedraggable";

@Component({
  components: {
    CellTypeConfig,
    draggable
  }
})
export default class CellTypesPanel extends Vue {
  get cellTypes(): Array<CellType> {
    return this.$store.getters["cellTypes/all"];
  }
  set cellTypes(_cellTypes: Array<CellType>) {
    this.$store.commit("cellTypes/replaceAll", _cellTypes);
  }

  add() {
    this.$store.commit("cellTypes/new");
  }
}
</script>
