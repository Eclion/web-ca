<template>
  <v-card-text>{{this.text}}</v-card-text>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: '#FFFFFF'
    }
  },

  data () {
    return {
      // text: ''
    }
  }
}
</script>
