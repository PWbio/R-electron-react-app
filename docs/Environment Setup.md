# Initialize react app

```bash
# navigate to where you want to setup the app
cd project

# setup react project called "r-electron-react-app"
npx create-react-app r-electron-react-app
```

Note: use `npx` will first check if `create-react-app` (a npm package) is installed in your local machine. If not, it will download the latest version, execute `create-react-app` and delete the packages.

# Install dependencies

```bash
# devDependencies
yarn add -D electron concurrently wait-on cross-env electron-builder sass

# Dependencies
yarn add electron-is-dev
```

- `concurrently`: execute multiple command at the same time.
  ```bash
  "start": "concurrently \"command1 arg\" \"command2 arg\""
  ```
- `wait-on`: wait for a port to be opened.
- `cross-env`: painless way to set environment variable across OS platform.
  To prevent opening a browser, add `BROWSER=none` to environment variable. The variable can be read by `process.env.BROWSER` in node.

  ```json
  // This may work in mac and linux but not in window
  "start": "BROWSER=none react-scripts start"

  // The standard method in mac and linux
  "start": "export BROWSER=none && react-scripts start"

  // The standard method in window (CMD, not tested)
  // Note: no spacing before &&
  "start": "set BROWSER=none&& react-scripts start"

  // The standard method in window (Powershell, not tested)
  "start": "$env:BROWSER="none"; react-scripts start"

  // Using cross-env
  // Do not add && after environment variable
  "start": "cross-env BROWSER=none react-scripts start" // work
  "start": "cross-env BROWSER=none && react-scripts start" // not work
  ```

  Another way to pass environment variables is to create a `.env` file under your project folder.

  ```json
  .
  ├── README.md
  ├── electron
  ├── node_modules
  ├── package.json
  ├── public
  ├── src
  ├── yarn.lock
  └── .env // create file here
  ```

  And, add `BROWSER=none` in the file.

  ```json
  // .env
  BROWSER=none
  ```

- `electron-is-dev`: Check if Electron is running in development
- `electron-builder`: Build an installer and executable app.
- `sass`: A pre-processor that converts SCSS code to standard CSS.

# Package.json

### Basic app information

```json
"name": "r-electron-react-app",
"version": "0.1.0",
"description": "An Electron App powered by R backend with websocket API.",
"author": "PoWang",
```

### Entry point for electron app

```json
"main": "electron/main.js", // entry point for electron app
```

### Starting URL for index.html in React

```json
"homepage": "./", // path of project folder
```

### Scripts

Use `npm run <stage>` to [execute the command](https://docs.npmjs.com/cli/v7/commands/npm-run-script) in quote. `npm start` is an alias for `npm run start`. Alternatively, we can use `yarn start`. See [CLI command comparison](https://classic.yarnpkg.com/en/docs/migrating-from-npm) of `npm` and `yarn`.

```json
"scripts": {
    "start": "cross-env BROWSER=none react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "concurrently -k \"cross-env BROWSER=none yarn start\" \"wait-on tcp:3000 && electron .\"",
    "dist": "yarn build && electron-builder"
  }
```

- Add `dev` stage: we use concurrently to execute two subprocesses at the same time.

  1. `cross-env BROWSER=none yarn start`

     We first add a `BROWSER=none` environment variable and start the react app with `yarn start`.

  2. `wait-on tcp:3000 && electron .`

     Since our source files have not yet been compiled, we don't have any front-end page ready to be displayed in the electron app. Therefore, we need to wait for the webpack dev server to be ready and compiled the code in runtime. That's why we need to listening to the port 3000 (default port) before start an electron app.

- Add `dist` stage: Compile the react scripts and then run the `electron-builder` to create an installer according to your OS. [More information](https://www.electron.build/multi-platform-build).

### Fields required for electron-builder

```json
"build": {
    "extends": null,
    "appId": "com.electron.${name}",
    "mac": {
      "category": "public.app-category.developer-tools"
    },
    "files": [
      "build/**/*",
      "electron/**/*"
    ]
  }
```

- `build.files`: Control which files should include in your electron app. `node_modules` and `package.json` are included by default (development dependencies are never copied). `build/**/*` for React compiled folder. `electron/**/*` for electron app folder.
- [Detail information](https://www.electron.build/configuration/configuration#MetadataDirectories-buildResources) for each property using in `electron-builder`. More logic about file selection can be found [here](https://www.electron.build/configuration/contents#files).
