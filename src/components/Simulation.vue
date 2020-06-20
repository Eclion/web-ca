<template>
  <v-col>
    <v-row>
      <v-btn-toggle>
        <v-btn color="cyan" depressed @click="runSimulation()">
          <v-icon>mdi-play</v-icon>
        </v-btn>
        <v-btn color="cyan" depressed @click="stopSimulation()">
          <v-icon>mdi-stop</v-icon>
        </v-btn>
        <v-btn color="cyan" depressed @click="init()">
          <v-icon>mdi-replay</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-row>
    <v-row>
      <Dish v-bind:id="this.id"></Dish>
    </v-row>
  </v-col>
</template>

<script>
import Dish from '@/components/Dish'
import { Grid } from '@/model/grid'

const worker = new Worker('../workers/Simulation.worker.js', { type: 'module' })

export default {

  components: {
    Dish // TODO: keep in SimulationDisplay as DishDisplay?
  },

  props: {
    id: {
      type: Number,
      default: 0
    },
    numberOfSteps: {
      type: Number,
      default: 20
    },
    // numberOfSimulations? or create SimulationGroup component or a simulations store?
    rules: {
      type: Object,
      default: function () {
        return {
          0: [
            n => (n[1] === 3) ? 1 : 0
          ],
          1: [
            n => (n[1] < 2) ? 0 : 1,
            n => (n[1] > 3) ? 0 : 1
          ]
        }
      }
    },
    dishParameters: {
      type: Object,
      default: function () { return this.$store.getters['parameters/parameters'] }
    }
  },

  methods: {
    init () {
      this.grid.init(this.dishParameters)
      this.remainingSteps = this.numberOfSteps
      this.$store.commit('simulations/setCells', {
        id: this.id,
        cells: this.grid.cells
      })
    },
    runSimulation () {
      this.state = 'running'
      var payload = { cells: this.grid.cells, rules: this.rules }
      var pStr = JSON.stringify(payload)
      worker.postMessage(pStr)
    },
    stopSimulation () {
      this.state = 'stopped'
    }
  },

  data () {
    return {
      state: 'created',
      grid: new Grid(),
      remainingSteps: 0
    }
  },

  mounted () {
    this.init()
    worker.onmessage = event => {
      this.$store.commit('simulations/setCells', {
        id: this.id,
        cells: event.data
      })
      this.grid.cells = event.data
      this.remainingSteps -= 1
      if (this.remainingSteps > 0 && this.state === 'running') {
        var payload = { cells: this.grid.cells, rules: this.rules }
        var pStr = JSON.stringify(payload)
        worker.postMessage(pStr)
      }
    }
  }

}
</script>
