<template>
  <v-container>
    <v-row align-content="center">
      <v-col>
      <MainControls/>
      </v-col>
    </v-row>
    <v-row align-content="center">
      <v-col cols=7>
      <Parameters/>
      </v-col>
      <v-col>
      <SimulationDisplay/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MainControls from '@/views/MainControls'
import Parameters from '@/views/Parameters'
import SimulationDisplay from '@/views/SimulationDisplay'

export default {
  components: {
    MainControls, Parameters, SimulationDisplay
  },

  data () {
    return {
    }
  }
}
</script>
