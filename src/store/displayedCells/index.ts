import { Module } from "vuex";
import { CellGridState } from "./types";
import { RootState } from "../types";

export const displayedCells: Module<CellGridState, RootState> = {
  namespaced: true,
  state: {
    displayedCells: Array(100).fill(Array(100).fill(0))
  },
  getters: {
    get(state) {
      return state.displayedCells;
    }
  },
  mutations: {
    update(state, displayedCells) {
      state.displayedCells = displayedCells
    }
  }

}