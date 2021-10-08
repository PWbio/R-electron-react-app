const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const isDev = require("electron-is-dev");

app.enableSandbox();

/**
 * @description Client-side: Setup app's interface
 */
function createWindow() {
  //  Create app window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Preload script has access to both renderer (front-end) and node (backend) environment.
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // load HTML file to provide app's interface.
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open web developer tool window
  if (isDev) win.webContents.openDevTools();
}

/**
 * @description Server-side: create a websocket connection in R.
 */
let rServer;
const openServer = () => {
  const script = path.join(__dirname, "../R/server_httpuv.R");
  rServer = spawn("/usr/local/bin/Rscript", [script, __dirname]);

  rServer.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);

    // When server is created successfully, show app's window.
    if (data.toString() === "Create R Server Successfully.") createWindow();
  });

  rServer.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);

    // When lost connection to server due to script error in R.
    // CAUTION: R warning is stderr. So make sure to catch all warnings in R.
    if (BrowserWindow.getAllWindows().length !== 0)
      dialog.showErrorBox(
        "R-server Error",
        "Lose connection to R server. Please Refresh the page."
      );
  });

  rServer.on("close", (code) => {
    console.log(`child process exited with code ${code}`);

    // Failure on executing Rscript
    dialog.showErrorBox("R-server Error", "Failed to establish R server.");
  });
};

/**
 * @description Listening events on app module
 */
app.whenReady().then(() => {
  openServer();

  // On mac, the app may still run after closing app's window. So, we need to spawn a new window when clicking the dock icon.
  app.on("activate", function () {
    // Only open new window when (1) no exist window and (2) R-server is active.
    if (
      BrowserWindow.getAllWindows().length === 0 &&
      !rServer.stdout._readableState.closed
    )
      createWindow();
  });

  // Close Server when closing app
  app.on("will-quit", () => rServer.kill());
});

app.on("window-all-closed", function () {
  // Add a mac-style behaviour, where closing the window will not quit the app. Instead, the app is still running and shown in the dock.
  if (process.platform !== "darwin") app.quit();
});
