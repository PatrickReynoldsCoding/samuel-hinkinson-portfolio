import React, { useState, useEffect } from "react";

import "./pinball.css";
import { loadGame } from "./functions/loadGame";

export const Pinball = () => {
  const [canvasTag, setCanvasTag] = useState(null);

  useEffect(() => {
    setCanvasTag(document.getElementsByTagName("canvas")[0]);
    if (canvasTag) {
      console.log(canvasTag);
    } else {
      loadGame();
    }
  }, []);

  return (
    <div className="wrapper">
      <div className="top-face">
        <img src="../public/large-face-top.png" alt="" />
      </div>
      <div className="container">
        <div className="score current-score">
          score
          <br />
          <span></span>
        </div>
      </div>
    </div>
  );
};
