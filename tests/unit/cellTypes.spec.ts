/*
- create store

- watch colorMap to add an entry to the array colorMaps
- check store content
- check colorMaps[0]
- clear store content
- check colorMaps[1]
- mount cellTypePanel
- check empty
- add 3 cell types
- check they exists in the component
- check colorMaps[2]
- updateColor call
- check component
- check colorMaps[3]
*/

import Vue from 'vue'
import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from 'vuetify';
import { cellTypes } from "@/store/cellTypes/index";
import CellTypePanel from "@/views/CellTypesPanel.vue";
import CellTypeConfig from "@/components/CellTypeConfig.vue";

// import { VTextField } from "vuetify/lib"

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);


let store = new Vuex.Store({
  modules: {
    cellTypes
  }
});

describe("CellTypePanel.vue", () => {

  it('contains by default 2 cell types', () => {
    const wrapper = shallowMount(CellTypePanel, { store, localVue })
    const ctConfigs = wrapper.findAllComponents(CellTypeConfig)

    expect(ctConfigs.length).toBe(2)

    expect(ctConfigs.at(0).props("id")).toBe(0)
    expect(ctConfigs.at(0).props("name")).toBe("Empty")
    expect(ctConfigs.at(0).props("color")).toBe("#000000")
    expect(ctConfigs.at(0).props("initialCount")).toBe(-1)

    expect(ctConfigs.at(1).props("id")).toBe(1)
    expect(ctConfigs.at(1).props("name")).toBe("Live")
    expect(ctConfigs.at(1).props("color")).toBe("#FFFFFF")
    expect(ctConfigs.at(1).props("initialCount")).toBe(100)

    // TODO: test the color update
    // store.commit("cellTypes/updateColor", { id: 1, color: "#123456" })
    // expect(ctConfigs.at(1).props("color")).toBe("#123456")
  });
});