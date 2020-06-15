import { Grid } from '@/model/grid'

export default {
  namespaced: true,
  state: {
    status: 'resetted',
    grid: new Grid()
  },
  mutations: {
    setSimulationStatus (state, status) {
      state.status = status
    },
    resetGrid (state, parameters) {
      state.grid.init(parameters)
    }
  },
  actions: {
    start (context) {
      context.commit('setSimulationStatus', 'running')
    },
    stop (context) {
      context.commit('setSimulationStatus', 'stopped')
    },
    reset ({ commit, state }) {
      commit('resetGrid', this.getters['parameters/parameters'])
      commit('setSimulationStatus', 'resetted')
    }
  },
  getters: {
    cells: (state) => {
      return state.grid.cells
    }
  }
}
