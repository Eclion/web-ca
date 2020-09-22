<template>
  <v-expansion-panel>
    <v-expansion-panel-header color="primary">
      <v-row>
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
        <CellTypeConfig
          v-for="cellType in cellTypes"
          v-bind:key="cellType.id"
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

  add() {
    this.$store.commit("cellTypes/new");
  }
}
</script>
