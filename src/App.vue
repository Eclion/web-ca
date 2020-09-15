<template>
  <v-app>
    <v-main>
      <v-row>
        <v-col cols="1" />
        <v-col cols="5">
          <Parameters />
        </v-col>
        <v-col cols="5">
          <Dish />
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Parameters from "@/views/Parameters.vue";
import Dish from "@/components/Dish.vue";

export default Vue.extend({
  name: "App",

  components: {
    Parameters,
    Dish
  },

  data: () => ({
    //
  })
});
</script>
