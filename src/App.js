import { useState, useEffect } from "react";
import Header from "./component/Header";
// import newConn from "./createWebsocket";

let socket;

const App = () => {
  const [text, setText] = useState("message from server ...");
  const newConn = () => {
    // specify port 0 if port is unavailable
    const port =
      window.preloadAPI.port === "undefined" ? "0" : window.preloadAPI.port;
    socket = new WebSocket(`ws://127.0.0.1:${port}`);
    socket.onmessage = (e) => {
      // by default the return JSON from the server is in the 'data' property.
      const data = JSON.parse(e.data);

      // By our design, we stored parsed strings in the 'message' property
      console.log(data);
      setText(data.message);
    };
  };

  useEffect(() => newConn(), []);
  return (
    <>
      <Header />
      <button
        onClick={() => {
          socket.send(JSON.stringify({ action: "uppercase", message: "abc" }));
        }}
      >
        send request
      </button>
      <button
        onClick={() => {
          socket.close();
        }}
      >
        close connection
      </button>
      <button
        onClick={() => {
          if ([3, 4].includes(socket.readyState)) {
            newConn();
            console.log("new connection");
          }
        }}
      >
        open connection
      </button>
      <button
        onClick={() => {
          console.log(socket.readyState);
        }}
      >
        socket state
      </button>
      <p>{text}</p>
    </>
  );
};

export default App;
