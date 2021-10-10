# Bundle portable R in electron app

We use Node `child_process` module to run R subprocess inside an electron main process. In order to execute R script, the `R program` and `pre-comiled libraries` are needed.

## Install R program

Run the `install_R_portable.sh` in the R-setup folder. This will download the executable R program under `..R/R-portable`

```
cd R-setup
sh install_R_portable.sh
```

To specify R version, change the downloading URL.

```
# change url
curl -o R.pkg https://cloud.r-project.org/bin/macosx/base/R-4.1.0.pkg
```

## Install R library

We will use R-packge `automagic` to detect libraries used in your R code. The binary version of the libraries are downloaded and placed inside `R/R-portable/library`

```
# install_R_library.sh
rScript_Path="$(cd ../R/R-script; pwd)" // your R codes
rPortable_Library_Path="$(cd ../R/R-portable/library; pwd)" // destination folder to put R library

# (...)
```

## Execute R script inside electron app

When using `electron-builder` to package the electron app, the files are archived in `asar` format. We need to unpack the R program and R script:

```
// package.json
"build": {
    "files": [
      "R/**/*"
    ],
    "asarUnpack": [
      "R/**/*"
    ]
```

and change the path from `app.asar` to `app.asar.unpacked`. Here we used `electron-util`:

```
// example
const { fixPathForAsarUnpack } = require("electron-util");

const rHome = fixPathForAsarUnpack(path.join(__dirname, "../R/R-portable"));
const rCommand = fixPathForAsarUnpack(
path.join(__dirname, "../R/R-portable/Rscript")
);
const rScript = fixPathForAsarUnpack(
path.join(__dirname, "../R/R-script/server_httpuv.R")
);
```
