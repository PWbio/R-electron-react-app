import { useState, useEffect } from "react";
import Header from "./component/Header";
// import newConn from "./createWebsocket";

let socket;

const App = () => {
  const [text, setText] = useState("message from server ...");

  useEffect(() => {
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
  }, []);
  return (
    <>
      <Header />
      <button
        onClick={() => {
          socket.send(JSON.stringify({ action: "uppercase", message: "abc" }));
        }}
      >
        click
      </button>
      <button
        onClick={() => {
          socket.close();
        }}
      >
        close connection
      </button>
      <p>{text}</p>
    </>
  );
};

export default App;
