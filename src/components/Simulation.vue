<template>
    <!-- add buttons here -->
    <Dish/>
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
    // numberOfSimulations? or create SimulationGroup component?
    rules: {
      type: Map,
      default: {
        0: [
          n => (n[1] === 3) ? 1 : 0
        ],
        1: [
          n => (n[1] < 2) ? 0 : 1,
          n => (n[1] > 3) ? 0 : 1
        ]
      }
    },
    dishParameters: {
      type: Map
    }
  },

  methods: {
    init () {
      this.grid.init(this.dishParameters)
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

      return nextCells
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
    // this.init()
  }

}
</script>
