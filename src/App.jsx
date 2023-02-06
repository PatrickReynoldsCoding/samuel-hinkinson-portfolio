import { useState, useEffect } from "react";

import "./App.css";

import Pinball from "./pages/Pinball";

function App() {
  const [gameHasMounted, setGameHasMounted] = useState(false);

  // useEffect(() => {
  //   setGameHasMounted(true);
  // }, []);

  return <div className="App">{gameHasMounted ? null : <Pinball />}</div>;
}

export default App;
