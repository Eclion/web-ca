<template>
  <v-row>
    <v-col cols="1" />
    <v-col cols="5">
      <Parameters />
    </v-col>
    <v-col cols="5">
      <Dish />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Parameters from "@/views/Parameters.vue";
import Dish from "@/components/Dish.vue";

@Component({
  components: {
    Parameters,
    Dish
  }
})
export default class SimulationPage extends Vue {
  worker = new Worker("../workers/Simulation.worker.js", { type: "module" });
  // TODO move below to store
  isRunning = false;
  remainingSteps = 0;

  init() {
    this.isRunning = false;
    this.remainingSteps = 0;
    const cellTypes = this.$store.getters["cellTypes/all"];
    this.worker.postMessage(
      JSON.stringify({
        action: "init",
        params: {
          dishDimensions: { width: 100, height: 100, depth: 1 },
          cellTypes: cellTypes
        }
      })
    );
  }

  runSimulation() {
    this.isRunning = true;
    this.worker.postMessage(JSON.stringify({ action: "run" }));
  }

  stopSimulation() {
    this.isRunning = false;
  }

  beforeDestroy() {
    this.worker.terminate();
  }

  mounted() {
    this.worker.onmessage = event => {
      if (event.data === undefined) {
        return;
      }
      this.$store.commit("displayedCells/update", event.data.cells);
      this.remainingSteps -= 1;
      if (this.remainingSteps > 0 && this.isRunning) {
        this.worker.postMessage(JSON.stringify({ action: "run" }));
      }
    };
    this.init();

    /*
        this.unwatchState = this.$store.watch(
      (state, getters) => {
        return getters['simulations/state'](this.id)
      },
      (newVal, oldVal) => {
        switch (newVal) {
          case ('running'):
            this.isRunning = true
            this.runSimulation()
            break
          case ('init'):
            this.init()
            this.isRunning = false
            break
          default:
            this.isRunning = false
            break
        }
      }
    )
    this.unwatchParameters = this.$store.watch(
      (state, getters) => {
        return getters['simulations/parameters'](this.id).version
      },
      (newVal, oldVal) => {
        this.parameters = this.$store.getters['simulations/parameters'](this.id)
        this.init()
      }
    )
  },
    */
  }
}
</script>
