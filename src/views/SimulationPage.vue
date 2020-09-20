<template>
  <v-row>
    <v-col cols="1" />
    <v-col cols="5">
      <Parameters />
    </v-col>
    <v-col cols="5">
      <v-row>
        <v-btn-toggle>
          <v-btn color="primary" depressed @click="updateStatus('running')">
            <v-icon>mdi-play</v-icon>
          </v-btn>
          <v-btn color="primary" depressed @click="updateStatus('stopped')">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-btn color="primary" depressed @click="updateStatus('init')">
            <v-icon>mdi-replay</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-row>
        <Dish />
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import Parameters from "@/views/Parameters.vue";
import Dish from "@/components/Dish.vue";
import { Getter, State } from "vuex-class";
import CellType from "@/models/CellType";

@Component({
  components: {
    Parameters,
    Dish
  }
})
export default class SimulationPage extends Vue {
  worker = new Worker("../workers/Simulation.worker.js", { type: "module" });

  @State("status", { namespace: "simulation" }) status!: string;
  @State("remainingStepCount", { namespace: "simulation" })
  remainingStepCount!: number;

  @Getter("dimensions", { namespace: "dish" })
  dimensions!: {
    width: number;
    height: number;
    depth: number;
  };
  @Getter("all", { namespace: "cellTypes" }) cellTypes!: Array<CellType>;

  @Watch("dimensions")
  @Watch("cellTypes")
  private resetSimulation() {
    this.init();
  }

  init() {
    this.worker.postMessage(
      JSON.stringify({
        action: "init",
        params: {
          dishDimensions: this.dimensions,
          cellTypes: this.cellTypes
        }
      })
    );
  }

  runSimulation() {
    this.$store.commit("simulation/setStatus", "running");
    this.worker.postMessage(JSON.stringify({ action: "run" }));
  }

  stopSimulation() {
    this.$store.commit("simulation/status", "stopped");
  }

  beforeDestroy() {
    this.worker.terminate();
  }

  updateStatus(status: string) {
    if (this.status === status && status === "init") {
      this.init();
    }
    this.$store.commit("simulation/setStatus", status);
  }

  @Watch("status")
  private watchStatus() {
    switch (this.status) {
      case "running":
        this.runSimulation();
        break;
      case "init":
        this.init();
        break;
      default:
        break;
    }
  }

  mounted() {
    this.worker.onmessage = event => {
      if (event.data === undefined) {
        return;
      }
      this.$store.commit("displayedCells/update", event.data.cells);

      if (this.status === "running") {
        this.$store.commit("simulation/decrementStepCount");
        this.worker.postMessage(JSON.stringify({ action: "run" }));
      }
    };
    this.init();
  }
}
</script>
