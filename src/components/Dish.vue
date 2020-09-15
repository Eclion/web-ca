<template>
  <!-- include id in the ref -->
  <canvas ref="dish"></canvas>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class Dish extends Vue {
  @Getter("colorMap", { namespace: "cellTypes" }) colorMap!: Array<string>;
  @Getter("get", { namespace: "displayedCells" }) displayedCells!: Array<Array<number>>;

  @Watch("colorMap")
  private drawAfterColorUpdate() {
    this.draw();
  }

  @Watch("displayedCells")
  private drawAfterCellUpdate() {
    this.draw();
  }

  // https://github.com/escodebar/life/blob/master/src/components/Game.vue
  draw() {
    const absciss = this.displayedCells.length;
    if (absciss <= 0) return;
    const ordinate = this.displayedCells[0].length;
    const dish = this.$refs.dish as HTMLCanvasElement;
    const context = dish.getContext("2d");
    if (dish.parentElement === null || context === null) {
      console.error("dish has no parent or no context !!!");
      return;
    }
    // TODO: give warnings if the fraction is not round number
    const cellZoom = Math.max(
      1,
      Math.floor(dish.parentElement.clientWidth / absciss)
    );
    dish.width = absciss * cellZoom;
    dish.height = ordinate * cellZoom;
    // TODO: move Z axis to grid.js
    for (let i = 0; i < absciss; i++) {
      for (let j = 0; j < ordinate; j++) {
        context.fillStyle = this.colorMap[this.displayedCells[i][j]];
        const x = i * cellZoom;
        const y = j * cellZoom;
        context.fillRect(x, y, cellZoom, cellZoom);
      }
    }
  }

  mounted() {
    this.draw();
  }
}
</script>
