import CellType from "@/models/CellType";
import { Module } from "vuex";
import { CellTypeState } from "./types";
import { RootState } from "../types";
import RandomDistribution from "@/models/distributions/RandomDistribution";

export const cellTypes: Module<CellTypeState, RootState> = {
  namespaced: true,
  state: {
    cellTypes: Array<CellType>(
      new CellType(),
      new CellType({
        id: 1,
        name: "Live",
        color: "#FFFFFF",
        initialCount: 100,
        distribution: new RandomDistribution()
      } as CellType)
    )
  },
  getters: {
    all(state) {
      return state.cellTypes;
    },
    get(state) {
      return (id: number): CellType | undefined => {
        return state.cellTypes.filter(cellType => cellType.id === id)[0];
      };
    },
    colorMap(state) {
      return state.cellTypes.reduce(
        (colorMap, cellType) => ({
          ...colorMap,
          [cellType.id]: cellType.color
        }),
        {}
      );
    }
  },
  mutations: {
    add(state, cellType: CellType) {
      state.cellTypes.push(cellType);
    },
    update(state, cellType: CellType) {
      if (
        state.cellTypes
          .filter(_cellType => _cellType.id === cellType.id)
          .map(_cellType => cellType)[0] === undefined // TODO: use actions (for complex operations) rather mutations (which would be for simple operations then) ?
      ) {
        state.cellTypes.push(cellType);
      }
    },
    updateColor(state, data: { id: number; color: string }) {
      const cellType = state.cellTypes.filter(
        _cellType => _cellType.id === data.id
      )[0];

      const index = state.cellTypes.indexOf(cellType);

      state.cellTypes.splice(index, index + 1);

      cellType.color = data.color;
      state.cellTypes.push(cellType);
      state.cellTypes.sort((ct1, ct2) => ct1.id - ct2.id);
    },
    updateInitialCount(state, data: { id: number; initialCount: number }) {
      const cellType = state.cellTypes.filter(
        _cellType => _cellType.id === data.id
      )[0];

      const index = state.cellTypes.indexOf(cellType);

      state.cellTypes.splice(index, index + 1);

      cellType.initialCount = data.initialCount;
      state.cellTypes.push(cellType);
      state.cellTypes.sort((ct1, ct2) => ct1.id - ct2.id);
    }
  }
};
