export default {
  namespaced: true,
  state: {
    cellTypes: []
  },
  mutations: {
    set (state, data) {
      if (state.cellTypes[data.simulationId] === undefined) {
        state.cellTypes.push(data.cellTypes)
      } else {
        state.cellTypes[data.simulationId] = data.cellTypes
      }
    }
  },
  getters: {
    get: (state) => (simulationId) => {
      if (state.cellTypes[simulationId] === undefined) {
        state.cellTypes.push([])
      }
      return state.cellTypes[simulationId]
    }
  }
}
