export default {
  namespaced: true,
  state: {
    displayedCells: []
  },
  mutations: {
    set (state, data) {
      if (state.displayedCells[data.simulationId] === undefined) {
        state.displayedCells.push({ cells: data.cells })
      } else {
        state.displayedCells[data.simulationId].cells = data.cells
      }
    }
  },
  getters: {
    get: (state) => (simulationId) => {
      if (state.displayedCells[simulationId] === undefined) {
        state.displayedCells.push({ cells: [] })
      }
      return state.displayedCells[simulationId].cells
    }
  }
}
