export default {
  namespaced: true,
  state: {
    dish_settings: {
      width: 100,
      height: 100,
      depth: 1
    },
    cell_types: [
      {
        name: 'empty',
        color: '#000000',
        rules: [
          'if live neighbors between 2 to 3, becomes live'
        ]
      },
      {
        name: 'live',
        color: '#FFFFFF',
        rules: [
          'if live neighbors less than 3, becomes empty, else live',
          'if neighbors more than 3, then empty, else live'
        ],
        distribution: {
          type: 'random',
          count: 500
        }
      }
    ],
    number_of_simulations: 1,
    number_of_steps: 20
  },
  getters: {
    parameters: (state) => {
      return state
    },
    json: (state) => {
      return ''
    },
    colorMap: (state) => {
      var colorMap = []
      for (var index in state.cell_types) {
        colorMap[index] = state.cell_types[index].color
      }
      return colorMap
    }
  },
  mutations: {
    fromJSON (state, jsonContent) {
      if (typeof (jsonContent) === 'string') {
        jsonContent = JSON.parse(jsonContent)
      }
      this.set(state, jsonContent)
    },
    set (state, parameters) {
      // TODO: throw exception if missing param or ignore?
      state.cell_types = parameters.cell_types
      state.dish_settings = parameters.dish_settings
      state.number_of_simulations = parameters.number_of_simulations
      state.number_of_steps = parameters.number_of_steps
    }
  }

  // load method
  // - fromJSON
  // save method
  // - toJSON

  // to decide:
  //  - getColorMap
}
