export default {
  namespaced: true,
  state: {
    dimensions: []
  },
  mutations: {
    set (state, data) {
      if (state.dimensions[data.simulationId] === undefined) {
        state.dimensions.push({
          width: data.width,
          height: data.height,
          depth: data.depth
        })
      } else {
        state.dimensions[data.simulationId].width = data.width
        state.dimensions[data.simulationId].height = data.height
        state.dimensions[data.simulationId].depth = data.depth
      }
    }
  },
  getters: {
    get: (state) => (simulationId) => {
      return state.dimensions[simulationId]
    }
  }
}
