import Vue from 'vue'
import Vuex from 'vuex'
import simulation from './modules/simulation'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    simulation
  }
})
