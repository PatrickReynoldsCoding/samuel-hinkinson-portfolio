import { useState, useEffect } from "react";

import "./App.css";

import { Pinball } from "./pages/Pinball";

function App() {
  return (
    <div className="App">
      <Pinball />
      <div className="wrapper">
        <div className="top-face">
          <img src="../public/large-face-top.png" alt="" />
        </div>
        <div className="container" id="pinball"></div>
      </div>
    </div>
  );
}

export default App;
