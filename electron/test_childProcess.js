const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const portfinder = require("portfinder");

let PORT;
portfinder.basePort = 1; // default: 8000
portfinder.highestPort = 1000; // default: 65535
// portfinder.getPort(function (err, port) {
//   console.log(err, port);
// });
portfinder
  .getPortPromise()
  .then((port) => {
    console.log(port);
  })
  .catch((err) => {
    console.error(err);
    dialog.showErrorBox(
      "R-server Error",
      "Lose connection to R server. Please Refresh the page."
    );
  });

const rHome = path.join(__dirname, "../R/R-portable");
const rPath = path.join(__dirname, "../R/R-portable/Rscript");
const rScript = path.join(__dirname, "../R/R-script/server_httpuv.R");

const rServer = spawn(rPath, [rScript], {
  env: {
    RHOME: rHome,
    R_HOME_DIR: rHome,
  },
});

rServer.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

rServer.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});
