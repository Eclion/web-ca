export default {
  namespaced: true,
  state: {
    simulations: [ // TODO: POJO for parameters ?
      {
        id: 0,
        parameters: {
          version: 0,
          numberOfSteps: 20
        },
        displayedCells: [],
        state: 'stopped'
      }
    ]
  },
  mutations: {
    setCells (state, data) {
      state.simulations[data.id].displayedCells = data.displayedCells
    },
    setState (state, data) {
      state.simulations[data.id].state = data.state
    },
    setParameters (state, data) {
      var version = state.simulations[data.id].parameters.version
      state.simulations[data.id].parameters.dish_settings = data.parameters.dish_settings
      state.simulations[data.id].parameters.cell_types = data.parameters.cell_types
      state.simulations[data.id].parameters.number_of_simulations = data.parameters.number_of_simulations
      state.simulations[data.id].parameters.number_of_steps = data.parameters.number_of_steps
      state.simulations[data.id].parameters.version = version + 1
    }
  },
  getters: {
    displayedCells: (state) => (id) => {
      return state.simulations[id].displayedCells
    },
    state: (state) => (id) => {
      return state.simulations[id].state
    },
    simulations: (state) => {
      return state.simulations
    },
    parameters: (state) => (id) => {
      return state.simulations[id].parameters
    }
  }
}
