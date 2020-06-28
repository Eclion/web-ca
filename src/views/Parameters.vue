<template>
  <v-card color="primary">
    <v-toolbar color="primary" dense>
      <v-toolbar-title>Parameters</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn>
        <v-card-text @click="newSimulation()">New</v-card-text>
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
            <v-col cols="3">
              <v-card-text>Dish:</v-card-text>
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" label="Height" v-model="dishHeight" />
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" label="Width" v-model="dishWidth" />
            </v-col>
            <v-col cols="2">
              <v-text-field type="number" label="Depth" v-model="dishDepth" />
            </v-col>
            <v-spacer/>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- Cells & rules -->
      <v-expansion-panel>
        <v-expansion-panel-header color="primary">Cells & rules</v-expansion-panel-header>
        <v-expansion-panel-content color="primary">
          <!--
            add/remove buttons
          -->
          <v-expansion-panels multiple>
          <!-- <v-expansion-panel
            v-for="cellConfiguration in $store.getters['parameters/cellConfigurations']"
            v-bind:key=cellConfiguration.name
          >
          <CellConfiguration :initialName='cellConfiguration.name'/>
          </v-expansion-panel> -->
          <v-expansion-panel>
          </v-expansion-panel>
          <v-expansion-panel-header color="primary">test</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card-text>hello</v-card-text>
          </v-expansion-panel-content>
          </v-expansion-panels>
          <CellConfiguration initialName='empty'/>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- Simulation configuration -->
      <v-expansion-panel>
        <v-expansion-panel-header color="primary">Simulation configuration</v-expansion-panel-header>
        <v-expansion-panel-content color="primary">
          <v-row>
            <v-col cols="6">
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
import CellConfiguration from '@/components/CellConfiguration'

export default {

  components: {
    CellConfiguration
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
    },
    newSimulation () {
      this.$store.commit('simulations/new', {
        parameters: this.$store.getters['parameters/parameters']
      })
    }
  },

  mounted () {
    if (this.$store.getters['simulations/simulations'].length === 0) {
      this.newSimulation()
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
