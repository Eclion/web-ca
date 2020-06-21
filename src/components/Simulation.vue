<template>
  <v-col/>
</template>

<script>

const worker = new Worker('../workers/Simulation.worker.js', { type: 'module' })

export default {

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
    // this.unwatch = this.$store.watch((state) => state.simulation.grid, (val) => { console.log(val) })
    this.unwatch = this.$store.watch(
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
  },
  beforeDestroy () {
    this.unwatch()
  }

}
</script>
