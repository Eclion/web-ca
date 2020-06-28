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
    // use vuex instead of argument for cells & colorMap
    draw (displayedCells) {
      var absciss = displayedCells.length
      if (absciss <= 0) return
      var ordinate = displayedCells[0].length

      var dish = this.$refs.dish
      var context = dish.getContext('2d')
      // TODO: give warnings if the fraction is not round number
      var cellZoom = Math.max(1,
        Math.floor(dish.parentElement.clientWidth / absciss)
      )

      dish.width = absciss * cellZoom
      dish.height = ordinate * cellZoom

      // TODO: move Z axis to grid.js
      for (var i = 0; i < absciss; i++) {
        for (var j = 0; j < ordinate; j++) {
          context.fillStyle = this.colorMap[displayedCells[i][j]]
          var x = i * cellZoom
          var y = j * cellZoom
          context.fillRect(x, y, cellZoom, cellZoom)
        }
      }
    }
  },
  mounted () {
    this.unwatch = this.$store.watch(
      (state, getters) => {
        return getters['simulations/displayedCells'](this.id)
      },
      (newVal, oldVal) => { this.draw(newVal) }
    )
  },
  beforeDestroy () {
    this.unwatch()
    console.clear()
  }
}
</script>
