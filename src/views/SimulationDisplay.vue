<template>
  <v-card color="primary">
    <v-card-text>Simulation display</v-card-text>
    <v-card-text>-tabs</v-card-text>
    <v-card-text>--container</v-card-text>
    <Simulation/>
  </v-card>
</template>

<script>
import Simulation from '@/components/Simulation'

export default {

  components: {
    Simulation
  }
}
</script>
