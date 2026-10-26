import "./App.css";
import CodeEntry from "./CodeEntry";
import { useState } from "react";
import CanvasController from "./CanvasController";

function App() {
  const [code, setCode] = useState<null | string>(null);

  function onCodeChanged(v: string) {
    setCode(v);
  }

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
