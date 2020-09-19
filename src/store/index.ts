import Vue from "vue";
import Vuex from "vuex";
import { displayedCells } from "./displayedCells/index";
import { cellTypes } from "./cellTypes/index";
import { dish } from "./dish/index";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    cellTypes, displayedCells, dish
  }
});
