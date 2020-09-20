<template>
  <v-card color="primary">
    <v-col>
      <v-row justify="end">
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
      <v-row><v-divider /></v-row>
      <v-row justify="center">
        <Dish />
      </v-row>
    </v-col>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Dish from "@/components/Dish.vue";
import { State } from "vuex-class";

@Component({
  components: {
    Dish
  }
})
export default class SimulationDisplay extends Vue {
  @State("status", { namespace: "simulation" }) status!: string;

  updateStatus(status: string) {
    this.$store.commit("simulation/setStatus", status);
  }
}
</script>
