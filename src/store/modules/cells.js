export default {
  namespaced: true,
  state: {
    displayedCells: []
  },
  mutations: {
    set (state, data) {
      state.displayedCells[data.id].cells = data.cells
    }
  },
  getters: {
    get: (state) => (id) => {
      if (state.displayedCells[id] === undefined) {
        state.displayedCells.push({ cells: [] })
      }
      return state.displayedCells[id].cells
    }
  }
}
