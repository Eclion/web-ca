import { Module } from "vuex";
import { SimulationState } from "./types";
import { RootState } from "../types";

export const simulation: Module<SimulationState, RootState> = {
  namespaced: true,
  state: {
    stepCount: 20,
    remainingStepCount: 20,
    status: "init"
  },
  mutations: {
    setStepCount(state, stepCount: number) {
      state.remainingStepCount += stepCount - state.stepCount;
      state.stepCount = stepCount;
      if (state.remainingStepCount <= 0) state.status = "stopped";
    },
    setStatus(state, status: string) {
      state.status = status;
      if (status === "init") state.remainingStepCount = state.stepCount;
    },
    decrementStepCount(state) {
      state.remainingStepCount -= 1;
      if (state.remainingStepCount <= 0) state.status = "stopped";
    }
  }
};
