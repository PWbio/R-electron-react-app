#!/usr/bin/env bash

# This scripts is modified from github project https://github.com/dirkschumacher/r-shiny-electron.git
set -e
mkdir -p ../R/R-portable
cd ../R/R-portable

# Download the binary version of R. The download linked may be invalid in the future.
curl -o R.pkg https://cloud.r-project.org/bin/macosx/base/R-4.1.0.pkg 

# Decompress the R package
xar -xf R.pkg

# Remove unnecessary files. The file name may change in the future
rm -r R-app.pkg Resources tcltk.pkg texinfo.pkg Distribution R.pkg

# Extract R package content
cat R-fw.pkg/Payload | gunzip -dc | cpio -i
mv R.framework/Versions/Current/Resources/* .
rm -r R-fw.pkg R.framework

# Patch the main R script: Remove default R path. Instead, it will be supplied in the environment variable when spawning new R process via Node.
sed -i.bak '/^R_HOME_DIR=/d' bin/R
sed -i.bak 's;/Library/Frameworks/R.framework/Resources;${R_HOME};g' bin/R
chmod +x bin/R
rm -f bin/R.bak

# Remove unneccessary files
rm -r doc tests
rm -r lib/*.dSYM

