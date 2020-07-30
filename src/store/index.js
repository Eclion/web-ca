import Vue from 'vue'
import Vuex from 'vuex'
import simulations from './modules/simulations'
import displayedCells from './modules/cells'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    simulations, displayedCells
  }
})
