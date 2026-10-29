import "./App.css";
import CodeEntry from "./CodeEntry";
import { useEffect, useState } from "react";
import CanvasController from "./CanvasController";
import { socket } from "./socket";

function App() {
  const [code, setCode] = useState<null | string>(null);
  const [connected, setConnected] = useState(false);

  function onCodeChanged(v: string) {
    socket.emit("joinroom", v);
    setCode(v);
  }

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      console.log("connected");
    }

    function onDisconnect() {
      setConnected(false);
      console.log("disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <>
      <section id="center">
        {code ? (
          <CanvasController />
        ) : (
          <CodeEntry onCodeSubmitted={onCodeChanged} />
        )}
      </section>
    </>
  );
}

export default App;
