<template>
  <!--
    color picker: https://codepen.io/JamieCurnow/pen/KKPjraK?editors=1010
  -->
  <v-menu
    v-model="menu"
    top
    nudge-bottom="105"
    nudge-left="16"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ on }">
      <div :style="swatchStyle" v-on="on" />
    </template>
    <v-card>
      <v-card-text class="pa-0">
        <v-color-picker
          v-model="syncedColor"
          flat
          background-color="primary"
          hide-inputs
        />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Vue, PropSync, Component } from "vue-property-decorator";

@Component
export default class ColorPickerPopup extends Vue {
  @PropSync("color", { type: String }) syncedColor!: string;

  data() {
    return {
      menu: false
    };
  }

  get swatchStyle() {
    return {
      backgroundColor: this.syncedColor,
      cursor: "pointer",
      height: "30px",
      width: "30px",
      borderRadius: "4px"
    };
  }
}
</script>
