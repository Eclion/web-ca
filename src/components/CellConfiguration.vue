<template>
  <!--
    expansion panel with name and color in header?
    https://vuetifyjs.com/en/components/expansion-panels/#advanced

    validation icon ?
  -->
  <v-card color="primary">
    <v-col>
  <v-row>
    <!--
      color picker: https://codepen.io/JamieCurnow/pen/KKPjraK?editors=1010
    -->
    <v-text-field v-model="name" hide-details solo background-color="primary" flat>
      <template v-slot:append>
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
      </template>
    </v-text-field>
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
    </v-col>
</v-card>
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
        borderRadius: this.menu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out'
      }
    }
  },
  mounted () {
    var cellConfiguration = this.$store.getters['parameters/cellConfiguration'](this.initialName)
    this.color = cellConfiguration.color
    this.rules = cellConfiguration.rules
    this.initialCount = cellConfiguration.initialCount
    this.distribution = cellConfiguration.distribution
  }
}
</script>
