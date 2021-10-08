window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };
});

const getSysVersion = () => {
  let version = {};
  ["chrome", "node", "electron"].map((v) => (version[v] = process.versions[v]));

  return version;
};

const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("preloadAPI", {
  sysVer: getSysVersion(),
});
