#' @author Adapted from Gihub repo: https://github.com/dirkschumacher/r-shiny-electron.git
#' @description Detect the libraries used in the R scripts. Download them and put in the portable R library path. This script is designed for Mac-only.
rScriptFolder <- "/Users/powang/r-electron-react-app/R/R-script"
rLibraryFolder <- "/Users/powang/r-electron-react-app/R/R-portable/library"
library(automagic)
options(repos = "https://cloud.r-project.org")

# Get file paths passed from Rscript command
args <- commandArgs(trailingOnly = TRUE)
rScriptFolder <- args[1]
rLibraryFolder <- args[2]

# Detect packages and dependencies
used_Pkgs <- get_dependent_packages(rScriptFolder)
depend_Pkgs <- unique(unlist(tools::package_dependencies(
  used_Pkgs,
  recursive = TRUE, which = c("Depends", "Imports", "LinkingTo")
)))

# Exclude existed packages
exist_Pkgs <- list.files(rLibraryFolder)
toBeInstalled_Pkgs <- setdiff(
  c(used_Pkgs, depend_Pkgs),
  c(exist_Pkgs, "automagic")
)

# Download packages
if (length(toBeInstalled_Pkgs) != 0) {
  download_temp <- tempdir()
  downloaded <- download.packages(
    toBeInstalled_Pkgs,
    destdir = download_temp, type = "mac.binary"
  )
}

# Decompress packages to target folder
apply(downloaded, 1, function(x) untar(x[2], exdir = rLibraryFolder))

# Remove downloaded packages
unlink(downloaded[, 2])

# Remove unnecessary file in pkgs
removeList <- c(
  "help", "doc", "tests", "html", "include", "unitTests",
  file.path("libs", "*dSYM")
)

for (lib_path in list.dirs(rLibraryFolder, full.names = TRUE, recursive = FALSE)) {
  unlink(file.path(lib_path, removeList), force = TRUE, recursive = TRUE)
}