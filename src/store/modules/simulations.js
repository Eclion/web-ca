export default {
  namespaced: true,
  state: {
    simulations: [] // TODO: POJO for parameters ?
  },
  mutations: {
    setState (state, data) {
      state.simulations[data.id].state = data.state
    },
    setParameters (state, data) {
      var version = state.simulations[data.id].parameters.version
      state.simulations[data.id].parameters.number_of_simulations = data.parameters.number_of_simulations
      state.simulations[data.id].parameters.number_of_steps = data.parameters.number_of_steps
      state.simulations[data.id].parameters.version = version + 1
    },
    new (state, data) {
      state.simulations.push({
        id: state.simulations.length,
        parameters: data.parameters,
        state: 'stopped'
      })
      // state.count = state.count + 1
    }
  },
  getters: {
    state: (state) => (id) => {
      return state.simulations[id].state
    },
    simulations: (state) => {
      return state.simulations
    },
    simulationCount: (state) => {
      return state.count
    },
    parameters: (state) => (id) => {
      return state.simulations[id].parameters
    }
  }
}
