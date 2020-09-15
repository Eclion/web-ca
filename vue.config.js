const WorkerPlugin = require("worker-plugin");

module.exports = {
  publicPath: "/web-ca/",
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    output: {
      globalObject: "this"
    },
    plugins: [new WorkerPlugin()]
  }
};
