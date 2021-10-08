let mySocket;
document.addEventListener("DOMContentLoaded", (event) => {
  mySocket = new WebSocket("ws://127.0.0.1:8080");

  // Initialize client socket connection
  mySocket.onopen = (event) => {
    console.log("open socket");
  };

  // mySocket.onopen = (event) => {
  //   console.log("open socket 2");
  // };

  // Handle server message
  mySocket.onmessage = (event) => {
    // by default the return JSON from the server is in the 'data' property.
    const data = JSON.parse(event.data);

    // By our design, we stored parsed strings in the 'message' property
    console.log(data);
  };
});

// document.getElementById("button").addEventListener("click", () => {
//   const message = document.getElementById("sendText").value;
//   mySocket.send(JSON.stringify({ action: "uppercase", message }));
// });
