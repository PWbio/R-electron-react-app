let socket;
document.addEventListener("DOMContentLoaded", (event) => {
  socket = new WebSocket("ws://127.0.0.1:8080");

  // Initialize client socket connection
  socket.onopen = (event) => {
    console.log("open socket");
  };

  // Handle server message
  socket.onmessage = (event) => {
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
