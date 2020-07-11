<template>
  <!--
    expansion panel with name and color in header?
    https://vuetifyjs.com/en/components/expansion-panels/#advanced

    validation icon ?
  -->
  <v-expansion-panel color="primary">
    <v-expansion-panel-header color="primary">
      <v-col cols=2 style="padding:0">
      <v-text-field v-model="name" hide-details solo background-color="primary" flat :disabled="this.name === 'empty'" @click.stop></v-text-field>
      </v-col>
      <v-spacer/>
      <v-col cols=1 style="padding:0">

        <!--
          color picker: https://codepen.io/JamieCurnow/pen/KKPjraK?editors=1010
        -->
        <v-menu v-model="menu" top nudge-bottom="105" nudge-left="16" :close-on-content-click="false">
          <template v-slot:activator="{ on }">
            <div :style="swatchStyle" v-on="on" />
          </template>
          <v-card>
            <v-card-text class="pa-0">
              <v-color-picker v-model="color" flat background-color="primary" hide-inputs />
            </v-card-text>
          </v-card>
        </v-menu>
      </v-col>
      </v-expansion-panel-header>
    <v-expansion-panel-content color="primary">
  <v-row>

  </v-row>
  <v-row>
    <Rule
      v-for="rule in this.rules"
      v-bind:key="rule"
      v-bind:text="rule"
    />
  </v-row>
  <v-row v-if="this.name !== 'empty'">
    <v-col cols="6">
      <v-card-text>Number of cells:</v-card-text>
    </v-col>
    <v-col cols="2">
      <v-text-field type="number" v-model="initialCount"></v-text-field>
    </v-col>
  </v-row>
  <v-row v-if="this.name !== 'empty'">
    <v-col cols="6">
      <v-card-text>Cell distribution:</v-card-text>
    </v-col>
    <v-col cols="2">
      <!--
        menu dropdown
        + v-ifs
        -->
    </v-col>
  </v-row>
    </v-expansion-panel-content>
</v-expansion-panel>
</template>

<script>
import Rule from '@/components/Rule'

export default {

  components: {
    Rule
  },

  props: {
    id: {
      type: Number,
      default: 0
    },
    initialName: {
      type: String,
      default: ''
    },
    initialColor: {
      type: String,
      default: '#FFFFFF'
    }
  },

  data () {
    return {
      name: this.initialName,
      color: this.initialColor,
      rules: [],
      initialCount: 0,
      distribution: {
        type: 'random'
      },
      menu: false
    }
  },

  computed: {
    swatchStyle () {
      return {
        backgroundColor: this.color,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: '4px'
      }
    }
  },
  mounted () {
    var cellConfiguration = this.$store.getters['form/cellConfiguration'](this.initialName)
    this.color = cellConfiguration.color
    this.rules = cellConfiguration.rules
    this.initialCount = cellConfiguration.initialCount
    this.distribution = cellConfiguration.distribution
  }
}
</script>
