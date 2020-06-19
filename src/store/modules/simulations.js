export default {
  namespaced: true,
  state: {
    simulations: [
      {
        // parameters: this.getters['parameters/parameters']
        cells: []
      }
    ]
  },
  mutations: {
    setCells (state, data) {
      state.simulations[data.id].cells = data.cells
    }
  },
  getters: {
    cells: (state) => (id) => {
      return state.simulations[id].cells
    }
  }
}
