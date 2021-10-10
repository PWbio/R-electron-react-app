const { ipcRenderer } = require("electron");

module.exports = {
  success: () => {
    ipcRenderer.send("websocket:connected");
  },
};
