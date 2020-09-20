<template>
  <v-expansion-panel>
    <v-expansion-panel-header color="primary"
      >Simulation</v-expansion-panel-header
    >
    <v-expansion-panel-content color="primary">
      <v-row>
        <v-col cols="3">
          <v-card-text>Step count:</v-card-text>
        </v-col>
        <v-col cols="3">
          <v-text-field
            type="number"
            label=""
            :value="stepCount"
            v-on:input="updateStepCount(Number($event))"
          ></v-text-field>
        </v-col>
        <v-spacer />
      </v-row>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";

@Component
export default class DishPanel extends Vue {
  @State("stepCount", { namespace: "simulation" })
  public stepCount!: number;

  updateStepCount(stepCount: number) {
    if (stepCount <= 0) return;
    this.$store.commit("simulation/setStepCount", stepCount);
  }
}
</script>
