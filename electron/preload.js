const { contextBridge } = require("electron");
const varLoading = require("./preload/loading");
const varIndex = require("./preload/index");

renderHTML = location.href;

let apiContent;
if (/loading.html$/.test(renderHTML)) apiContent = varLoading;
else if (/index.html$|localhost:3000/.test(renderHTML)) apiContent = varIndex;

contextBridge.exposeInMainWorld("preloadAPI", {
  ...apiContent,
  port: process.env.SERVER_PORT,
});
