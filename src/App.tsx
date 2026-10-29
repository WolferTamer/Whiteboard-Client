import "./App.css";
import CodeEntry from "./CodeEntry";
import { useEffect, useState } from "react";
import CanvasController from "./CanvasController";
import { socket } from "./socket";

function App() {
  const [code, setCode] = useState<null | string>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [disabled, setDisabled] = useState(false);

  function onCodeChanged(v: string) {
    socket.emit("joinroom", v);
    setError(`Attemping to join room "${v}"...`);
    setDisabled(true);
    setTimeout(() => {
      setDisabled(false);
      if (!code) {
        setError("Unable to join room.");
      }
    }, 5_000);
  }

  useEffect(() => {
    var timeout: number | undefined;
    function onConnect() {
      setConnected(true);
      console.log("connected");
      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function onDisconnect() {
      setConnected(false);
      console.log("disconnected");

      const onTimeout = () => {
        console.log(connected);
        if (!connected) {
          setCode(null);
          setError("You timed out, try again later.");
        }
      };

      timeout = setTimeout(onTimeout, 5_000);
    }

    function onJoin(code: string) {
      setCode(code);
      setError(null);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("joinsuccess", onJoin);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("joinsuccess", onJoin);
    };
  }, []);

  return (
    <>
      <section id="center">
        {code ? (
          <CanvasController connected={connected} />
        ) : (
          <CodeEntry
            onCodeSubmitted={onCodeChanged}
            error={error}
            disabled={disabled}
          />
        )}
      </section>
    </>
  );
}

export default App;
