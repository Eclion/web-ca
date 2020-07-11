import Vue from 'vue'
import Vuex from 'vuex'
import form from './modules/form'
import simulations from './modules/simulations'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    form,
    simulations
  }
})
