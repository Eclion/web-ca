<template>
  <v-app>
    <v-app-bar style="flex: 0 1 auto">
      <v-tabs v-model="tab">
        <v-tab>Model</v-tab>
        <v-tab>Papers</v-tab>
      </v-tabs>

      <v-switch
        v-model="$vuetify.theme.dark"
        hide-details
        inset
        label="Dark mode"
      ></v-switch>
      <v-btn href="https://github.com/Eclion/web-ca/" target="_blank" text>
        <v-icon large>mdi-github</v-icon>
      </v-btn>
    </v-app-bar>
    <v-container>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Model/>
      </v-tab-item>
      <v-tab-item>
        <PaperList/>
      </v-tab-item>
    </v-tabs-items>
    </v-container>
  </v-app>
</template>

<script>
import PaperList from '@/views/PaperList'
import Model from '@/views/Model'

export default {
  name: 'App',

  components: {
    Model, PaperList
  },

  data () {
    return {
      tab: null
    }
  }
}
</script>
