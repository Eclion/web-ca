<template>
  <v-card color="cyan">
    <v-card-text>Simulation display</v-card-text>
    <v-card-text>-tabs</v-card-text>
    <v-card-text>--container</v-card-text>
  </v-card>
</template>

<script>

export default {

  components: {
  },

  data () {
    return {
      cells: this.init()
    }
  }
}
</script>
