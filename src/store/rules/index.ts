import { Module } from "vuex";
import { RuleState } from "./types";
import { RootState } from "../types";
import Rule from "@/models/Rule.ts";

export const rules: Module<RuleState, RootState> = {
  namespaced: true,
  state: {
    rules: Array<Rule>(new Rule({ id: 1 } as Rule))
    /*
      0: [
        n => (n[1] === 3) ? 1 : 0
      ],
      1: [
        n => (n[1] < 2) ? 0 : 1,
        n => (n[1] > 3) ? 0 : 1
      ]
    */
  },
  getters: {
    all(state) {
      return state.rules;
    }
  },
  mutations: {
    new(state) {
      const newId = Math.max(0, ...state.rules.map(rule => rule.id)) + 1;
      state.rules.push(
        new Rule({
          id: newId
        } as Rule)
      );
    },
    delete(state, id: number) {
      const rule = state.rules.filter(_rule => _rule.id === id)[0];

      const index = state.rules.indexOf(rule);

      state.rules.splice(index, 1);
    },
    replaceAll(state, rules: Array<Rule>) {
      state.rules = rules;
    }
  }
};
