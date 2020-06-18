<template>
  <v-row>
    <v-col cols=6>
      profile subsection <br/>
      profile selection ("game of life", "custom", etc) <br/>
      <v-btn-toggle>
        <v-btn color="cyan" depressed>save</v-btn>
        <v-btn color="cyan" depressed>load</v-btn>
      </v-btn-toggle>
    </v-col>
    <v-spacer></v-spacer>
    <v-col cols=4>
      Process section <br/>
      <v-btn-toggle>
        <v-btn color="cyan" depressed @click="runSimulation()">run</v-btn>
        <v-btn color="cyan" depressed>stop</v-btn>
        <v-btn color="cyan" depressed @click="resetSimulation()">reset</v-btn>
      </v-btn-toggle>
    </v-col>
  </v-row>
  <!-- <v-card color="cyan">

  </v-card> -->
</template>

<script>
import { SimulationProcess } from '@/model/simulation' // todo: use different name?

export default {
  components: {
  },

  methods: {
    resetSimulation () {
      this.$store.dispatch('simulation/reset')
    },
    runSimulation () {
      var params = this.$store.getters['parameters/parameters']
      var grid = this.$store.getters['simulation/grid']
      var simu = new SimulationProcess(params)
      var newCells = simu.applyRules(grid)
      this.$store.commit('simulation/setCells', newCells)
    }
  },

  data () {
    return {
    }
  }
}
</script>
