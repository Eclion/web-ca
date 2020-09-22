<template>
  <!--
    expansion panel with name and color in header?
    https://vuetifyjs.com/en/components/expansion-panels/#advanced
    validation icon ?
  -->
  <v-expansion-panel color="primary" :readonly="this.name === 'Empty'">
    <v-expansion-panel-header color="primary" expand-icon="">
      <v-row align-content="end">
        <v-col cols="4" style="padding:0">
          <v-text-field
            v-model="name"
            hide-details
            solo
            background-color="primary"
            flat
            @click.stop
            :disabled="this.name === 'Empty'"
          ></v-text-field>
        </v-col>
        <v-spacer />
        <v-col cols="2" v-if="this.name !== 'Empty'">
          <v-btn color="secondary" depressed @click="deleteCellType()">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="1" style="padding:0" align-self="center">
          <!-- TODO Simpler color picker -->
          <ColorPickerPopup
            :color="this.color"
            v-on:update:color="updateColor($event)"
          />
        </v-col>
      </v-row>
    </v-expansion-panel-header>
    <v-expansion-panel-content color="primary" v-if="this.name !== 'Empty'">
      <v-row>
        <v-col cols="6">
          <v-card-text>Number of cells:</v-card-text>
        </v-col>
        <v-col cols="3">
          <v-text-field
            type="number"
            :value="initialCount"
            v-on:input="updateInitialCount(Number($event))"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-card-text>Cell distribution:</v-card-text>
        </v-col>
        <v-col cols="4">
          <!--
        menu dropdown
        + v-ifs
        -->
        </v-col>
      </v-row>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";
import ColorPickerPopup from "@/components/ColorPickerPopup.vue";

@Component({
  components: {
    ColorPickerPopup
  }
})
export default class CellTypeConfig extends Vue {
  @Prop() id!: number | 0;
  @Prop() name!: string | "";
  @Prop() color!: string | "";
  @Prop() initialCount?: number | 0;
  // @Prop() distribution?: Distribution;

  updateColor(_color: string) {
    this.$store.commit("cellTypes/updateColor", { id: this.id, color: _color });
  }

  updateInitialCount(_count: number) {
    this.$store.commit("cellTypes/updateInitialCount", {
      id: this.id,
      initialCount: _count
    });
  }

  deleteCellType() {
    this.$store.commit("cellTypes/delete", this.id);
  }
}
</script>
