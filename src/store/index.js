import Vue from 'vue'
import Vuex from 'vuex'
import parameters from './modules/parameters'
import simulations from './modules/simulations'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    parameters,
    simulations
  }
})
