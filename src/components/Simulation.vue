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

const worker = new Worker('../workers/Simulation.worker.js', { type: 'module' })

export default {

  components: {
    Dish // TODO: keep in SimulationDisplay as DishDisplay to have 1 instance only
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
      this.isRunning = false
      this.remainingSteps = this.numberOfSteps
      worker.postMessage(
        JSON.stringify({ action: 'init', params: this.dishParameters })
      )
    },
    runSimulation () {
      this.isRunning = true
      worker.postMessage(
        JSON.stringify({ action: 'run' })
      )
    },
    stopSimulation () {
      this.isRunning = false
    }
  },

  data () {
    return {
      isRunning: false,
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
      this.remainingSteps -= 1
      if (this.remainingSteps > 0 && this.isRunning) {
        var payload = { action: 'run', cells: event.data, rules: this.rules }
        var pStr = JSON.stringify(payload)
        worker.postMessage(pStr)
      }
    }
  }

}
</script>
