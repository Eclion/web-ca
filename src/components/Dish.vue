<template>
  <!-- include id in the ref -->
  <canvas ref="dish"></canvas>
</template>

<script>
export default {
  // https://github.com/escodebar/life/blob/master/src/components/Game.vue
  data () {
    return {
      colorMap: { 0: '#333333', 1: '#FFFFFF' }
    }
  },

  props: {
    id: {
      type: Number,
      default: 0
    }
  },

  methods: {
    clear () {
      var dishSettings = this.$store.getters['parameters/dish_settings']
      console.log()
      var cells = Array(dishSettings.width)
        .fill()
        .map(() => Array(dishSettings.height)
          .fill()
          .map(() => Array(dishSettings.depth).fill(0)))
      this.draw(cells)
    },

    // use vuex instead of argument for cells & colorMap
    draw (cells) {
      var absciss = cells.length
      if (absciss <= 0) return
      var ordinate = cells[0].length

      var dish = this.$refs.dish
      var context = dish.getContext('2d')
      // TODO: give warnings if the fraction is not round number
      var cellZoom = Math.max(1,
        Math.floor(dish.parentElement.clientWidth / absciss)
      )

      dish.width = absciss * cellZoom
      dish.height = ordinate * cellZoom

      for (var i = 0; i < absciss; i++) {
        for (var j = 0; j < ordinate; j++) {
          var displayedCell = 0
          for (var k = 0; k < cells[i][j].length; k++) {
            var cell = cells[i][j][k]
            if (cell !== 0) {
              displayedCell = cell
              break
            }
          }
          context.fillStyle = this.colorMap[displayedCell]
          var x = i * cellZoom
          var y = j * cellZoom
          context.fillRect(x, y, cellZoom, cellZoom)
        }
      }
    }
  },
  created () {
    // this.unwatch = this.$store.watch((state) => state.simulation.grid, (val) => { console.log(val) })
    this.unwatch = this.$store.watch(
      (state, getters) => {
        return getters['simulations/cells'](this.id)
      },
      (newVal, oldVal) => {
        console.log('updated')
        this.draw(newVal)
      }
    )
  },
  beforeDestroy () {
    this.unwatch()
    console.clear()
  }
}
</script>
