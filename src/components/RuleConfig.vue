<template>
  <v-container>
    <v-row align="center">
      <v-col cols="2">
        {{ this.id }}
      </v-col>
      <v-spacer />
      <v-col cols="2">
        <v-btn color="secondary" depressed @click="deleteRule()">
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="3">When cell is</v-col>
      <v-col cols="3">
        <v-select flat v-model="initialCellType" :items="cellTypeNames" />
      </v-col>
      <v-col cols="2">:</v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="2">If the</v-col>
      <v-col cols="3">
        <v-select flat v-model="neighborCellType" :items="cellTypeNames" />
      </v-col>
      <v-col cols="3">neighbor count</v-col>
      <v-col cols="2">
        <v-select
          flat
          :value="operator"
          :items="operators"
          v-on:input="updateOperator($event)"
        />
      </v-col>
      <v-col cols="2">
        <v-text-field
          flat
          type="number"
          :value="neighborCount"
          v-on:input="updateNeighborCount(Number($event))"
        />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="3">The cell becomes</v-col>
      <v-col cols="3">
        <v-select flat v-model="nextCellType" :items="cellTypeNames" />
      </v-col>
      <v-col cols="2">cell.</v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";
import { Getter } from "vuex-class";
import Rule from "@/models/Rule";

@Component
export default class RuleConfig extends Vue {
  @Prop() id!: number | 0;
  @Prop() initialCellTypeId!: number | 0;
  @Prop() nextCellTypeId!: number | 0;
  @Prop() neighborCellTypeId!: number | 0;
  @Prop() neighborCount!: number | 0;
  @Prop() operator!: string | "";

  @Getter("names", { namespace: "cellTypes" }) cellTypeNames!: Array<string>;
  @Getter("nameFromId", { namespace: "cellTypes" }) getCellTypeNameFromId!: (
    id: number
  ) => string;
  @Getter("idFromName", { namespace: "cellTypes" }) getCellTypeIdFromName!: (
    name: string
  ) => number;

  operators: string[] = Rule.operators;

  deleteRule() {
    this.$store.commit("rules/delete", this.id);
  }

  private updateRule(field: string, name: string) {
    const cellTypeId = this.getCellTypeIdFromName(name);
    this.$store.commit("rules/updateRule", {
      id: this.id,
      key: field,
      value: cellTypeId
    });
  }

  get initialCellType() {
    return this.getCellTypeNameFromId(this.initialCellTypeId);
  }
  set initialCellType(name) {
    this.updateRule("initialCellTypeId", name);
  }

  get nextCellType() {
    return this.getCellTypeNameFromId(this.nextCellTypeId);
  }
  set nextCellType(name) {
    this.updateRule("nextCellTypeId", name);
  }

  get neighborCellType() {
    return this.getCellTypeNameFromId(this.neighborCellTypeId);
  }
  set neighborCellType(name) {
    this.updateRule("neighborCellTypeId", name);
  }

  updateOperator(_operator: string) {
    this.$store.commit("rules/updateRule", {
      id: this.id,
      key: "operator",
      value: _operator
    });
  }

  updateNeighborCount(count: number) {
    this.$store.commit("rules/updateRule", {
      id: this.id,
      key: "neighborCount",
      value: count
    });
  }
}
</script>
