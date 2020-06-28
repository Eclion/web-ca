<template>
  <v-col/>
</template>

<script>

export default {

  props: {
    id: {
      type: Number,
      default: 0
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
    }
  },

  methods: {
    init () {
      this.isRunning = false
      this.remainingSteps = this.parameters.number_of_steps
      this.worker.postMessage(
        JSON.stringify({ action: 'init', params: this.parameters })
      )
    },
    runSimulation () {
      this.isRunning = true
      this.worker.postMessage(
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
      remainingSteps: 0,
      parameters: {},
      worker: new Worker('../workers/Simulation.worker.js', { type: 'module' })
    }
  },

  mounted () {
    this.parameters = this.$store.getters['simulations/parameters'](this.id)
    this.init()
    this.worker.onmessage = event => {
      if (event.data === undefined) {
        return
      }
      this.$store.commit('simulations/setCells', {
        id: this.id,
        displayedCells: event.data
      })
      this.remainingSteps -= 1
      if (this.remainingSteps > 0 && this.isRunning) {
        var payload = { action: 'run' }
        var pStr = JSON.stringify(payload)
        this.worker.postMessage(pStr)
      }
    }
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
  beforeDestroy () {
    this.unwatchState()
    this.unwatchParameters()
    this.worker.terminate()
  }

}
</script>
