<template>
    <div>
        <label>{{ label }}</label>
        <p>
            <input
                    class="input"
                    type="text"
                    :id="id"
                    :placeholder="label"
                    :value="value"
                    :required="required"
                    v-on:input="updateValue($event.target.value)">
        </p>
    </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: String
    },
    required: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    updateValue: function (value) {
      // this.$emit('input', value)
    }
  }
}
</script>
