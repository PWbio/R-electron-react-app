const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const isDev = require("electron-is-dev");
const portfinder = require("portfinder");
const { fixPathForAsarUnpack } = require("electron-util"); // fix path of unpacked asar file, e.g., R binary. Basically, it replaces file path that contain 'app.asar' to 'app.asar.unpacked'.

// app.enableSandbox();

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
};

/**
 * @function switchPage load HTML page into app's window
 * @param {str} page "loading", "error", or "index"
 */
const switchPage = (page) => {
  if (page === "loading") {
    // starting page
    win.loadFile(
      isDev
        ? path.join(__dirname, "../public/loading.html")
        : path.join(__dirname, "../build/loading.html")
    );
  } else if (page === "error") {
    // R server fail (no port found or subprocess fail)
    win.loadFile(
      isDev
        ? path.join(__dirname, "../public/error.html")
        : path.join(__dirname, "../build/error.html")
    );
  } else if (page === "index") {
    // Actual page for user interface
    win.loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    );
  }

  // Open web developer tool window
  if (isDev) win.webContents.openDevTools();
};

/**
 * @function openServer create R server via websocket.
 * @var {str} rHome path of R-portable folder
 * @var {str} rCommand path of Rscript CLI command
 * @var {str} rScript path of R script file for setting server.
 */
const openServer = (port) => {
  const rHome = fixPathForAsarUnpack(path.join(__dirname, "../R/R-portable"));
  const rCommand = fixPathForAsarUnpack(
    path.join(__dirname, "../R/R-portable/Rscript")
  );
  const rScript = fixPathForAsarUnpack(
    path.join(__dirname, "../R/R-script/server_httpuv.R")
  );

  // Running r server in subprocess. Supply the environment variable "RHOME" and "R_HOME_DIR" is necessary to load the correct library. The additional arguments after rScript will be used inside R script.
  const rProc = spawn(rCommand, [rScript, port], {
    env: {
      RHOME: rHome,
      R_HOME_DIR: rHome,
    },
  });

  rProc.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  rProc.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);

    // When errors raised from R server, alert user.
    // NOTE: warning message in R is stderr. All warning should be captured to prevent this error prompt.
    if (BrowserWindow.getAllWindows().length !== 0)
      dialog.showErrorBox("R-server Error", `${data}`);
  });

  rProc.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    switchPage("error");
    // Failure on executing R subprocess
    dialog.showErrorBox("R-server Error", "Failed to establish R server.");
  });

  // Close Server when closing app
  app.on("will-quit", () => rProc.kill());
};
//
/**
 * @description Listen events on app module
 */
app.whenReady().then(() => {
  // -- Search for free port to open R server --
  // set port 1~1000 to simulate port not found.
  // portfinder.basePort = 1; // default: 8000
  // portfinder.highestPort = 1000; // default: 65535
  portfinder.getPort((err, port) => {
    process.env.SERVER_PORT = port; // assign port to env variables, and get the port in preload.js
    createWindow(); // IMPORTANT!! pass the port number before launching window
    switchPage("loading");

    if (port) {
      openServer(port);
    } else {
      switchPage("error");
      dialog.showMessageBox(win, {
        message: "Error: No available port to create server.",
      });
    }
  });
});

// On mac, the app may still run after closing app's window. So, we need to spawn a new window when "clicking the dock icon".
app.on("activate", function () {
  // Only open new window when no window exist
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", function () {
  // Add a mac-style behaviour, where closing the window will not quit the app. Instead, the app is still running and shown in the dock.
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("websocket:connected", () => switchPage("index"));
