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
import { rangeArray } from '@/model/utils'

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
    performStep () {
      var nextCells = Array(this.grid.width).fill()
        .map(() => Array(this.grid.height).fill()
          .map(() => Array(this.grid.depth).fill(0)))

      for (var x of rangeArray(0, this.grid.width - 1)) {
        for (var y of rangeArray(0, this.grid.height - 1)) {
          for (var z of rangeArray(0, this.grid.depth - 1)) {
            var cell = this.grid[x][y][z]
            var neighbors = this.grid.countNeighbors(x, y, z)
            for (var rule of this.rules[cell]) {
              var nextCell = rule(neighbors)
              if (nextCell !== cell) { break }
            }
            nextCells[x][y][z] = nextCell
          }
        }
      }

      this.grid.cells = nextCells
    },
    runSimulation () {
      this.state = 'running'
      // need a worker for the loop.
      this.performStep()
      this.$store.commit('simulations/setCells', {
        id: this.id,
        cells: this.grid.cells
      })
      this.remainingSteps -= 1
      console.log(this.remainingSteps)
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
  }

}
</script>
