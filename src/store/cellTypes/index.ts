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
    },
    names(state) {
      return state.cellTypes.map(ct => ct.name);
    },
    nameFromId: (state) => (id: number): string => {
      return state.cellTypes
        .filter(ct => ct.id === id)
        .map(ct => ct.name)
      [0];
    },
    idFromName: (state) => (name: string): number => {
      return state.cellTypes
        .filter(ct => ct.name === name)
        .map(ct => ct.id)
      [0];
    }
  },
  mutations: {
    add(state, cellType: CellType) {
      state.cellTypes.push(cellType);
    },
    new(state) {
      const newId = Math.max(0, ...state.cellTypes.map(ct => ct.id)) + 1;
      state.cellTypes.push(
        new CellType({
          id: newId,
          name: "Type " + newId,
          // https://stackoverflow.com/questions/1152024/best-way-to-generate-a-random-color-in-javascript/1152508
          color:
            "#" +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
          initialCount: 100,
          distribution: new RandomDistribution()
        } as CellType)
      );
    },
    delete(state, id: number) {
      const cellType = state.cellTypes.filter(
        _cellType => _cellType.id === id
      )[0];

      const index = state.cellTypes.indexOf(cellType);

      state.cellTypes.splice(index, 1);
      state.cellTypes.sort((ct1, ct2) => ct1.id - ct2.id);
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

      state.cellTypes.splice(index, 1);

      cellType.color = data.color;
      state.cellTypes.push(cellType);
    },
    updateInitialCount(state, data: { id: number; initialCount: number }) {
      const cellType = state.cellTypes.filter(
        _cellType => _cellType.id === data.id
      )[0];

      const index = state.cellTypes.indexOf(cellType);

      state.cellTypes.splice(index, 1);

      cellType.initialCount = data.initialCount;
      state.cellTypes.push(cellType);
    },
    replaceAll(state, cellTypes: Array<CellType>) {
      state.cellTypes = cellTypes;
    }
  }
};
