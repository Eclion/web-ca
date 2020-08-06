import Vue from 'vue'
import Vuex from 'vuex'
import simulations from './modules/simulations'
import displayedCells from './modules/cells'
import cellTypes from './modules/CellTypes'
import dimensions from './modules/Dimensions'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    simulations, displayedCells, cellTypes, dimensions
  }
})
