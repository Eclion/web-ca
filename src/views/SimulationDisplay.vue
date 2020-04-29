<template>
  <v-card color="cyan">
    <v-card-text>Simulation display</v-card-text>
    <v-card-text>-tabs</v-card-text>
    <v-card-text>--container</v-card-text>
    <!-- <DishDisplay>
      <DishContent/>
    </DishDisplay> -->
    <Dish/>
  </v-card>
</template>

<script>
// import DishDisplay from './DishDisplay'
// import DishContent from './DishContent'
import Dish from '@/components/Dish'

export default {

  components: {
    Dish
    // DishContent, DishDisplay
  },

  data () {
    return {
      cells: []
    }
  }
}
</script>
