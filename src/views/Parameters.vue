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
          <CellConfiguration
            v-for="cellType in this.cellTypes"
            v-bind:key=cellType.name
            :initialConfig=cellType
            v-on:updateCellType="updateCellType"
          />
          </v-expansion-panels>
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
      initialCellDistribution: 'Normal Random',
      cellTypes: [
        {
          id: 0,
          name: 'empty',
          color: '#000000',
          rules: [
            'if live neighbors between 2 to 3, becomes live'
          ]
        },
        {
          id: 1,
          name: 'live',
          color: '#FFFFFF',
          rules: [
            'if live neighbors less than 3, becomes empty, else live',
            'if neighbors more than 3, then empty, else live'
          ],
          initialCount: 500,
          distribution: {
            type: 'random'
          }
        }
      ],
      rules: []
    }
  },

  methods: {
    apply () {
      var parameters = {
        id: 0, // TODO: this.simulationTab,
        parameters: {
          dish_settings: {
            width: this.dishWidth,
            height: this.dishHeight,
            depth: this.dishDepth
          },
          cell_types: this.cellTypes,
          number_of_simulations: 1,
          number_of_steps: this.numberOfSteps,
          version: 0
        }
      }
      this.$store.commit('simulations/setParameters', parameters)
    },
    newSimulation () {
      this.$store.commit('simulations/new', {
        parameters: {
          dish_settings: {
            width: parseInt(this.dishWidth),
            height: parseInt(this.dishHeight),
            depth: parseInt(this.dishDepth)
          },
          cell_types: this.cellTypes,
          number_of_simulations: 1,
          number_of_steps: parseInt(this.numberOfSteps),
          version: 0 // TODO: remove
        }
      })
    },
    updateCellType (cellType) {
      this.cellTypes[cellType.id] = cellType
    }
  },

  mounted () {
    if (this.$store.getters['simulations/simulations'].length === 0) {
      this.newSimulation()
    }
  }
}
</script>
