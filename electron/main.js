const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const isDev = require("electron-is-dev");
const portfinder = require("portfinder");

app.enableSandbox();

/**
 * @description Search for free port to open R server
 */
// setting port 1~1000 to simulate error.
// portfinder.basePort = 1; // default: 8000
// portfinder.highestPort = 1000; // default: 65535
portfinder
  .getPortPromise()
  .then((port) => {
    process.env.SERVER_PORT = port;
  })
  .catch((err) => {
    process.env.SERVER_PORT = undefined;
  });

/**
 * @function createWindow Setup app's interface
 */
let win;
const createWindow = () => {
  //  Create app window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Preload script has access to both renderer (front-end) and node (backend) environment.
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // load HTML file to provide user interface.
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open web developer tool window
  if (isDev) win.webContents.openDevTools();
};

/**
 * @function openServer create R server via websocket.
 */
let rProc;
const openServer = () => {
  /**
   * @var {string} rHome path of R-portable folder
   * @var {string} rCommand path of Rscript CLI command
   * @var {string} rScript path of R script file for setting server.
   */
  const rHome = path.join(__dirname, "../R/R-portable");
  const rCommand = path.join(__dirname, "../R/R-portable/Rscript");
  const rScript = path.join(__dirname, "../R/R-script/server_httpuv.R");

  // Running r server in subprocess. Supply the environment variable "RHOME" and "R_HOME_DIR" is necessary to load the correct library. The additional arguments after rScript will be used inside R script.
  rProc = spawn(rCommand, [rScript, process.env.SERVER_PORT], {
    env: {
      RHOME: rHome,
      R_HOME_DIR: rHome,
    },
  });

  rProc.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);

    // When server is created successfully, show app's window.
    if (data.toString() === "Create R Server Successfully.") createWindow();
  });

  rProc.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);

    // When losing connection to server due errors raised from R, alert user.
    // NOTE: warning message in R is stderr. All warning should be captured to prevent this error prompt.
    if (BrowserWindow.getAllWindows().length !== 0)
      dialog.showErrorBox(
        "R-server Error",
        "Lose connection to R server. Please Refresh the page."
      );
  });

  rProc.on("close", (code) => {
    console.log(`child process exited with code ${code}`);

    // Failure on executing R subprocess
    dialog.showErrorBox("R-server Error", "Failed to establish R server.");
  });
};
//
/**
 * @description Listen events on app module
 */
app.whenReady().then(() => {
  if (process.env.SERVER_PORT === "undefined") {
    createWindow();
    dialog.showMessageBoxSync(win, {
      message: "Error: No available port to create server.",
    });
  } else openServer();

  // On mac, the app may still run after closing app's window. So, we need to spawn a new window when clicking the dock icon.
  app.on("activate", function () {
    // Only open new window when no window exist
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Close Server when closing app
  app.on("will-quit", () => rProc.kill());
});

app.on("window-all-closed", function () {
  // Add a mac-style behaviour, where closing the window will not quit the app. Instead, the app is still running and shown in the dock.
  if (process.platform !== "darwin") app.quit();
});
