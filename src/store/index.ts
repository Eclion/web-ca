import Vue from "vue";
import Vuex from "vuex";
import { displayedCells } from "./displayedCells/index";
import { cellTypes } from "./cellTypes/index";
import { dish } from "./dish/index";
import { simulation } from "./simulation/index";
import { rules } from "./rules/index";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    cellTypes,
    displayedCells,
    dish,
    simulation,
    rules
  }
});
