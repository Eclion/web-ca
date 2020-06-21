export default {
  namespaced: true,
  state: {
    simulations: [
      {
        id: 0,
        parameters: {},
        cells: [],
        state: 'stopped'
      }
    ]
  },
  mutations: {
    setCells (state, data) {
      state.simulations[data.id].cells = data.cells
    },
    setState (state, data) {
      state.simulations[data.id].state = data.state
    },
    setParameters (state, data) {
      state.simulations[data.id].parameters = data.parameters
    }
  },
  getters: {
    cells: (state) => (id) => {
      return state.simulations[id].cells
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
