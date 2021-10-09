#!/usr/bin/env bash

# --- Install libraries for portable R ---
rScript_Path="$(cd ../R/R-script; pwd)"
rPortable_Library_Path="$(cd ../R/R-portable/library; pwd)"

# The Rscript here is from the system installed path, e.g., /usr/local/bin/Rscript, not the portable one we installed. Install R package "automagic" before running below commands.
Rscript --vanilla bundlePkgs.R "${rScript_Path}" "${rPortable_Library_Path}"