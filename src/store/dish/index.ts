import { Module } from "vuex";
import { DishState } from "./types";
import { RootState } from "../types";

export const dish: Module<DishState, RootState> = {
  namespaced: true,
  state: {
    width: 100,
    height: 100,
    depth: 1
  },
  getters: {
    dimensions(state) {
      return {
        width: state.width,
        height: state.height,
        depth: state.depth
      };
    }
  },
  mutations: {
    setWidth(state, width: number) {
      state.width = width;
    },
    setHeight(state, height: number) {
      state.height = height;
    },
    setDepth(state, depth: number) {
      state.depth = depth;
    }
  }
};
