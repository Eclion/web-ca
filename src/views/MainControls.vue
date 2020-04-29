<template>
  <v-row>
    <v-col cols=6>
      profile subsection <br/>
      profile selection ("game of life", "custom", etc) <br/>
      <v-btn-toggle>
        <v-btn color="cyan" depressed>save</v-btn>
        <v-btn color="cyan" depressed>load</v-btn>
      </v-btn-toggle>
    </v-col>
    <v-spacer></v-spacer>
    <v-col cols=4>
      Process section <br/>
      <v-btn-toggle>
        <v-btn color="cyan" depressed>run</v-btn>
        <v-btn color="cyan" depressed>stop</v-btn>
        <v-btn color="cyan" depressed @click="test()">reset</v-btn>
      </v-btn-toggle>
    </v-col>
  </v-row>
  <!-- <v-card color="cyan">

  </v-card> -->
</template>

<script>

export default {
  components: {
  },

  methods: {
    test () {
      this.$store.dispatch('simulation/reset')
    }
  },

  data () {
    return {
    }
  }
}
</script>
