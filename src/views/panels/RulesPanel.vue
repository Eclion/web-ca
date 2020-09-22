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
      <RuleConfig
        v-for="rule in this.rules"
        v-bind:key="rule.id"
        :id="rule.id"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import RuleConfig from "@/components/RuleConfig.vue";
import Rule from "@/models/Rule";
import { State } from "vuex-class";

@Component({
  components: {
    RuleConfig
  }
})
export default class RulesPanel extends Vue {
  @State("rules", { namespace: "rules" })
  public rules!: Array<Rule>;

  add() {
    this.$store.commit("rules/new");
  }
}
</script>
