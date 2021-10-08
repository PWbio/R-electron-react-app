const { contextBridge } = require("electron");

const getSysVersion = () => {
  let version = {};
  ["chrome", "node", "electron"].map((v) => (version[v] = process.versions[v]));
  return version;
};

contextBridge.exposeInMainWorld("preloadAPI", {
  sysVer: getSysVersion(),
});
