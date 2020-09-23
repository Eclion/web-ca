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
        <v-select flat v-model="selectedCellType" :items="cellTypeNames" />
      </v-col>
      <v-col cols="2">:</v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="4">If the neighbor count</v-col>
      <v-col cols="2">
        <v-select flat v-model="selectedOperator" :items="operators" />
      </v-col>
      <v-col cols="2">
        <v-text-field flat type="number" v-model="neighborCount" />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="3">The cell becomes</v-col>
      <v-col cols="3">
        <v-select flat v-model="selectedNewCellType" :items="cellTypeNames" />
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
  @Getter("names", { namespace: "cellTypes" }) cellTypeNames!: Array<string>;
  operators: string[] = Rule.operators;

  selectedCellType = "Empty";
  selectedOperator = "==";
  selectedNewCellType = "Empty";
  neighborCount = "";

  deleteRule() {
    this.$store.commit("rules/delete", this.id);
  }
}
</script>
