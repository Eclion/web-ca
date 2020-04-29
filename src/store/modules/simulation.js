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
      commit('resetGrid', {
        // TODO: move to the parameter store
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
            distribution: {
              type: 'random',
              count: 500
            }
          }
        ]
      })
      commit('setSimulationStatus', 'resetted')
    }
  },
  getters: {
    cells: (state) => {
      return state.grid.cells
    }
  }
}
