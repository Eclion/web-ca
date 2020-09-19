<template>
  <v-expansion-panel>
    <v-expansion-panel-header color="primary">Dish</v-expansion-panel-header>
    <v-expansion-panel-content color="primary">
      <v-row>
        <v-col cols="3">
          <v-card-text>Dish:</v-card-text>
        </v-col>
        <v-col cols="2">
          <v-text-field
            type="number"
            label="Height"
            v-model="dimensions.height"
            v-on:input="updateHeight(Number($event))"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            type="number"
            label="Width"
            v-model="dimensions.width"
            v-on:input="updateWidth(Number($event))"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            type="number"
            label="Depth"
            v-model="dimensions.depth"
            v-on:input="updateDepth(Number($event))"
          ></v-text-field>
        </v-col>
        <v-spacer />
      </v-row>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class DishPanel extends Vue {
  @Getter("dimensions", { namespace: "dish" })
  public dimensions!: { width: number; height: number; depth: number };

  updateWidth(width: number) {
    if (width <= 0) return;
    this.$store.commit("dish/setWidth", width);
  }

  updateHeight(height: number) {
    if (height <= 0) return;
    this.$store.commit("dish/setHeight", height);
  }

  updateDepth(depth: number) {
    if (depth <= 0) return;
    this.$store.commit("dish/setDepth", depth);
  }
}
</script>
