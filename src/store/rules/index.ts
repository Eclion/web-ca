import { Module } from "vuex";
import { RuleState } from "./types";
import { RootState } from "../types";
import Rule from "@/models/Rule.ts";

export const rules: Module<RuleState, RootState> = {
  namespaced: true,
  state: {
    rules: Array<Rule>(
      new Rule({
        id: 0,
        initialCellTypeId: 0,
        nextCellTypeId: 1,
        neighborCellTypeId: 1,
        neighborCount: 3,
        operator: "=="
      } as Rule),
      new Rule({
        id: 1,
        initialCellTypeId: 1,
        nextCellTypeId: 0,
        neighborCellTypeId: 1,
        neighborCount: 2,
        operator: "<"
      } as Rule),
      new Rule({
        id: 2,
        initialCellTypeId: 1,
        nextCellTypeId: 0,
        neighborCellTypeId: 1,
        neighborCount: 3,
        operator: ">"
      } as Rule)
    )
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
    },
    updateRule: (state, data: { id: number, key: string, value: any }) => {
      const rule = state.rules.filter(
        _rule => _rule.id === data.id
      )[0];

      const index = state.rules.indexOf(rule);
      state.rules.splice(index, 1);

      switch (data.key) {
        case "initialCellTypeId":
          rule.initialCellTypeId = data.value as number;
          break;
        case "neighborCellTypeId":
          rule.neighborCellTypeId = data.value as number;
          break;
        case "nextCellTypeId":
          rule.nextCellTypeId = data.value as number;
          break;
        case "neighborCount":
          rule.neighborCount = data.value as number;
          break;
        case "operator":
          rule.operator = data.value as string;
          break;
        default:
          break;
      }
      state.rules.push(rule);
    }
  }
};
