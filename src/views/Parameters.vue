<template>
  <v-card color="primary">
    <v-toolbar  color="primary" dense>
      <v-toolbar-title>Parameters</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn>
        <v-card-text>New</v-card-text>
      </v-btn>

      <v-btn>
        <v-card-text>Default</v-card-text>
      </v-btn>

      <v-btn>
        <v-card-text @click="apply()">Apply</v-card-text>
      </v-btn>
    </v-toolbar>

    <v-expansion-panels multiple>

      <!-- Dish configuration -->
      <v-expansion-panel>
        <v-expansion-panel-header color="primary">Dish configuration</v-expansion-panel-header>
        <v-expansion-panel-content color="primary">
          <v-row>
            <v-col cols="2">
              <v-card-text>Dish:</v-card-text>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" label="Height" v-model="dishHeight"></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" label="Width" v-model="dishWidth"></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" label="Depth" v-model="dishDepth"></v-text-field>
            </v-col>
            <v-spacer/>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- Cells & rules -->
      <v-expansion-panel>
        <v-expansion-panel-header color="primary">Cells & rules</v-expansion-panel-header>
        <v-expansion-panel-content color="primary">
          <!-- <v-row>
            <v-col cols="2">
              <v-card-text>Initial number of cells:</v-card-text>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" v-model=""></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-card-text>Initial cell distribution:</v-card-text>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" v-model="initialCellDistribution"></v-text-field>
            </v-col>
          </v-row> -->
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- Simulation configuration -->
      <v-expansion-panel>
        <v-expansion-panel-header color="primary">Simulation configuration</v-expansion-panel-header>
        <v-expansion-panel-content color="primary">
          <v-row>
            <v-col cols="2">
              <v-card-text>Number of steps:</v-card-text>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" v-model="numberOfSteps"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <!-- <v-col cols="2">
              <v-card-text>Number of simulations:</v-card-text>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" v-model="numberOfSimulations"></v-text-field>
            </v-col> -->
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- Other configuration -->
      <v-expansion-panel>
        <v-expansion-panel-header color="primary">Other</v-expansion-panel-header>
        <v-expansion-panel-content color="primary">params</v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>

export default {

  components: {
  },

  data () {
    return {
      dishWidth: 100,
      dishHeight: 100,
      dishDepth: 1,
      // numberOfSimulations: 1,
      numberOfSteps: 20,
      initialCellDistribution: 'Normal Random'
    }
  },

  methods: {
    updateDishSettings () {
      this.$store.commit('parameters/setDishSettings', {
        width: parseInt(this.dishWidth),
        height: parseInt(this.dishHeight),
        depth: parseInt(this.dishDepth)
      })
    },
    updateSimulationParameters () {
      this.$store.commit('parameters/setSimulationParameters', {
        number_of_simulations: 1,
        number_of_steps: parseInt(this.numberOfSteps)
      })
    },
    updateCellTypes () {
      /* this.$store.commit('parameters/setCellParameters', {
      }) */
    },
    apply () {
      this.$store.commit('simulations/setParameters', {
        id: 0, // TODO: this.simulationTab,
        parameters: this.$store.getters['parameters/parameters']
      })
    }
  },

  watch: {
    dishWidth: 'updateDishSettings',
    dishHeight: 'updateDishSettings',
    dishDepth: 'updateDishSettings',
    numberOfSteps: 'updateSimulationParameters'
  }
}
</script>
