<template>
  <v-flex d-flex>
    <v-layout wrap>
      <v-flex v-for="item in papers" :key="item.title">
        <v-card class="card-container">
          <v-card-title
            ><a :href="item.url">{{ item.title }}</a></v-card-title
          >
          <v-card-subtitle>{{ item.authors.join(", ") }}</v-card-subtitle>
        </v-card>
      </v-flex>
    </v-layout>
  </v-flex>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class PapersPage extends Vue {
  name = "PaperList";

  papers = [
    {
      title:
        "Defining rules for cancer cell proliferation in TRAIL stimulation",
      authors: ["William Deveaux", "Kentaro Hayashi", "Kumar Selvarajoo"],
      publisher: "npjSystems Biology and Applications",
      url: "https://www.nature.com/articles/s41540-019-0084-5"
    }
  ];
}
</script>
