library(httpuv)
library(jsonlite)

args <- commandArgs(trailingOnly = TRUE) # receive args pass to Rscript command
# if (args[1] != "undefined") port <- as.integer(args[1])
port <- as.integer(args[1])


#' @description prevent R code to produce extra error and warning messages.
#' In R, warning messages are belong to stderr.
safeRun <- function(expr) { # record warnings and error. also prevent program stopping due to error.

  # Warning handling
  global.warnings <- NULL
  wHandler <- function(w) {
    global.warnings <<- c(global.warnings, w$message) # catch warnings and record
    invokeRestart("muffleWarning") # silent warnings
  }

  # Error handling
  global.error <- NULL
  eHandler <- function(e) {
    global.error <<- e$message # catch error
    NULL
  }

  # run the expression
  val <- NULL
  val <- tryCatch(withCallingHandlers(expr, warning = wHandler), error = eHandler) # "withCallingHandlers" get warnings, "tryCatch" get errors.

  return(list(value = val, warning = global.warnings, error = global.error))
}

#' @description create a blocking server
#' @references modified from R-package servr/static.R
#' @param app A named list of function for the server logic. The valid names can be found in httpuv docs. For "onWSOpen", the handler can be found in websocket docs.
start_server <- function(app) {
  server <- safeRun(
    startServer(host = "127.0.0.1", port = port, app, quiet = TRUE)
  )

  if (is.null(server$value)) {
    # failed to create server, return error message.
    message(paste(server$warning, collapse = "\n"))
    message(paste(server$error, collapse = "\n"))
  } else {
    cat("Create R Server Successfully.") # This string will be captured in node and serve as a signal to open app window.
    while (TRUE) {
      service() # check for callback cache (request from client)
      Sys.sleep(0.001) # every 0.001 sec
    }
  }
  NULL
}

serverFun <- list()
serverFun[["uppercase"]] <- function (message){
  text_parsed <- toupper(message) # Do some processing ...
  return(text_parsed)
}

invisible(start_server(app = list(
  onWSOpen = function(ws) {
    # The ws object is a WebSocket object
    cat("Server connection opened.")

    ws$onMessage(function(binary, req) {
      cat("Server received message:", req)
      
      # convert JSON to R list
      reqList <- fromJSON(req) 

      # if server logic is not exist, return not found      
      if (!reqList$action %in% names(serverFun)) {
        json <- toJSON(list(message = "Not found", status = '404'))
        ws$send(json)
        return()
      }
      
      run <- serverFun[[reqList$action]]
      
      res <- safeRun(run(reqList$message)) # the respond text is stored in "message"
      if (!is.null(res)) {
        print(res)
        json <- toJSON(list(message = res$value, status = '200')) # convert to JSON format
        ws$send(json) # send to client
      }
      
    })

    ws$onClose(function() {
      cat("Server connection closed.") # When ever an error occurs from parsing the request d
    })
  }
)))
