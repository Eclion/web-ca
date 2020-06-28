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
        initialCount: 500,
        distribution: {
          type: 'random'
        }
      }
    ],
    number_of_simulations: 1,
    number_of_steps: 20,
    version: 0
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
    },
    cellConfigurations: (state) => {
      return state.cell_types
    },
    cellConfiguration: (state) => (name) => {
      return state.cell_types.filter(cellDefinition => cellDefinition.name === name)[0]
    },
    dish_settings: (state) => {
      return state.dish_settings
    }
  },
  mutations: {
    fromJSON (state, jsonContent) {
      if (typeof (jsonContent) === 'string') {
        jsonContent = JSON.parse(jsonContent)
      }
      this.set(state, jsonContent)
    },
    // TODO: throw exception if missing param or ignore?
    setSimulationParameters (state, parameters) {
      state.number_of_simulations = parameters.number_of_simulations
      state.number_of_steps = parameters.number_of_steps
    },
    setDishSettings (state, dishSettings) {
      state.dish_settings = dishSettings
    },
    setCellParameters (state, cellTypes) {
      state.cell_types = cellTypes
    }
  }

  // load method
  // - fromJSON
  // save method
  // - toJSON

  // to decide:
  //  - getColorMap
}
