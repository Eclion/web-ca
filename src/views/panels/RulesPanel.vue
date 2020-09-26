<template>
  <v-expansion-panel>
    <v-expansion-panel-header color="primary">
      <v-row align="center">
        <v-col cols="6">Rules</v-col>
        <v-spacer />
        <v-col cols="2">
          <v-btn color="primary" depressed @click.stop @click="add()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-expansion-panel-header>
    <v-expansion-panel-content color="primary">
      <draggable v-model="rules" style="min-width:100%;">
        <RuleConfig
          v-for="rule in this.rules"
          v-bind:key="rule.id"
          :id="rule.id"
          :initialCellTypeId="rule.initialCellTypeId"
          :nextCellTypeId="rule.nextCellTypeId"
          :neighborCellTypeId="rule.neighborCellTypeId"
          :neighborCount="rule.neighborCount"
          :operator="rule.operator"
        />
      </draggable>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import RuleConfig from "@/components/RuleConfig.vue";
import Rule from "@/models/Rule";
import draggable from "vuedraggable";

@Component({
  components: {
    RuleConfig,
    draggable
  }
})
export default class RulesPanel extends Vue {
  get rules(): Array<Rule> {
    return this.$store.getters["rules/all"];
  }
  set rules(_rules: Array<Rule>) {
    this.$store.commit("rules/replaceAll", _rules);
  }

  add() {
    this.$store.commit("rules/new");
  }
}
</script>
