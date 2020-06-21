<template>
<v-card color="primary">
  <v-col>
    <v-row>
      <v-col md="9">
        <v-tabs v-model="simulationTab" background-color="primary">
          <v-tab
            v-for="simulation in $store.getters['simulations/simulations']"
            v-bind:key="simulation.id"
          >{{ simulation.id }}</v-tab>
        </v-tabs>
      </v-col>
      <v-spacer/>
      <v-col md="3">
        <v-btn-toggle>
          <v-btn color="primary" depressed @click="updateState('running')">
            <v-icon>mdi-play</v-icon>
          </v-btn>
          <v-btn color="primary" depressed @click="updateState('stopped')">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-btn color="primary" depressed @click="updateState('init')">
            <v-icon>mdi-replay</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row>
      <v-tabs-items v-model="simulationTab" style="height: 0px; width: 0px">
        <v-tab-item
          v-for="simulation in $store.getters['simulations/simulations']"
          :key="simulation.id"
        >
          <Simulation v-bind:id="simulation.id"></Simulation>
        </v-tab-item>
      </v-tabs-items>
    </v-row>

    <!-- selection dish / curves -->

    <v-row justify="center">
      <Dish v-if="simulationTab !== null" v-bind:id="simulationTab"></Dish>
    </v-row>
  </v-col>
  </v-card>
</template>

<script>
import Simulation from '@/components/Simulation'
import Dish from '@/components/Dish'

export default {

  components: {
    Simulation,
    Dish // TODO: keep in SimulationDisplay as DishDisplay to have 1 instance only
  },

  data () {
    return {
      simulationTab: 0 // TODO: check behavoir once simulations are dynamically created
    }
  },

  methods: {
    updateState (state) {
      this.$store.commit('simulations/setState', {
        id: this.simulationTab,
        state: state
      })
    }
  }
}
</script>
